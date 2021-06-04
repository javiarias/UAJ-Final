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

function informError(info){
  document.getElementById("PlayerError").innerHTML = info;
}