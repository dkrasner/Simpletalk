const test = {
    name: "TestAPI",
    load: function(url){
        this.endpoint = url;
        return true;
    },
    result: null,
    endpoint: null,
    get: async function(){
        let response = await fetch(this.endpoint);
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            let json = await response.json();
            this.result = json;
            console.log(JSON.stringify(json));
            return JSON.stringify(json);
        } else {
            console.error("HTTP-Error: " + response.status);
        }
    },
}

export {
    test,
    test as default
};
