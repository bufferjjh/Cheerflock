function pauseAnimation() {
  document.getElementById("loader").style.animationPlayState = "paused";
}
function runAnimation() {
  document.getElementById("loader").style.animationPlayState = "running";
}
function hideAnimation() {
  document.getElementById("loader").style.visibility = "hidden";
  document.getElementById("cheer_boo_text").style.visibility = "visible";
}
function showAnimation() {
  document.getElementById("loader").style.visibility = "visible";
  document.getElementById("cheer_boo_text").style.visibility = "hidden";
}
function gray_cheer() {
  document.getElementById("cheer_option").style.backgroundColor = "#b8b0cf";
  document.getElementById("cheer_option").style.opacity = "0.5";
  document.getElementById("cheer_option").style.cursor = "default";
  document.getElementById("cheer_option").style.color = "white";
}
function gray_boo() {
  document.getElementById("boo_option").style.backgroundColor = "#b8b0cf";
  document.getElementById("boo_option").style.opacity = "0.5";
  document.getElementById("boo_option").style.cursor = "default";
  document.getElementById("boo_option").style.color = "white";
}
function reset_cheer() {
  document.getElementById("cheer_option").style.backgroundColor = "#22e35f";
  document.getElementById("cheer_option").style.opacity = "1";
  document.getElementById("cheer_option").style.cursor = "pointer";
  document.getElementById("cheer_option").style.color = "white";
}
function reset_boo() {
  document.getElementById("boo_option").style.backgroundColor = "#f5183d";
  document.getElementById("boo_option").style.opacity = "1";
  document.getElementById("boo_option").style.cursor = "pointer";
  document.getElementById("boo_option").style.color = "white";
}
const socket = io();

var key = localStorage.getItem("room_key");

socket.on("invalid-game-key", () => {
  window.location.href = "index.html";
});

if(key === null) {
  //if key isnt found, then redirect to index.html
  window.location.href = "index.html";
}

else {
  //key is found, send request to server to get game data for that key
  //warning! Key may be invalid, server will return 'invalid-game-key' if invalid
  socket.emit("room-code-request", key);
}

socket.on("room-code-request-res", currMatchUp => {
  //recieved match up info and code is valid
  document.getElementById("page_header").innerHTML = currMatchUp;
  //send join room request to server [join key]
  socket.emit("join-request", key);
  socket.emit("current-state", key);
  socket.emit("current-room-count-request", key);
});

socket.on("current-room-count-response", x => {
  document.getElementById("user_count").innerHTML = "• " + x.toString() + " in Game";
});

socket.on("round-results-posted", data => {
  document.getElementById("roundCheer").innerHTML = data[0].toString() + " Cheers";
  document.getElementById("roundBoo").innerHTML = data[1].toString() + " Boos";
});

var admin_recieve = false;

socket.on("admin-current-mode", ans => {
  if(ans == 0) {
    admin_recieve = false;
  }
  else {
    admin_recieve = true;
  }
  if(admin_recieve == false) {
    runAnimation()
    showAnimation();
    gray_cheer()
    gray_boo();
  }
});

var voted = false;
socket.on('admin-recieve-open', () => {
  admin_recieve = true;
  voted = false;
  pauseAnimation();
  hideAnimation();
  reset_cheer();
  reset_boo();
});
socket.on('admin-recieve-close', () => {
  admin_recieve = false;
  voted = false;
  runAnimation()
  showAnimation();
  gray_cheer()
  gray_boo();
});

function promptFunction() {
  window.location.href = "index.html";
}
socket.on("room-closed", () => {
  //remove localStorage Key
  localStorage.removeItem("room_key");
  //alert("Room Closed By Admin");
  throwMSG("Room Closed By Admin", "Home");
});
socket.on("update-room-count", x => {
  document.getElementById("user_count").innerHTML = "• " + x.toString() + " in Game";
});

//0 = cheer, 1 = boo

function registerCheer() {
  if(admin_recieve && voted == false) {
    socket.emit("client-feed", [key, 0]);
    gray_boo();
    document.getElementById("cheer_option").style.cursor = "default";
    document.getElementById("cheer_option").style.color = "#22e35f";
    voted = true;
  }
}
function registerBoo() {
  if(admin_recieve && voted == false) {
    socket.emit("client-feed", [key, 1]);
    gray_cheer();
    document.getElementById("boo_option").style.cursor = "default";
    document.getElementById("boo_option").style.color = "#f5183d";
    voted = true;
  }
}
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
