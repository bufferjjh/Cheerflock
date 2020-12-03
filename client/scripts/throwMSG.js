function throwMSG(msg, button_value) {
  var shadeDiv = document.createElement("div");
  var msgPrompt = document.createElement("div");
  var msgText = document.createElement('p');
  var exit_button = document.createElement('input');
  shadeDiv.id = "shade_div";
  msgPrompt.id = "prompt_div";
  msgText.innerHTML = msg;
  msgText.id = "msgText";
  msgText.style.fontSize = "23px";
  exit_button.type = "button";
  exit_button.value = button_value;
  exit_button.id = "exitButton";
  exit_button.setAttribute("onclick", 'promptFunction()');
  document.body.appendChild(shadeDiv);
  msgPrompt.appendChild(msgText);
  msgPrompt.appendChild(exit_button);
  document.body.appendChild(msgPrompt);
}
