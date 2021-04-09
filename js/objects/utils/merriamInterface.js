const merriamSimScore = async (sender, docId) => {
    const url = "https://patents.merriamtech.com/_api/merriam/"
    const payload = {
        "fields": [
            "title",
            "date_publ"
        ],
        "weights": {
            "merriam":0.7,
            "date":0.3,
            "hierarchy":0.1
        },
        "doc_ids": [
            docId
        ],
        "limit": 5}
    const params = {
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "body": JSON.stringify(payload)
    }
    fetch(url, params).then(data => {
        return data.json();
    }).then(json => {
        const msg = {
            type: 'command',
            commandName: 'merriamresult',
            args: [
                JSON.stringify(json)
            ]
        };
        sender.sendMessage(msg, sender);
    });
}

export {
    merriamSimScore,
    merriamSimScore as default
};
