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
    getCharacterStatistics();
    
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
  str += "<td>" + currentPlayer.rating + "</td>";
  str += "<td>" + currentPlayer.creation + "</td>";
  str += "<td>" + currentPlayer.lastGame + "</td>";
  str += "<td>" + currentPlayer.totalGames + "</td>";

  var aux = currentPlayer.wins + " / " + currentPlayer.draws + " / " + currentPlayer.losses + "<br/>";
  aux += ((currentPlayer.wins / currentPlayer.totalGames) * 100).toFixed(2) + "% / " + ((currentPlayer.draws / currentPlayer.totalGames) * 100).toFixed(2) + "% / " + ((currentPlayer.losses / currentPlayer.totalGames) * 100).toFixed(2) + "%";

  str += "<td>" + aux + "</td>";
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

          cell3.innerHTML = value.totalGames + "  (" + ((value.totalGames / currentPlayer.totalGames) * 100).toFixed(2) + "%)";

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
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);

    switch(result){
      case "Victory":
        row.style.backgroundColor = "aef28d";
        break;
      case "Loss":
        row.style.backgroundColor = "f58282";
        break;
      case "Draw":
        row.style.backgroundColor = "fff9a6";
        break;
    }

    var imgUser = document.createElement('img');
    var imgRival = document.createElement('img');
    imgUser.src = '/images/' + element.playerChar + '.png';
    imgRival.src = '/images/' + element.rivalChar + '.png';
    imgUser.style="width:48px;height:48px;"
    imgRival.style="width:48px;height:48px;"

    var dmgToShots = 0;

    if(element.shotsFired > 0) dmgToShots = (element.dmgDealt / element.shotsFired);

    cell1.appendChild(imgUser);
    cell2.innerHTML = result + "<br/>";

    element.rounds.forEach(round => {
      var imgUser = document.createElement('img');
      imgUser.style="width:14px;height:23px;"

      if(round.result > 0.5) imgUser.src = '/images/resultWin.png';
      else if (round.result < 0.5) imgUser.src = '/images/resultLoss.png';
      else round.result = imgUser.src = '/images/resultDraw.png';

      cell2.appendChild(imgUser);
      cell2.innerHTML += " ";
    });

    cell3.innerHTML = mins + ":" + secs;
    cell4.innerHTML = element.accuracy.toFixed(2) + "%";
    cell5.innerHTML = dmgToShots.toFixed(2) + " HP";
    cell6.innerHTML = element.rivalNick;
    cell7.appendChild(imgRival);

  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
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

var charactersNames = { "ManoloMcFly": 0, "BadBaby": 1, "CamomilaSestima":2, "BobOjocojo":3, "Chuerk": 4 }

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
      //char2.value = next(char1.value);
    }
    refreshWinrate(getCharacterWinrate(char1.value, char2.value), char1.value, char2.value);
  }
  
  char2.onchange = function() {
    if(char1.value == char2.value){
      //char1.value = next(char1.value);
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
  var character = currentPlayer.characterInfo[char1];
  var against = character[char2];
  if(against === undefined)
    return -1;
  return Math.round(10000*against.wins / against.totalGames)/100;
}