 const getLocationStringFor = (aPart) => {
        let result = "";
        let currentPart = aPart;
        let currentOwner = aPart._owner;
        while(currentOwner){
            let indexInParent = currentOwner.subparts.filter((subpart) => {
                return subpart.type == currentPart.type;
            }).indexOf(currentPart) + 1;
            result += `${currentPart.type} ${indexInParent} of `;
            currentPart = currentPart._owner;
            currentOwner = currentOwner._owner;
        }
        result += 'this world';
        return result;
}


const onLocationLinkClick = (event) => {
        let text = event.currentTarget.querySelector('span').textContent;
        let input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.opacity = 0;
        document.body.append(input);
        let currentFocus = document.activeElement;
        input.focus();
        input.value = text;
        console.log(input.value);
        input.select();
        document.execCommand('copy');
        input.remove();
        currentFocus.focus();
}

export {
    getLocationStringFor,
    onLocationLinkClick
};
