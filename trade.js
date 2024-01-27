var inputEl;
var rankingsInputEl;
var greenListEl;
var redListEl;
var tableEl;

//Standard deviation of player values to calculate trade result
var standardDev;

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
let ovrRanks = [];
let posRanks = [];

async function getPlayerData(){
    const dataRes = await fetch("https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1");
    const data = await dataRes.json();

    playerNames = data.map((x) => {
        return x.player.name;
    });

    playerValues = data.map((x) => {
        return x.value;
    });

    ovrRanks = data.map((x) => {
        return x.overallRank;
    });

    posRanks = data.map((x) => {
        return x.positionRank;
    });

    getStandardDeviation();
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
            if (playerName.toLowerCase().indexOf(value) > -1){
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
    rankingsBtn = document.querySelector("#rankings-btn");
    rankingsBtn.addEventListener("click", openRankings);
    exitBtn = document.querySelector("#exit-btn");
    exitBtn.addEventListener("click", onExit);
    rankingsInputEl = document.querySelector("#rankings-input");
    rankingsInputEl.addEventListener("input",updateTable);
    tableEl = document.querySelector("#rankings-table");
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
        document.querySelector("#green-wrapper").appendChild(greenListEl);
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
        document.querySelector("#red-wrapper").appendChild(redListEl);
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
    diff = redValue - greenValue;

    if(Math.abs(diff)>(standardDev/2)){
        if(diff>0){
            resultEl.innerHTML = "You should accept the trade offer!";
            return;
        }
        if(diff<0){
            resultEl.innerHTML = "You should reject the trade offer.";
            return;
        }
    }

    if(diff>0){
        resultEl.innerHTML = "The trade seems fair.<br/>You gain " + diff + " value.";
        return;
    }
    if(diff<0){
        resultEl.innerHTML = "The trade seems fair.<br/>You lose " + Math.abs(diff) + " value.";
        return;
    }

    //Gets here if both sides are the same (impossible in actual trade)
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

    //Populate the table
    for(let x = 0; x<playerNames.length; x++){
        const tableEntry = document.createElement("tr");
        const ovrEntry = document.createElement("td");
        ovrEntry.innerHTML = ovrRanks[x];
        const posEntry = document.createElement("td");
        posEntry.innerHTML = posRanks[x];
        const nameEntry = document.createElement("td");
        nameEntry.innerHTML = playerNames[x];
        const valueEntry = document.createElement("td");
        valueEntry.innerHTML = playerValues[x];
        tableEntry.appendChild(ovrEntry);
        tableEntry.appendChild(posEntry);
        tableEntry.appendChild(nameEntry);
        tableEntry.appendChild(valueEntry);
        document.querySelector("#rankings-table").appendChild(tableEntry);
    }

}

function onExit(){
    document.getElementById("rankings-div").style.display = "none";
}

function updateTable(){
    var filter, tr, td;
    //const input = document.getElementById("#rankings-input");
    filter = rankingsInputEl.value.toLowerCase();
    //var tableEl = document.getElementById("#rankings-table");
    tr = tableEl.getElementsByTagName("tr");

    for(let x=1; x<tr.length; x++){
        td = tr[x].getElementsByTagName("td")[2];
        if(td){
            if(td.innerHTML.toLowerCase().indexOf(filter) > -1){
                tr[x].style.display = "";
            }
            else{
                tr[x].style.display = "none";
            }
        }
    }
}

function getStandardDeviation(){
    let mean = playerValues.reduce((prev,curr) => {
        return prev + curr;
    },0) / playerValues.length;

    let newValues = playerValues.map((x) => {
        return (x - mean)**2
    });

    let sum = newValues.reduce((prev,curr) => prev + curr,0);

    standardDev = Math.sqrt(sum/playerValues.length);
}