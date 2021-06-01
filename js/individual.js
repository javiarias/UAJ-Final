var currentPlayer = {};

var pageSize = 15;
var page = 0;

var maxPages = 0;

var currentHistory = [];

document.getElementById("getData").onclick = getPlayerData;
document.getElementById("left").onclick = left;
document.getElementById("right").onclick = right;

document.getElementById("left").disabled = true;
document.getElementById("right").disabled = true;
document.getElementById("currentPage").innerHTML = "0 / 0";

function getPlayerData(e)
{
  var id = document.getElementById("searchID").value;

  var url = "http://localhost:25565/accounts/by-id/" + id;


  $.get(url, function(data, status){

    currentPlayer = data.currentPlayer;

    if(currentPlayer.history !== undefined)
      currentHistory = currentPlayer.history.concat(currentPlayer.pending);
    else
      currentHistory = currentPlayer.pending;

    page = 0;

    maxPages = Math.trunc(currentHistory.length / pageSize);

    refreshTable();
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

  refreshTable();
}

function right(e)
{  
  page++;

  refreshTable();
}

function refreshTable()
{
  document.getElementById("right").disabled = page >= maxPages;
  document.getElementById("left").disabled = page == 0;

  document.getElementById("table").innerHTML = "";

  for (let i = (currentHistory.length - 1) - (page * pageSize); i >= 0 &&  i > (currentHistory.length - 1) - ((page + 1) * pageSize); i--) {
    const element = currentHistory[i];

    var avg = 0;
    var time = 0;    

    element.rounds.forEach(r => {
      avg += r.result;
      time += r.time;
    });

    avg = avg / element.rounds.length;

    var result = "";

    if(avg > 0.5) result = "Victory";
    else if (avg < 0.5) result = "Loss";
    else result = "Draw";

    time = (time * 45.0);

    var mins = ('00' + Math.trunc(time / 60.0)).slice(-2);
    var secs = ('00' + Math.trunc(time % 60.0)).slice(-2);

    var str = "<tr>"
    str += "<td>" + result + "</td>";
    str += "<td>" + mins + ":" + secs+ "</td>";
    str += "<td>" + element.rivalNick + "</td>";
    str += "</tr>";

    document.getElementById("table").innerHTML += str;
  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}

function informError(info){
  document.getElementById("PlayerError").innerHTML = info;
}