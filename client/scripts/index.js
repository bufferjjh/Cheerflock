const socket = io();
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
function appendEvent(Org, MatchUp, date, name ,id1, game_code, users_online) {
  currEvent = document.createElement('div');
  currEvent.className = 'activeEvent';

  currDate = document.createElement('p');
  currDate.className = 'date';
  currDate.innerHTML = date;

  currLeague = document.createElement('p');
  currLeague.className = 'league';
  currLeague.innerHTML = Org

  currTournyName = document.createElement('p');
  currTournyName.className = 'tournyName';
  currTournyName.innerHTML = name;

  currMatchUp = document.createElement('p');
  currMatchUp.className = 'matchup';
  currMatchUp.innerHTML = MatchUp;

  currActiveUsers = document.createElement('p');
  currActiveUsers.className = 'activeUsers';
  currActiveUsers.innerHTML = '• ' + users_online.toString() + " online";

  joinButton = document.createElement('input');
  joinButton.className = 'joinButton';
  joinButton.value = 'JOIN';
  joinButton.type = "button";
  joinButton.setAttribute("id", id1);
  joinButton.onclick = "";

  currGameCode = document.createElement('p');
  currGameCode.className = 'room_code';
  currGameCode.innerHTML = "Code: " + game_code;

  if(Org.toLowerCase() == 'atp' || Org.toLowerCase() == 'wta') {
    currImg = document.createElement('img');
    currImg.className = "cornerImage";
    currImg.src = "./images/racket.png";
    currEvent.appendChild(currImg);
  }
  currEvent.appendChild(currDate);
  currEvent.appendChild(currLeague);
  currEvent.appendChild(currTournyName);
  currEvent.appendChild(currMatchUp);
  currEvent.appendChild(currActiveUsers);
  currEvent.appendChild(joinButton);
  currEvent.appendChild(currGameCode);

  eventArea = document.getElementById("banner");
  eventArea.appendChild(currEvent);
}


socket.emit("index-connect");
//request to recieve active game data
function go_to_room(key) {
  localStorage.setItem("room_key", key);
  window.location.href = "room.html";
}
socket.on("current-active-games", active_games => {
  //recieve dictionary
  obj_keys = Object.keys(active_games);
  for (var i = 0; i < obj_keys.length; i++) {
    var curr = active_games[obj_keys[i]];
    var curr_key = obj_keys[i];
    appendEvent(curr[5], curr[2], curr[3], curr[4], obj_keys[i], curr_key, curr[6]);
    var currButton = document.getElementById(curr_key);
    currButton.setAttribute("onclick", "go_to_room(this.id)");
  }
});
