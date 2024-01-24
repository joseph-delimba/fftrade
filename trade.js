var inputEl;
var greenListEl;
var redListEl;

//On first player, must create a ul AND li
//Afterwards, only need to add li
var redFirst = true;
var greenFirst = true;

//Trade values for each side of the trade
var redValue = 0;
var greenValue = 0;

getPlayerData();

let playerNames = [];
let playerValues = [];

async function getPlayerData(){
    const dataRes = await fetch("https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1");
    const data = await dataRes.json();

    playerNames = data.map((x) => {
        return x.player.name;
    });

    playerValues = data.map((x) => {
        return x.value;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    inputEl = document.querySelector("#autocomplete-input");
    inputEl.addEventListener("input", () => {
        removeDropdown();

        const value = inputEl.value.toLowerCase();

        if(value.length === 0) return;

        const filteredNames = [];

        let result_amount = 0;

        playerNames.forEach((playerName) => {
            if(result_amount > 4) {return;}
            if (playerName.substr(0,value.length).toLowerCase() === value){
                filteredNames.push(playerName);
                result_amount++;
            }
        });
        createDropdown(filteredNames);
    });
    greenBtn = document.querySelector("#send-btn");
    greenBtn.addEventListener("click", onGreenClick);
    redBtn = document.querySelector("#receive-btn");
    redBtn.addEventListener("click", onRedClick);
    resetBtn = document.querySelector("#reset-btn");
    resetBtn.addEventListener("click", onReset);
    // rankingsBtn = document.querySelector("#rankings-btn");
    // rankingsBtn.addEventListener("click", openRankings);
});

function createDropdown(list){
    const listEl = document.createElement("ul");
    listEl.className = "autocomplete-list";
    listEl.id = "autocomplete-list";

    list.forEach((player) => {
        const listItem = document.createElement("li");
        const playerButton = document.createElement("button");
        playerButton.innerHTML = player;
        playerButton.addEventListener("click",onPlayerClick);
        listItem.appendChild(playerButton)
        listEl.appendChild(listItem)
    });

    document.querySelector("#autocomplete-wrapper").appendChild(listEl);
}

function removeDropdown(){
    const listEl = document.querySelector("#autocomplete-list");
    if(listEl) listEl.remove();
}

function onPlayerClick(e){
    e.preventDefault();

    const buttonEl = e.target;
    inputEl.value = buttonEl.innerHTML;

    removeDropdown();
}

function onGreenClick(e){
    e.preventDefault();

    let result = checkInput(inputEl.value);

    inputEl.value = '';

    if(result==-1){
        window.alert("Please enter a valid player.");
        return;
    }

    if(greenFirst){
        //Create the ul and set greenFirst to false
        greenListEl = document.createElement("ul");
        greenListEl.className = "teamgreen-ul";
        greenListEl.id = "teamgreen-ul";
        document.querySelector("#green-wrapper").appendChild(greenListEl)
        greenFirst = false;
    }

    //Create the li and add it to the green ul
    const greenListItem = document.createElement("li");
    greenListItem.innerHTML = playerNames[result];
    greenListEl.appendChild(greenListItem)

    //Add the value of the player added to the trade
    greenValue += playerValues[result];

    updateResult();
}

function onRedClick(e){
    e.preventDefault();

    let result = checkInput(inputEl.value);

    inputEl.value = '';

    if(result==-1) {
        window.alert("Please enter a valid player.");
        return;
    }

    if(redFirst){
        //Create the ul and set greenFirst to false
        redListEl = document.createElement("ul");
        redListEl.className = "teamred-ul";
        redListEl.id = "teamred-ul";
        document.querySelector("#red-wrapper").appendChild(redListEl)
        redFirst = false;
    }

    //Create the li and add it to the green ul
    const redListItem = document.createElement("li");
    redListItem.innerHTML = playerNames[result];
    redListEl.appendChild(redListItem)

    //Add the value of the player added to the trade
    redValue += playerValues[result];

    updateResult();
}

function checkInput(inputString){
    let found = false;
    index = 0;
    result = -1;
    playerNames.forEach((playerName) => {
        if(inputString === playerName) {
            found = true;
            result = index;
        }
        index++;
    });
    return result;
}

function updateResult(){
    resultEl = document.querySelector("#final-result");
    if(redValue<greenValue){
        resultEl.innerHTML = "You should reject the trade offer.";
        return;
    }
    if(greenValue<redValue){
        resultEl.innerHTML = "You should accept the trade offer!";
        return;
    }
    resultEl.innerHTML = "Invalid trade.";
}

function onReset(e){
    e.preventDefault();
    removeDropdown();
    const greenList = document.querySelector("#teamgreen-ul");
    if(greenList){
        greenList.remove();
        greenFirst = true;
    }
    const redList = document.querySelector("#teamred-ul");
    if(redList){
        redList.remove();
        redFirst = true;
    }
    const resultText = document.querySelector("#final-result");
    if(resultText) resultText.innerHTML = "The current trade is empty.";
    redValue = 0;
    greenValue = 0;
    inputEl.value = '';
}

function openRankings(){
    document.getElementById("rankings-div").style.display = "block";
}