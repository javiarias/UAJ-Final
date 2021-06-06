export function lerp(a, b, t, maxMove = 0, minDiff = 0.0001) {
	let diff = b - a;
	if (maxMove > 0) {
		diff = Math.min(diff, maxMove);
		diff = Math.max(diff, -maxMove);
	}
	if (Math.abs(diff) < minDiff) {
		return b;
	}
	return a + diff * t;
};

export function lerp3(a, b, c, t)
{
	if (t <= 0.5)
	{
		return lerp(a, b, t * 2);
	}
	else
	{
		return lerp(b, c, (t - 0.5) * 2);
	}
}

export function lerp3Color(a, b, c, t)
{
	if (t <= 0.5)
	{
		return lerpColor(a, b, t * 2);
	}
	else
	{
		return lerpColor(b, c, (t - 0.5) * 2);
	}
}

export function lerpColor(a, b, t) {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + t * (br - ar),
          rg = ag + t * (bg - ag),
          rb = ab + t * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

export const lossColor = "f58282";
export const drawColor = "fff9a6";
export const winColor = "aef28d";



export function checkImage(key)
{
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

export const charactersNames = { "ManoloMcFly": 0, "BadBaby": 1, "CamomilaSestima":2, "BobOjocojo":3, "Chuerk": 4 }

export function next(key) {
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

export function refreshCharacterTable(e, characterInfo, totalGames){
  e.innerHTML = "";

  if(characterInfo)
  {
	Object.entries(characterInfo).forEach(([key, value]) => {
      var table = e;
      var row = table.insertRow();
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);

        cell1.appendChild(checkImage(key));

        var victoryRate = Math.round((value.wins / value.totalGames) * 10000) / 100;
        
        cell2.innerHTML = victoryRate.toFixed(2) + "%";

		cell3.innerHTML = value.totalGames + "  (" + ((value.totalGames / totalGames) * 100).toFixed(2) + "%)";

        var time = (value.totalTime * 45.0) / value.totalGames;

        var mins = ('00' + Math.trunc(time / 60.0)).slice(-2);
        var secs = ('00' + Math.trunc(time % 60.0)).slice(-2);

        cell4.innerHTML = mins + ":" + secs;
        cell5.innerHTML = (value.totalAccuracy / value.totalGames).toFixed(2) + "%";

        var color = lerp3Color(parseInt(lossColor, 16), parseInt(drawColor, 16), parseInt(winColor, 16), value.wins / value.totalGames);

        row.style.backgroundColor = color.toString(16);
    });
  }
}

export function timeSince(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export function informError(e, info){
  e.innerHTML = info;
  e.hidden = (info == "");
}