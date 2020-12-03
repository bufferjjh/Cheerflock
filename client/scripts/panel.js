//make sure page is connected with a code, redirect to index otherwise
const socket = io();
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
var room_code = localStorage.getItem("admin_key");

var game_data;

if(room_code == null) {
  //redirect to index
  window.location.href = "index.html";
}
else {
  //room code provided, get game data from server
  socket.emit("admin-panel-request", room_code);
}

//check for server response
socket.on("invalid-code-admin", () => {
  //invalid request, redirect
  window.location.href = "index.html";
});

socket.on("succesfull-admin-request", game_data_server => {
  game_data = game_data_server;
  //send join request and increment
  socket.emit("admin-join-request", room_code);
})


//customize panel given game data

//display game code
document.getElementById("game_code").innerHTML = "Code: " + room_code;

//connect rooms panel.js with room.js

var mode = 0;

socket.on("current-state-request", () => {
  socket.emit("current-state-response", [room_code, mode]);
});

// 0 -> Cheer Recieving Off
//1 -> Cheer Recieving On

socket.on("update-room-count", x => {
  document.getElementById("users_count").innerHTML = "• " + x.toString();
});

var round_cheers = 0;
var round_boos = 0;

var total_cheers = 0;
var total_boos = 0;

function activate() {
  var button = document.getElementById("play_stop");
  if(mode == 0) {
    mode = 1;
    button.value = "Stop";
    document.getElementById("state_shower").innerHTML = "Cheer Recieving On";
    socket.emit("recieve-open", room_code);
    round_cheers = 0;
    round_boos = 0;
    document.getElementById("num_boos").innerHTML = "--";
    document.getElementById("num_cheers").innerHTML = "--";
  }
  else {
    mode = 0;
    button.value = "Start";
    document.getElementById("state_shower").innerHTML = "Cheer Recieving Off";
    socket.emit("recieve-close", room_code);
    socket.emit("round-results", [room_code, round_cheers, round_boos]);
  }
}

var cheers_sfx;
var boos_sfx;

var playing_sound = false;

var id_tracker = 0;

function playCrowd(cheers, boos) {
  var total = cheers + boos;
  var coe = 20;
  var overall = Math.min(1, total/coe);
  if(total > 0) {
    var percent_cheer = cheers/total;
    var percent_boo = boos/total;
    cheers_sfx = new Audio("./sounds/cheers.mp3");
    boos_sfx = new Audio("./sounds/boo_sfx.mp3");
    cheers_sfx.volume = overall * percent_cheer;
    boos_sfx.volume = overall * percent_boo;
    cheers_sfx.play();
    boos_sfx.play();
  }
  id_tracker+=1;
  var currentId = id_tracker;
  setTimeout(function() {
      if(currentId == id_tracker) {
        if(cheers_sfx != null) {
          cheers_sfx.pause();
        }
        if(boos_sfx != null) {
          boos_sfx.pause();
        }
        playing_sound = false;
        document.getElementById("play_sound").value ="Play Crowd";
        boos_sfx = null;
        cheers_sfx = null;
      }
  }, 30000);

}
function dynamic_update(cheers, boos) {
  if(playing_sound && cheers_sfx != null && boos_sfx != null) {
    var total = cheers + boos;
    var coe = 20;
    var overall = Math.min(1, total/coe);
    if(total > 0) {
      var percent_cheer = cheers/total;
      var percent_boo = boos/total;
      cheers_sfx.volume = overall * percent_cheer;
      boos_sfx.volume = overall * percent_boo;
    }
  }
}
function playCrowdArg() {
  if(playing_sound == false) {
    playCrowd(round_cheers, round_boos);
    playing_sound = true;
    document.getElementById("play_sound").value = "Stop Crowd";
  }
  else {
    //stop play
    if(cheers_sfx != null) {
      cheers_sfx.pause();
      cheers_sfx = null;
    }
    if(boos_sfx != null) {
      boos_sfx.pause();
      boos_sfx == null;
    }
    playing_sound = false;
    document.getElementById("play_sound").value = "Play Crowd";
  }
}

function end_session() {
  //redirect to results page
  //send request to server to close game
  //once server gets request, redirect all pages connected to room;

  socket.emit("close-game-session", room_code);
  //set local storage values total_cheers, total_boos, matchup
  localStorage.setItem("results_cheers", total_cheers);
  localStorage.setItem("results_boos", total_boos);
  localStorage.setItem("results_matchup", game_data[2]);
  //redirect to results page
  window.location.href = "results.html";
}

socket.on("client-feedback", x => {
  if(x == 0) {
    round_cheers += 1;
    total_cheers += 1;
    document.getElementById("num_cheers").innerHTML = round_cheers;
  }
  else {
    round_boos += 1;
    total_boos += 1;
    document.getElementById("num_boos").innerHTML = round_boos;
  }
  dynamic_update(round_cheers, round_boos);
});
