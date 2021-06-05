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

var charactersNames = { "ManoloMcFly": 0, "BadBaby": 1, "CamomilaSestima":2, "BobOjocojo":3, "Chuerk": 4 }

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
    informError("");
  }).fail(function() {
    informError("Jugador no encontrado");
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
  document.getElementById("CharacterStats").innerHTML = "";
  let i = 0;
  Object.entries(currentData).forEach(([key, value]) => {
    var victoryRate = Math.round((value.wins / value.totalGames) * 10000) / 100;
    var time = (value.totalTime / value.totalGames) * 45.0;
    var accuracy = Math.round((value.totalAccuracy / value.totalGames));
    //accuracy = Math.trunc(accuracy).slice(-2);

    var mins = ('00' + Math.trunc(time / 60.0)).slice(-2);
    var secs = ('00' + Math.trunc(time % 60.0)).slice(-2);

    var table = document.getElementById("CharacterStats");
    var row = table.insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    cell1.appendChild(checkImage(key));
    
    cell2.innerHTML = victoryRate + "%";

    cell3.innerHTML = value.totalGames;

    cell4.innerHTML = mins + ":" + secs;
    cell5.innerHTML = (value.totalAccuracy / value.totalGames).toFixed(2) + "%";
    i++;
  });
}

function checkImage(key){
  var imgUser = document.createElement('img');
  imgUser.style="width:64px;height:64px;"
          var str = "<tr>"
          switch(key){
            case "ManoloMcFly":
              imgUser.src = '/images/Manolo McFly.png';
              break;
            case "CamomilaSestima":
              imgUser.src = '/images/Camomila Sestima.png';
              break;
            case "BobOjocojo":
              imgUser.src = '/images/Bob Ojocojo.png';
                break;
            case "Chuerk":
              imgUser.src = '/images/Chuerk.png';
                break;
            case "BadBaby":
              imgUser.src = '/images/Bad Baby.png';
                break;
          }
    return imgUser;
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
    cell4.appendChild(checkImage(mostUsedCharacter));

    /*var str = "<tr>"
    str += "<td>" + element.nick + "</td>";
    str += "<td>" + element.rating + "</td>";
    str += "<td>" + victoryRate.toFixed(2) + "%" + "</td>";
    str += "<td>" + checkImage(mostUsedCharacter) + "</td>";
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

  
  cell1.appendChild(checkImage(char1));
  cell3.appendChild(checkImage(char2));

  if(wr != -1)
    cell2.innerHTML = wr + "%";
  else
    cell2.innerHTML = "No data";

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}

function informError(info){
  document.getElementById("PlayerError").innerHTML = info;
}

function getCharacterStatistics(){
  var char1 = document.getElementById("char1");
  var char2 = document.getElementById("char2");

  for (var x in charactersNames) {
    char1.options[char1.options.length] = new Option(x, x);
  }
  for (var x in charactersNames) {
    char2.options[char2.options.length] = new Option(x, x);
  }
  char2.value = next(char1.value);
  char1.onchange = function() {
    if(char1.value == char2.value){
      char2.value = next(char1.value);
    }
    refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
  }
  
  char2.onchange = function() {
    if(char1.value == char2.value){
      char1.value = next(char1.value);
    }
    refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
  }
  refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
}

var next = function(key) {
  var i = 0
  var j = 0;
  for (var name in charactersNames) {
    if (name === key) {
      j = i;
    }
    i++;
  }
  var len = i;
  i = 0;
  for (var name in charactersNames) {
    if (i === (j + 1)%len) {
      return name;
    }
    i++;
  }

};

function getCharacterWinrate(char1, char2){
  var character = currentData[char1];
  var against = character[char2];
  if(against === undefined)
    return -1;
  return Math.round(10000*against.wins / against.totalGames)/100;
}