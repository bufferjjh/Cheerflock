var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var server = http.Server(app);
app.use(express.static('client'));
server.listen(PORT, function() {
  console.log('server running');
});

const io = require('socket.io')(server)
const games = {}
const auth_users = {"atptour@gmail.com" : "12345", "wtatour@gmail.com" : "12345", "testingUser" : "testingPassword"};
const admins = {}
function generate_key() {
  var curr = Math.floor(Math.random() * (1000000)) + 10000;
  var key = curr.toString();
  var exists = key in games;
  if(exists == false) {
    return key;
  }
  else {
    generate_key();
  }
}

function delete_game(key) {
  if(key in games) {
    delete games[key];
  }
}


io.on('connection', socket => {
  socket.on('game-data-sent', lst => {
    //emit to index to post game on active games section
    //lst -> [email, auth_key, matchup, date, name, league, usersOnline]
    //check if email in auth dict
    exists = lst[0] in auth_users;
    if(exists == false) {
      socket.emit('invalid-cred');
    }
    else {
      currPass = auth_users[lst[0]];
      //check if password matches
      if(currPass != lst[1]) {
        socket.emit('invalid-cred');
      }
      else {
        var key = generate_key();
        socket.emit('succesfull-creation', key);
        games[key] = lst;
      }
    }
  });
  socket.on("index-connect", () => {
    //send games so the index side posts all games inside games list
    socket.emit("current-active-games", games);
  });

  socket.on("room-code-request", key => {
    //check if code is valid (is it in the dictionary)
    //returns match up
    var code_exists = key in games;
    if(code_exists == false) {
      socket.emit("invalid-game-key");
    }
    else {
      socket.emit("room-code-request-res",games[key][2]);
    }
  });

  socket.on("is-valid-key", key_provided => {
    //check if key in games
    if(key_provided in games) {
      socket.emit("key_valid");
    }
    else {
      socket.emit("key_invalid");
    }
  });

  socket.on("admin-panel-request", given_code => {
    var exists = given_code in games;
    if(exists == false) {
      socket.emit("invalid-code-admin");
    }
    else {
      socket.emit("succesfull-admin-request", games[given_code]);
    }
  });

  socket.on("join-request", client_key  => {
    //increment room count and let socket join room
    socket.join(client_key);
    games[client_key][6] = games[client_key][6] + 1;
    socket.to(client_key).emit("update-room-count", games[client_key][6]);
  });

  socket.on("admin-join-request", client_key  => {
    //increment room count and let socket join room
    socket.join(client_key);
    games[client_key][6] = games[client_key][6] + 1;
    //remember this is the admin of a game
    //therefore, you must log the socket.id so if he or she disconnects
    //you need to close the game
    //keep track dict [code : admin key]
    admins[socket.id] = client_key;
    socket.to(client_key).emit("update-room-count", games[client_key][6]);
  });

  socket.on("client-feed", feed_packet => {
    socket.to(feed_packet[0]).emit('client-feedback', feed_packet[1]);
  });

  socket.on("recieve-open", code_recieved => {
    socket.to(code_recieved).emit('admin-recieve-open');
  });
  socket.on("recieve-close", code_recieved => {
    socket.to(code_recieved).emit('admin-recieve-close');
  });
  socket.on("current-state", key => {
    socket.to(key).emit("current-state-request");
  });
  socket.on("current-state-response", data => {
    socket.to(data[0]).emit("admin-current-mode", data[1]);
  });
  socket.on("disconnecting", () => {
    var connect_rooms = Object.keys(socket.rooms).filter(item => item!=socket.id)

    for (var i = 0; i < connect_rooms.length; i++) {
      //decrement one from the room with the keys
      if(connect_rooms[i] in games) {
        games[connect_rooms[i]][6] = games[connect_rooms[i]][6] - 1;
        socket.to(connect_rooms[i]).emit("update-room-count", games[connect_rooms[i]][6]);
      }
    }
    if(socket.id in admins) {
      if(admins[socket.id] in games) {
        delete games[admins[socket.id]];
      }
      var admin_key = admins[socket.id];
      socket.to(admin_key).emit("room-closed");
      if(socket.id in admins) {
        delete admins[socket.id];
      }
    }
  });

  socket.on("current-room-count-request", code => {
    if(code in games) {
      socket.emit("current-room-count-response", games[code][6]);
    }
  });

  socket.on("round-results", data => {
    //send data to room clients
    socket.to(data[0]).emit("round-results-posted", [data[1], data[2]]);
  });

  socket.on("close-game-session", code => {
    socket.to(code).emit("room-closed");
    if(code in games) {
      delete games[code];
    }
    socket.leave(code);
  });
});
