const socket = io();
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
function registerGame() {
  //get all fields

  var league = document.getElementById("leagues").value;
  var email = document.getElementById("auth_user").value;
  var auth_key = document.getElementById("auth_key").value;
  var matchup = document.getElementById("matchup").value;
  var date = document.getElementById("start_time").value;
  var name = document.getElementById("tournement_name").value;
  //check if all fields are complete
  var check1 = email != "";
  var check2 = auth_key != "";
  var check3 = matchup != "";
  var check4 = date != "";
  var check5 = name != "";

  if(check1 && check2 && check3 && check4 && check5 && league != "Select League") {
    //send data to server
    var data_packet = [email, auth_key, matchup, date, name, league, 0];
    socket.emit('game-data-sent', data_packet);
  }
  else {
    alert("Please fill in all fields");
  }
}
function promptFunction() {
  var msgBox = document.getElementById("shade_div");
  var msgPrompt = document.getElementById("prompt_div");
  msgPrompt.remove();
  msgBox.remove();
}
socket.on("invalid-cred", () => {
  //alert("Invalid Email or Auth Key");
  throwMSG("Invalid Credentials", "Close");
});

var roomkey = '0';
socket.on("succesfull-creation", assigned_key => {
  roomkey = assigned_key;
  //put into local storage and redirect to admin panel
  localStorage.setItem("admin_key", roomkey);
  window.location.href = "panel.html";
});

console.log("Testing Username: testingUser");
console.log("Testing Password: testingPassword");
