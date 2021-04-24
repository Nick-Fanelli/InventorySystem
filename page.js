var PartsLookup = {
    0: ["First Part", 10],
    1: ["Second Part", 20]
};

var PartsListsElements = [];
var SelectedPartsListElements = [];

const LoginName = document.getElementById("login-name");
const PartSearch = document.getElementById("part-search");
const PartsList = document.querySelector("#main-section ul");
const SelectedPartsList = document.querySelector("#change-list ul");

function addPartToSelectedList(part, element) {
    let partID = part.getAttribute("part-id");
    let quantity = part.getAttribute("part-quantity");
    let name = part.getAttribute("part-name");

    let selectedPart = generateSelectedPartsListPart(partID, quantity, name);

    SelectedPartsListElements.push(selectedPart);
    element.innerHTML = "Remove";
    element.classList.add("remove");

    SelectedPartsList.appendChild(selectedPart);
}

function removePartFromSelectedList(parent, index, element) {
    let selectedPart = SelectedPartsListElements[index];

    SelectedPartsList.innerHTML = SelectedPartsList.innerHTML.toString().replace(selectedPart.outerHTML, "");

    // console.log(selectedPart.outerHTML);

    SelectedPartsListElements.splice(index, 1);
    element.innerHTML = "Add";
    element.classList.remove("remove");
}

function closeSelectedPart(element) {
    let parent = element.parentElement;
    let partID = parent.getAttribute("part-id");

    let selectedInventoryPart = null;

    for(part in PartsListsElements) {
        if(PartsListsElements[part].getAttribute("part-id") == partID) {
            selectedInventoryPart = PartsListsElements[part];
            break;
        }
    }

    if(selectedInventoryPart == null) {
        console.error("Selected Inventory Part came back null! :(");
        return;
    }

    SelectedPartsList.removeChild(parent);

    selectedInventoryPart.children[1].innerHTML = "Add";
    selectedInventoryPart.children[1].classList.remove("remove");

    let removeIndex;

    SelectedPartsListElements.forEach(function(item, index) {
        if(item == parent) {
            removeIndex = index;
            return;
        }
    });

    SelectedPartsListElements.splice(removeIndex, 1);
}

function incrementChangeCount(element) {
    let name = element.parentElement.parentElement.querySelector(".name");
    let counter = element.parentElement.querySelector(".count");

    let currentCount = Number.parseInt(counter.innerHTML) + 1;
    counter.innerHTML = currentCount;

    if(currentCount > 0) {
        counter.classList.remove("negative")
        counter.classList.add("positive");

        name.classList.remove("negative");
        name.classList.add("positive");
    } else if(currentCount < 0) {
        counter.classList.remove("positive");
        counter.classList.add("negative");

        name.classList.remove("positive");
        name.classList.add("negative");
    } else {
        counter.classList.remove("negative");
        counter.classList.remove("positive");

        name.classList.remove("negative");
        name.classList.remove("positive");
    }
}

function decrementChangeCount(element) {
    let name = element.parentElement.parentElement.querySelector(".name");
    let counter = element.parentElement.querySelector(".count");

    let currentCount = Number.parseInt(counter.innerHTML) - 1;
    counter.innerHTML = currentCount;

    if(currentCount > 0) {
        counter.classList.remove("negative")
        counter.classList.add("positive");

        name.classList.remove("negative");
        name.classList.add("positive");
    } else if(currentCount < 0) {
        counter.classList.remove("positive");
        counter.classList.add("negative");

        name.classList.remove("positive");
        name.classList.add("negative");
    } else {
        counter.classList.remove("negative");
        counter.classList.remove("positive");

        name.classList.remove("negative");
        name.classList.remove("positive");
    }
}

/* Clears and loads full parts list */
function loadPartsList() { 
    PartsList.innerHTML = ""; 
    PartsListsElements = [];

    for(part in PartsLookup) {
        let partID = part;
        let partName = PartsLookup[part][0];
        let partQuantity = PartsLookup[part][1];

        let partElement = generatePartsListsPart(partID, partQuantity, partName, false);
        addPartToPartsList(partElement);
    }
}

/* Adds a given part to the parts list */
function addPartToPartsList(part) { 
    PartsList.appendChild(part); 
    PartsListsElements.push(part);
}

/* Creates a formatted part for the main parts list */
function generatePartsListsPart(partID, quantity, name, added) {
    let element = document.createElement("li");
    element.setAttribute("part-name", name);
    element.setAttribute("part-id", partID);
    element.setAttribute("part-quantity", quantity);

    let data = `
    <p>${name}</p>
    <button ${added ? "class='remove'" : ""}>${added ? "Remove" : "Add"}</button>
    `;

    element.innerHTML = data;

    return element;
}

function generateSelectedPartsListPart(partID, quantity, name) {
    let element = document.createElement("li");
    element.setAttribute("part-name", name);
    element.setAttribute("part-id", partID);
    element.setAttribute("part-quantity", quantity);

    let data = `
        <p class="name">${name}</p>
        <div>
            <p class="fa fa-minus" onclick="decrementChangeCount(this);"></p>
            <p class="count">0</p>
            <p class="fa fa-plus" onclick="incrementChangeCount(this);"></p>
        </div>
        <p class="fa fa-times-circle close-btn" onclick="closeSelectedPart(this);"></p>
    `

    element.innerHTML = data;

    return element;
}

function bindPartsListButtons() {
    let buttons = document.querySelectorAll("#main-section ul li button");

    buttons.forEach(function(element) {
        element.onclick = function() {
            let parent = element.parentElement;
            let index = -1;

            SelectedPartsListElements.forEach(function(part, i) {
                if(part.getAttribute("part-id") == parent.getAttribute("part-id")) { index = i; return; }
            });

            if(index == -1) {
                addPartToSelectedList(parent, element);
            } else {                
                removePartFromSelectedList(parent, index, element);
            }
        }
    });
}

/* Window load function aka. main function */
window.addEventListener('load', function() {

    loadPartsList(); // Load the parts list
    bindPartsListButtons(); // Bind the add and remove parts list buttons

});
