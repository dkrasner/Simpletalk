const merriam = {
    name: "MerriamAPI",
    load: function(url){
        this.src = url;
        return true;
    },
    response: null,
    cache: null,
    cacheNextItem: null,
    currentResponseItemIndex: -1,
    src: null,
    get: async function(prerequisite, arg){
        if(arg){
            if(!this.cache){
                throw Error("No result has been fetched");
            }
            if(arg == "next"){
                let results = this.cache.results;
                this.currentResponseItemIndex += 1;
                if(this.currentResponseItemIndex >= results.length){
                    this.currentResponseItemIndex = 0;
                }
                this.response = this.cache.results[this.currentResponseItemIndex];
                // put the result in the next item cache
                this.cacheNextItem = this.cache.results[this.currentResponseItemIndex];
                return JSON.stringify(this.response, null, '\t');
            }
            // here we assume that the arg is a key in the next item cache
            this.response = this.cacheNextItem[arg];
            return this.response;
        }
        const payload = parsePrerequisite(prerequisite);
        const params = {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify(payload)
        };
        let response = await fetch(this.src, params);
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            let json = await response.json();
            this.response = json;
            this.cache = json;
            return JSON.stringify(this.response, null, '\t');
        } else {
            console.error("HTTP-Error: " + response.status);
            return false;
        };
    }
}


let parsePrerequisite = (p) => {
    let pList = p.split(";");
    let payload = {};
    pList.forEach((item) => {
        let key = item.split(":")[0];
        let value = item.replace(`${key}:`, "");
        switch(key){
        case "fields":
            payload["fields"] = value.split(',');
            break;
        case "weights":
            let weights = {};
            value.split(",").forEach((w) => {
                let [w_name, w_value] = w.split(":");
                weights[w_name] = Number(w_value);
            });
            payload["weights"] = weights;
            break;
        case "doc_ids":
            payload["doc_ids"] = value.split(",");
            break;
        case "limit":
            payload["limit"] = Number(value);
            break;
        }
    });
    return payload;
}


export {
    merriam,
    merriam as default
};
