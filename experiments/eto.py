import argparse
import lance
import pyarrow as pa
import numpy as np
import pandas as pd
import math
import openai
import ratelimiter
import os
import sys

from datasets import load_dataset
from retry import retry
from tqdm.auto import tqdm
from lance.vector import vec_to_table
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def to_batches(arr, batch_size, df_len):
    length = len(arr)

    def _chunker(arr):
        for start_i in range(0, df_len, batch_size):
            yield arr[start_i:start_i+batch_size]
    # add progress meter
    yield from tqdm(_chunker(arr), total=math.ceil(length / batch_size))


@retry(tries=10, delay=1, max_delay=30, backoff=3, jitter=1)
def embed_func(c):
    embed_model = "text-embedding-ada-002"
    rs = openai.Embedding.create(input=c, engine=embed_model)
    return [record["embedding"] for record in rs["data"]]


class Eto:
    def __init__(self, data_dir="./data", openai_key_path=".openai_api_key",
                 openai_org_id_path=".openai_org_id", lance_data="chatbot.lance"):
        self.data_dir = data_dir
        self.lance_data = os.path.join(self.data_dir, lance_data)
        self.ds = None
        # make sure there is an openAI API key file
        if not os.path.isfile(openai_key_path):
            print("NO openAI API key file found - exiting!")
            sys.exit()
        openai.api_key_path = openai_key_path
        if os.path.isfile(openai_org_id_path):
            org_id = open(openai_org_id_path).read().strip()
            openai.organization = org_id
        else:
            print("No openAI org ID found, this might be necessary")
        self.setup()

    def setup(self):
        if os.path.isdir(self.lance_data):
            print("\nlance dataset found... loading...")
            self.ds = lance.dataset(self.lance_data)
        else:
            print("\nbuilding lance dataset")
            print("lading youtube transcriptions data\n")
            data = load_dataset('jamescalam/youtube-transcriptions', split='train')
            data.to_pandas().title.nunique()

            window = 20
            stride = 4

            print("\npreparing data")
            df = self.contextualize(data.to_pandas(), window, stride)

            # API limit at 60/min == 1/sec
            limiter = ratelimiter.RateLimiter(max_calls=0.9, period=1.0)

            print("getting the embedding with retry")

            rate_limited = limiter(embed_func)
            # We request in batches rather than 1 embedding at a time
            batch_size = 1000
            batches = to_batches(df.text.values.tolist(), batch_size, len(df))
            embeds = [emb for c in batches for emb in rate_limited(c)]

            table = vec_to_table(np.array(embeds))
            combined = pa.Table.from_pandas(df).append_column(
                "vector", table["vector"]
            )
            print("writing lance dataset to %s" % self.lance_data)
            ds = lance.write_dataset(combined, self.lance_data)
            self.ds = ds.create_index("vector",
                                    index_type="IVF_PQ",
                                    num_partitions=64,  # IVF
                                    num_sub_vectors=96)  # PQ
        print("setup successful\n")
        return True

    def answer(self, query):  # TODO answer or query?
        emb = embed_func(query)[0]
        context = self.ds.to_table(
            nearest={
                "column": "vector",
                "k": 3,
                "q": emb,
                "nprobes": 20,
                "refine_factor": 100
            }).to_pandas()
        prompt = self.create_prompt(question, context)
        return self.complete(prompt), context.reset_index()

    def contextualize(self, raw_df, window, stride):
        def process_video(vid):
            # For each video, create the text rolling window
            text = vid.text.values
            time_end = vid["end"].values
            contexts = vid.iloc[:-window:stride, :].copy()
            contexts["text"] = [' '.join(text[start_i:start_i+window])
                                for start_i in range(
                                        0, len(vid)-window, stride)
                                ]
            contexts["end"] = [time_end[start_i+window-1]
                               for start_i in range(0, len(vid)-window, stride)
                               ]
            return contexts
        # concat result from all videos
        return pd.concat(
            [process_video(vid) for _, vid in raw_df.groupby("title")]
        )

    def complete(self, prompt):
        # query text-davinci-003
        res = openai.Completion.create(
            engine='text-davinci-003',
            prompt=prompt,
            temperature=0,
            max_tokens=400,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )
        return res['choices'][0]['text'].strip()

    def create_prompt(self, query, context):
        limit = 3750

        prompt_start = (
            "Answer the question based on the context below.\n\n" +
            "Context:\n"
        )
        prompt_end = (
            f"\n\nQuestion: {query}\nAnswer:"
        )
        # append contexts until hitting limit
        for i in range(1, len(context)):
            if len("\n\n---\n\n".join(context.text[:i])) >= limit:
                prompt = (
                    prompt_start +
                    "\n\n---\n\n".join(context.text[:i-1]) +
                    prompt_end
                )
                break
            elif i == len(context)-1:
                prompt = (
                    prompt_start +
                    "\n\n---\n\n".join(context.text) +
                    prompt_end
                )
        return prompt


eto = Eto()

@app.route("/eto/search", methods=["GET"])
def eto_search():
    query = request.args.get("q")
    print(query)
    completion, context = eto.answer(query)
    response = {"completion": completion, "top_match": context.iloc[0]}
    return make_response(jsonify(response), 200)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    app_group = parser.add_argument_group("app_args", "Application arguments")
    server_group = parser.add_argument_group("server_args", "Server arguments")
    server_group.add_argument("-dbg", "--debug", action="store_true",
                              default=False, help="Run in Flask debug mode")
    args = parser.parse_args()
    debug = args.debug
    del args.debug  # TODO what?
    app.run(host='0.0.0.0', debug=debug)
