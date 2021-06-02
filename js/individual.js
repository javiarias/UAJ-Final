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

    var table = document.getElementById("table");
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    switch(result){
      case "Victory":
        row.style.backgroundColor = "8FE34D";
        break;
      case "Loss":
        row.style.backgroundColor = "F07256";
        break;
      case "Draw":
        row.style.backgroundColor = "E1E64B";
        break;
    }

    var imgUser = document.createElement('img');
    var imgRival = document.createElement('img');
    imgUser.src = '/images/' + element.playerChar + '.png';
    imgRival.src = '/images/' + element.rivalChar + '.png';
    imgUser.style="width:48px;height:48px;"
    imgRival.style="width:48px;height:48px;"

    cell1.appendChild(imgUser);
    cell2.innerHTML = result;
    cell3.innerHTML = mins + ":" + secs;
    cell4.innerHTML = element.rivalNick;
    cell5.appendChild(imgRival);

  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}

function informError(info){
  document.getElementById("PlayerError").innerHTML = info;
}