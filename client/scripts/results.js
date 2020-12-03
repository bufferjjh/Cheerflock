//get all the storage variables

var matchup = localStorage.getItem("results_matchup");
var cheers = localStorage.getItem("results_cheers");
var boos = localStorage.getItem("results_boos");

if(matchup == null || cheers == null || boos == null) {
  //wrong load, redirect
  window.location.href = "index.html";
}

else {
  document.getElementById("matchup_title").innerHTML = matchup;
  document.getElementById("cheers_num").innerHTML = cheers;
  document.getElementById("boos_num").innerHTML = boos;
}
var newUrl = "/";
window.history.pushState('data', 'Title', newUrl);
