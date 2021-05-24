const test = {
    name: "TestAPI",
    load: function(url){
        this.src = url;
        return true;
    },
    response: null,
    src: null,
    get: async function(prerequisite, key){
        if(key){
            if(!this.response){
                throw Error("No result has been fetched");
            }
            return this.response[key];
        }
        let src = this.src;
        if(prerequisite){
            src = src + "/" + prerequisite;
        }
        let response = await fetch(src);
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            let json = await response.json();
            this.response = json;
            return JSON.stringify(json);
        } else {
            console.error("HTTP-Error: " + response.status);
            return false;
        };
    },
};

export {
    test,
    test as default
};
