socket = io();
var key_provided;
function promptFunction() {
  //delete the msg prompt, delete shadeDiv
  var msgBox = document.getElementById("shade_div");
  var msgPrompt = document.getElementById("prompt_div");
  msgPrompt.remove();
  msgBox.remove();
}
function go_to_room(key) {
  localStorage.setItem("room_key", key);
  window.location.href = "room.html";
}
socket.on("key_valid", () => {
  //join the room
  go_to_room(key_provided);
});
socket.on("key_invalid", () => {
  //alert("key is invalid");
  throwMSG("Invalid Game", "Close");
});
function attempt_join() {
  key_provided = document.getElementById("code_input").value.trim();
  //send a request to server to see if key provided is an active game
  socket.emit("is-valid-key", key_provided);
}
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
