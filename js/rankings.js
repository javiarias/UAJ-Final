var currentRanking = [];

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

    var str = "<tr>"
    str += "<td>" + element.nick + "</td>";
    str += "<td>" + element.rating + "</td>";
    str += "<td>" + victoryRate.toFixed(2) + "%" + "</td>";
    str += "<td>" + mostUsedCharacter + "</td>";
    str += "</tr>";

    document.getElementById("table").innerHTML += str;
  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}

function informError(info){
  document.getElementById("PlayerError").innerHTML = info;
}