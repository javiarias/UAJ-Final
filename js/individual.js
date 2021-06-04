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

function is_numeric(str){
  return /^\d+$/.test(str);
}

function getPlayerData(e)
{
  var id = document.getElementById("searchID").value;

  if(is_numeric(id))
    var url = "http://localhost:25565/accounts/by-id/" + id;
  else
    var url = "http://localhost:25565/accounts/by-nick/" + id;


  $.get(url, function(data, status){

    currentPlayer = data.currentPlayer;

    if(currentPlayer.history !== undefined)
      currentHistory = currentPlayer.history.concat(currentPlayer.pending);
    else
      currentHistory = currentPlayer.pending;

    page = 0;

    maxPages = Math.trunc(currentHistory.length / pageSize);

    refreshTable();
    refreshPlayerTable();
    refreshCharacterTable();
    
  }).done(function() {
    informError("");
  }).fail(function() {
    informError("Jugador no encontrado");
    document.getElementById("table").innerHTML = "";
    document.getElementById("InfoPlayerTable").innerHTML = "";
    document.getElementById("InfoPlayerCharacters").innerHTML = "";
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

function refreshPlayerTable(){
  document.getElementById("InfoPlayerTable").innerHTML = "";

  var time = (currentPlayer.totalTime / currentPlayer.totalGames) * 45.0;

  var mins = ('00' + Math.trunc(time / 60.0)).slice(-2);
  var secs = ('00' + Math.trunc(time % 60.0)).slice(-2);

  var str = "<tr>"
  str += "<td>" + currentPlayer.nick + "</td>";
  str += "<td>" + currentPlayer.rating+ "</td>";
  str += "<td>" + currentPlayer.totalGames + "</td>";
  str += "<td>" + currentPlayer.wins + "</td>";
  str += "<td>" + currentPlayer.draws + "</td>";
  str += "<td>" + currentPlayer.losses + "</td>";
  str += "<td>" + mins + ":" + secs + "</td>";
  str += "</tr>";
  document.getElementById("InfoPlayerTable").innerHTML += str;
}

function refreshCharacterTable(){
  document.getElementById("InfoPlayerCharacters").innerHTML = "";
  if(currentPlayer.characterInfo)
    {
      let i = 0;
      Object.entries(currentPlayer.characterInfo).forEach(([key, value]) => {
        var table = document.getElementById("InfoPlayerCharacters");
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

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
          cell1.appendChild(imgUser);

          var victoryRate = Math.round((value.wins / value.totalGames) * 10000) / 100;
          
          cell2.innerHTML = victoryRate.toFixed(2) + "%";

          cell3.innerHTML = value.totalGames;

          var time = (value.totalTime * 45.0) / value.totalGames;

          var mins = ('00' + Math.trunc(time / 60.0)).slice(-2);
          var secs = ('00' + Math.trunc(time % 60.0)).slice(-2);

          cell4.innerHTML = mins + ":" + secs;
          cell5.innerHTML = (value.totalAccuracy / value.totalGames).toFixed(2) + "%";
      });
    }
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