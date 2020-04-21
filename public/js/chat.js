"use strict";

const socket = io();

document.getElementById("messageform").addEventListener("submit", (event) => {
  event.preventDefault();
  // let user = document.getElementById("nickname").value;
  let user = 'testuser';
  // if (user == "") {
  //   user = "anonymous";
  // }
  // let channel = document.getElementById("channel").textContent;
  let channel = "";
  const inp = document.getElementById("message");
  if (inp.value.startsWith("/", 0)) {
    socket.emit("command", inp.value, channel);
  } else {
    socket.emit("chat message", user, channel, inp.value);
  }
  inp.value = "";
});

// let updateChannel = (channel) => {
//   document.getElementById("channel").innerText = channel;
// };

function serverMessage(msg) {
  socket.emit("self message", msg);
}

socket.on("command", (msg, channel) => {
  console.log("command issued: " + msg);
  if (msg.startsWith("/join ")) {
    let newchannel = msg.replace("/join ", "");
    socket.emit("join", newchannel, channel);
    updateChannel(newchannel);
  } else if (msg.startsWith("/leave")) {
    let newchannel = "global";
    socket.emit("leave", channel);
    updateChannel(newchannel);
  } else if (msg.startsWith("/help")) {
    serverMessage(
      "<b><u>COMMANDS</u></b></br>" +
        "<tt>/join channelname</tt> join a channel</br>" +
        "<tt>/leave</tt> leave a channel"
    );
  } else {
    serverMessage(
      'Error: command "' +
        (msg.split(" ", [0]) == "" ? msg : msg.split(" ", [0])) +
        '" not found, use /help for commands!'
    );
  }
});

socket.on("chat message", (user, channel, msg) => {
  const item = document.createElement("li");
  item.innerHTML = "<b>" + user + "</b>: " + msg;
  document.getElementById("messages").appendChild(item);
});

socket.on("self message", (msg) => {
  const item = document.createElement("li");
  item.innerHTML = msg;
  document.getElementById("messages").appendChild(item);
});

// updateChannel("global");
