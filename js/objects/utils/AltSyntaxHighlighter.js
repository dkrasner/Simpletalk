/** Second pass at syntax highlighter semantics **/
const syntaxSpan = (ruleName) => {
    let span = document.createElement('span');
    span.classList.add('st-syntax');
    span.setAttribute('data-st-rule', ruleName);
    return span;
}

const createHighlighter = (fieldElement) => {
    return {
        MessageHandlerOpen: function(literalOn, messageName, optionalParamList){
            let span = syntaxSpan("MessageHandlerOpen");
            let onSpan = syntaxSpan("keyword");
            onSpan.append("on ");
            span.append(onSpan);

            // Append sub-rules
            span.append(messageName.highlightSyntax());
            span.append(...optionalParamList.highlightSyntax());

            return span;
        },

        MessageHandlerClose(literalEnd, messageName){
            let span = syntaxSpan("MessageHandlerClose");
            let endSpan = syntaxSpan("keyword");
            endSpan.append("end ");
            span.append(endSpan);

            // Add the parts
            span.append(messageName.highlightSyntax());

            return span;
        },

        ParameterList: function(paramString){
            let outer = syntaxSpan("ParameterList");
            let innerItems = paramString.asIteration().children.map(paramName => {
                let span = syntaxSpan("ParameterList-item");
                span.append(paramName.sourceString);
                return span.outerHTML;
            });
            outer.innerHTML = innerItems.join(", ");
            return outer;
            
        },

        messageName: function(string){
            let span = document.createElement('span');
            span.classList.add('st-syntax');
            span.setAttribute('data-st-rule', 'messageName');
            span.append(string.sourceString + " ");
            return span;
        },

        keyword: function(string){
            let span = document.createElement('span');
            span.classList.add('st-syntax');
            span.setAttribute('data-st-rule', 'keyword');
            span.append(string.sourceString);
            return span;
        }
    };
};

export {
    createHighlighter,
    createHighlighter as default
};
