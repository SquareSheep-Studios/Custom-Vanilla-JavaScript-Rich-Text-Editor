var editor = document.querySelector("#editor");
var commands = document.querySelectorAll(".command");

var commandMacros = {
    u: "H1",
    b: "H2",
    l: "LI",
    q: "A",
    i: "IMG"
}

editor.addEventListener("keydown", function(event) {
    if(event.key in commandMacros && event.ctrlKey) {
        event.preventDefault();
        executeEditorCommand(commandMacros[event.key]);
    }
});

editor.addEventListener("input", function(event) {
    if(editor.childNodes.length = 1 && editor.childNodes[0].nodeType == Node.TEXT_NODE)
        updateNode(0);

    for(i = 0; i < editor.childNodes.length; i++)   
        if(editor.childNodes[i].nodeName == "DIV" && editor.childNodes[i].textContent != "")
            updateNode(i);
});

function updateNode(i) {
    var newParagraph = document.createElement("p");
    newParagraph.innerHTML = editor.childNodes[i].textContent;
    editor.childNodes[i].parentNode.replaceChild(newParagraph, editor.childNodes[i]);

    var range = document.createRange();
    var selection = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

for(i = 0; i < commands.length; i++) {
    commands[i].addEventListener("onmousedown", function(event) {
        event.preventDefault();
    });
}

function executeEditorCommand(type) {
    var selection = window.getSelection();
    var selectionNode =  selection.getRangeAt(0).commonAncestorContainer;

    if(selection.anchorNode && editor.contains(selectionNode)) {
        if(type === "H1" || type === "H2") {
            var elementToEdit = selectionNode.parentNode;
            if(elementToEdit.tagName != type) {
                var newHeading = document.createElement(type);
                newHeading.innerHTML = selectionNode.parentNode.textContent;                

                if(elementToEdit.parentNode.nodeName == "DIV") {
                    elementToEdit.parentNode.replaceChild(newHeading, elementToEdit);
                } else if(elementToEdit.parentNode.nodeName == "UL") {
                    removeFromList(type, true);
                } else if(elementToEdit.parentNode.nodeName != "BODY") {
                    elementToEdit.parentNode.parentNode.insertBefore(newHeading, elementToEdit.parentNode.nextSibling);
                    elementToEdit.parentNode.parentNode.removeChild(elementToEdit.parentNode);
                }
            } else {
                var newParagraph = document.createElement("p");
                newParagraph.innerHTML = selectionNode.parentNode.textContent;
                elementToEdit.parentNode.replaceChild(newParagraph, elementToEdit);            
            }
        }

        if(type === "LI") {
            var elementToEdit = selectionNode.parentNode;
            if(elementToEdit.tagName != type) {
                if(elementToEdit.parentNode.nodeName == "DIV") {
                    var ul = document.createElement("ul");
                    var newHeading = document.createElement("li");
                    newHeading.innerHTML = selectionNode.parentNode.textContent;
                    ul.appendChild(newHeading);
                    elementToEdit.parentNode.replaceChild(ul, elementToEdit);
                }
            } else {
                if(selectionNode.parentNode.parentNode.childNodes.length > 1) {
                    if(selectionNode.parentNode.parentNode.childNodes[selectionNode.parentNode.parentNode.childNodes.length - 1].isSameNode(selectionNode.parentNode)) {
                        var newParagraph = document.createElement("p");
                        newParagraph.innerHTML = selectionNode.parentNode.textContent;
                        selectionNode.parentNode.parentNode.parentNode.insertBefore(newParagraph, selectionNode.parentNode.parentNode.nextSibling);
                        elementToEdit.parentNode.removeChild(elementToEdit);
                    } else
                        removeFromList("p", true);
                } else {
                    var newParagraph = document.createElement("p");
                    newParagraph.innerHTML = selectionNode.parentNode.textContent;
                    elementToEdit.parentNode.parentNode.replaceChild(newParagraph, selectionNode.parentNode.parentNode);
                }
            }
        }

        if(type === "A") {
            var elementToEdit = selectionNode.parentNode;

            if(elementToEdit.tagName != type) {
                if(elementToEdit.tagName == "P") {
                    var addLink = true;
                    var baseIndex, extentIndex;
    
                    for(i = 0; i < selectionNode.childNodes.length; i++) {
                        if(selectionNode.childNodes[i].isSameNode(selection.baseNode) || selectionNode.childNodes[i].isSameNode(selection.baseNode.parentNode))
                            baseIndex = i;
    
                        if(selectionNode.childNodes[i].isSameNode(selection.extentNode) || selectionNode.childNodes[i].isSameNode(selection.extentNode.parentNode))
                            extentIndex = i;
                    }
    
                    for(i = baseIndex; i <= extentIndex; i++)
                        if(selectionNode.childNodes[i].tagName == type)
                            addLink = false;
    
                    if(addLink) {
                        var href = prompt("Enter external link...");
    
                        if(href != null) {
                            var newAnchor = document.createElement("a");
                            newAnchor.innerHTML = selectionNode.textContent.substring(selection.getRangeAt(0).startOffset, selection.getRangeAt(0).endOffset);                            
                            newAnchor.href = href;

                            var beforeText = document.createTextNode(selectionNode.textContent.substring(0, selection.getRangeAt(0).startOffset));
                            var afterText = document.createTextNode(selectionNode.textContent.substring(selection.getRangeAt(0).endOffset, selectionNode.textContent.length));
        
                            selectionNode.parentNode.replaceChild(beforeText, selectionNode);
                            beforeText.parentNode.insertBefore(newAnchor, beforeText.nextSibling);
                            newAnchor.parentNode.insertBefore(afterText, newAnchor.nextSibling);
                        }
                    } else {
                        var anchors = [];                    
    
                        for(i = baseIndex; i < extentIndex + 1; i++)
                            if(selectionNode.childNodes[i].tagName == type)
                                anchors.push(selectionNode.childNodes[i]);
    
                        for(i = 0; i < anchors.length; i++) {
                            var node = document.createTextNode(anchors[i].textContent);
                            anchors[i].parentNode.replaceChild(node, anchors[i]);
                            node.parentNode.normalize();
                        }
                    }
                }
            } else {
                var node = document.createTextNode(selectionNode.textContent);

                for(i = 0; i < selectionNode.parentNode.childNodes.length; i++)
                    if(selectionNode.parentNode.childNodes[i].isSameNode(selectionNode)) {
                        elementToEdit.parentNode.replaceChild(node, elementToEdit);
                        node.parentNode.normalize();
                    }
            }
        }

        if(type === "IMG") {            
            var src = prompt("Enter image link...");

            if(src != null) {
                var newImage = document.createElement("img");
                newImage.alt = prompt("Describe the image...");
                newImage.src = src;

                if(selectionNode.nodeName == "DIV") {
                    selectionNode.appendChild(newImage)
                } else if(selectionNode.parentNode.parentNode.nodeName == "UL") {
                    removeFromList(newImage, false);
                } else {                
                    selectionNode.parentNode.insertBefore(newImage, selectionNode.nextSibling);
                    selectionNode.parentNode.removeChild(selectionNode);
                }
            }
        }
    }

    function removeFromList(element, createNewElement) {
        var index = null;
        for(i = 0; i < selectionNode.parentNode.parentNode.childNodes.length; i++)
            if(selectionNode.parentNode.parentNode.childNodes[i].isSameNode(selectionNode.parentNode))
                index = i;

        var afterList = [];
        for(i = index + 1; i < selectionNode.parentNode.parentNode.childNodes.length; i++)
            afterList[i] = selectionNode.parentNode.parentNode.childNodes[i];   
        afterList.splice(0, index + 1)

        for(i = 0; i < selectionNode.parentNode.parentNode.childNodes.length; i++)
            for(j = 0; j < afterList.length; j++)
                if(selectionNode.parentNode.parentNode.childNodes[i].isSameNode(afterList[j]))
                    selectionNode.parentNode.parentNode.removeChild(selectionNode.parentNode.parentNode.childNodes[i])

        var afterUl = document.createElement("ul");
        var newLis = [];
        for(i = 0; i < afterList.length; i++) {
            newLis[i] = document.createElement("li");
            newLis[i].textContent = afterList[i].textContent;
            afterUl.appendChild(newLis[i]);
        }
        selectionNode.parentNode.parentNode.parentNode.insertBefore(afterUl, selectionNode.parentNode.parentNode.nextSibling);

        if(createNewElement) {
            var newElement = document.createElement(element);
            newElement.textContent = selectionNode.parentNode.parentNode.childNodes[index].textContent;
            selectionNode.parentNode.parentNode.parentNode.insertBefore(newElement, selectionNode.parentNode.parentNode.nextSibling);
            selectionNode.parentNode.parentNode.removeChild(selectionNode.parentNode.parentNode.childNodes[index]);            
        } else {
            selectionNode.parentNode.parentNode.parentNode.insertBefore(element, selectionNode.parentNode.parentNode.nextSibling);
            selectionNode.parentNode.parentNode.removeChild(selectionNode.parentNode.parentNode.childNodes[index]);
        }
    }
}

function sanitizePaste(event) {
    event.stopPropagation();
    event.preventDefault();

    var clipboardData = event.clipboardData || window.clipboardData;
    var pastedData = clipboardData.getData('Text');

    var newParagraph = document.createElement("p");
    newParagraph.innerHTML = pastedData;

    selection = window.getSelection().getRangeAt(0);
    selectionNode = window.getSelection().getRangeAt(0).commonAncestorContainer;

    if(selectionNode.id == "editor") {
        var startIndex, endIndex = null;
        for(i = 0; i < selectionNode.childNodes.length; i++) {
            if(selectionNode.childNodes[i].isSameNode(selection.startContainer.parentNode))
                startIndex = i;
            if(selectionNode.childNodes[i].isSameNode(selection.endContainer.parentNode))
                endIndex = i;
        }

        for(i = startIndex; i <= endIndex; i++)
            selectionNode.removeChild(selectionNode.childNodes[i]);

        if(selectionNode.childNodes.length > 0)
            if(selectionNode.childNodes[startIndex - 1].nextSibling)
                selectionNode.insertBefore(newParagraph, selectionNode.childNodes[startIndex - 1].nextSibling);
            else
                selectionNode.appendChild(newParagraph)
        else
            editor.appendChild(newParagraph);
    } else if(selectionNode.parentNode.id == "editor") {
        selectionNode.parentNode.replaceChild(newParagraph, selectionNode);
    } else {
        selectionNode.parentNode.parentNode.replaceChild(newParagraph, selectionNode.parentNode);
    }
}

editor.addEventListener('paste', sanitizePaste);