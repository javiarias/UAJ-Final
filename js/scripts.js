var currentPlayer = {};

var pageSize = 15;

var page = 0;

var maxPages = 0;

let currentHistory = undefined;

document.getElementById("getData").onclick = getData;
document.getElementById("left").onclick = left;
document.getElementById("right").onclick = right;

document.getElementById("left").disabled = true;
document.getElementById("right").disabled = true;
document.getElementById("currentPage").innerHTML = "0 / 0";

function getData(e)
{
  $.get("http://localhost:25565/accounts/by-id/3", function(data, status){

    currentHistory = data.currentHistory;
    page = 0;

    maxPages = Math.trunc(currentHistory.length / 15);

    refreshTable();
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
    
    var str = "<tr>"
    str += "<td>" + element.result + "</td>";
    str += "<td>" + (element.time * 45) + "</td>";
    str += "<td>" + element.opponent + "</td>";
    str += "</tr>";

    document.getElementById("table").innerHTML += str;
  }

  document.getElementById("currentPage").innerHTML = (page + 1) + " / " + (maxPages + 1);
}