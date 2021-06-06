import * as Common from "./common.mjs";

var currentRanking = [];
var currentData = [];

var pageSize = 5;
var page = 0;

var maxPages = 0;

var pageBestPlayers = 0;

var rankingAmount = 100;
var rankingPage = 0;

var worstRanking = false;


document.getElementById("getData").onclick = getBestPlayers;
document.getElementById("left").onclick = left;
document.getElementById("right").onclick = right;

document.getElementById("left").disabled = true;
document.getElementById("right").disabled = true;
document.getElementById("currentPage").innerHTML = "0 / 0";

document.getElementById("searchID").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("getData").click();
  }
});

window.onload = function() {
 getPlayerStats();
};

function getBestPlayers(e)
{
  var rankingAmount = document.getElementById("searchID").value;

  var url = "http://localhost:25565/accounts/top/?amount=" + rankingAmount + "&skip=" + rankingPage * rankingAmount;

  if(worstRanking) url += "&bottom=true";

  $.get(url, function(data, status){

    currentRanking = data.currentRanking;

    page = 0;
    rankingPage = 0;

    maxPages = Math.trunc(currentRanking.length / pageSize);

    refreshBestPlayers();
  }).done(function() {
    Common.informError(document.getElementById("PlayerError"), "");
    
    document.getElementById("tableDiv").hidden = false;
  }).fail(function() {
    Common.informError(document.getElementById("PlayerError"), "Error: could not retrieve data");
    
    document.getElementById("tableDiv").hidden = true ;
    document.getElementById("table").innerHTML = "";
  });
}

function getPlayerStats(){
  var url = "http://localhost:25565/accounts/data";
  $.get(url, function(data, status){
    currentData = data.data.characterInfo;
    refreshCharacterData();

    getCharacterStatistics(); //Llamada a winrate despues de obtener los datos
  }).done(function() {
  }).fail(function() {
  }); 
}

function left(e)
{
  page--;

  refreshBestPlayers();
}

function right(e)
{  
  page++;

  refreshBestPlayers();
}

function refreshCharacterData(){
  
  let totalGames = 0;
  Object.entries(currentData).forEach(([key, value]) => 
  { 
    if(value.totalGames)
      totalGames += value.totalGames;
  });

  Common.refreshCharacterTable(document.getElementById("CharacterStats"), currentData, totalGames);
}

function refreshBestPlayers()
{
  document.getElementById("right").disabled = page >= maxPages;
  document.getElementById("left").disabled = page == 0;

  document.getElementById("table").innerHTML = "";

  for (let i = page * pageSize; i < currentRanking.length && i < ((page + 1) * pageSize); i++) {
    const element = currentRanking[i];

    var victoryRate = Math.round((element.wins / element.totalGames) * 10000) / 100;

    var mostUsedCharacter = "None";
    var uses = 0;

    if(element.characterInfo)
    {
      Object.entries(element.characterInfo).forEach(([key, value]) => {
        if(value.totalGames > uses) {
          uses = value.totalGames; 
          mostUsedCharacter = key;
        }
      });
    }

    var table = document.getElementById("table");
    var row = table.insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);

    
    
    cell1.innerHTML = element.nick;

    cell2.innerHTML = element.rating;

    cell3.innerHTML = victoryRate.toFixed(2) + "%";
    cell4.appendChild(Common.checkImage(mostUsedCharacter));

    /*var str = "<tr>"
    str += "<td>" + element.nick + "</td>";
    str += "<td>" + element.rating + "</td>";
    str += "<td>" + victoryRate.toFixed(2) + "%" + "</td>";
    str += "<td>" + Common.checkImage(mostUsedCharacter) + "</td>";
    str += "</tr>";

    document.getElementById("table").innerHTML += str;*/
  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}

function refreshWinrate(wr, char1, char2){
  document.getElementById("right").disabled = page >= maxPages;
  document.getElementById("left").disabled = page == 0;

  document.getElementById("CharacterWinrate").innerHTML = "";

  var table = document.getElementById("CharacterWinrate");
  var row = table.insertRow(0);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  
  cell1.appendChild(Common.checkImage(char1));
  cell3.appendChild(Common.checkImage(char2));

  if(wr != -1)
    cell2.innerHTML = wr + "%";
  else
    cell2.innerHTML = "No data";
}

function getCharacterStatistics(){
  var char1 = document.getElementById("char1");
  var char2 = document.getElementById("char2");

  for (var x in Common.charactersNames) {
    char1.options[char1.options.length] = new Option(x, x);
  }
  for (var x in Common.charactersNames) {
    char2.options[char2.options.length] = new Option(x, x);
  }

  char2.value = Common.next(char1.value);
  
  char1.onchange = function() {
    if(char1.value == char2.value){
      char2.value = Common.next(char1.value);
    }
    refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
  }
  
  char2.onchange = function() {
    if(char1.value == char2.value){
      char1.value = Common.next(char1.value);
    }
    refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
  }
  refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
}

function getCharacterWinrate(char1, char2){
  var character = currentData[char1];
  var against = character[char2];
  if(against === undefined)
    return -1;
  return Math.round(10000*against.wins / against.totalGames)/100;
}