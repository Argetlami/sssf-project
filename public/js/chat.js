(async () => {
  "use strict";

  const apiURL = "./graphql";
  const socket = io();

  // elements
  const messageForm = document.getElementById("messageform");
  const messageInput = document.getElementById("message");
  const messageList = document.getElementById("messages");

  // variables
  var username = "testman";

  // general fetch from graphql API
  const fetchGraphql = async (query) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(query),
    };
    try {
      const response = await fetch(apiURL, options);
      const json = await response.json();
      return json.data;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  // get name of user from database
  const getName = async () => {
    let name;
    const query = {
      query: `{
              username(Name: "${socket.id}") {
                id
                Name
                Channels {
                  id
                }
              }
            }
              `,
    };
    try {
      const data = await fetchGraphql(query);
      console.log(data);
      name = data.username.Name;
    } catch (e) {
      name = await setName();
    }
    console.log("getName name: " + name);
    return name;
  };

  // set name of user to database
  const setName = async () => {
    let name;
    const query = {
      query: `mutation {
              addUser(Name: "${socket.id}"){
                id
                Name
              }
            }
              `,
    };
    const data = await fetchGraphql(query);
    name = data.addUser.Name;
    return name;
  };

  // delete user from database
  const delName = async () => {
    const idquery = {
      query: `{
              username(Name: "${socket.id}") {
                id
              }
            }
              `,
    };
    const iddata = await fetchGraphql(idquery);
    if (iddata.id == null) {
      console.error(
        "delName: Tried to delete " + socket.id + "but no id for it was found!"
      );
    } else {
      const delquery = {
        query: `mutation {
                deleteUser(id: ${iddata.id}) {
                  id
                }
              }
                `,
      };
      await fetchGraphql(delquery);
    }
  };

  socket.on("connection", () => {
    console.log("socketlogic");
    console.log("a user connected", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("socketlogic");
    console.log("a user disconnected", socket.id);
  });

  // fetch messages from graphql API
  const fetchMessages = async () => {
    const query = {
      query: `{
        messages {
          id
          From {
            id
            Name
          }
          To {
            id
          }
          Content
        }
      }
      `,
    };
    const data = await fetchGraphql(query);
    data.messages.forEach((type) => {
      const item = document.createElement("li");
      // type from name doesnt work currently as testuser is removed
      //item.innerHTML = `GRAPHQL_BE: <b>${type.From.Name}</b>: ${type.Content}`;
      item.innerHTML = `GRAPHQL_BE: <b>${type.From.Name}</b>: ${type.Content}`;
      messageList.appendChild(item);
    });
  };

  // put messages with graphql API
  const sendMessage = async (user, channel, content) => {
    const query = {
      query: `mutation {
          addMessage(From: "${user}", To: "${channel}", Content: "${content}") {
            id
            From {
              id
            }
            To {
              id
            }
            Content
          }
        }
        `,
    };
    const item = document.createElement("li");
    item.innerHTML = `FRONTEND: <b>${user}</b>: ${content}`;
    messageList.appendChild(item);
  };

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // let user = document.getElementById("nickname").value;
    let user = socket.id;
    // if (user == "") {
    //   user = "anonymous";
    // }
    // let channel = document.getElementById("channel").textContent;
    let channel = "";
    const inp = messageInput;
    if (inp.value.startsWith("/", 0)) {
      socket.emit("command", inp.value, channel);
    } else {
      socket.emit("send message", user, channel, inp.value);
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
    fetchMessages(item);
    const item = document.createElement("li");
    item.innerHTML = "SOCKET: <b>" + user + "</b>: " + msg;
    messageList.appendChild(item);
    item.innerHTML = "GRAPHQL: <b>" + user + "</b>: " + msg;
    messageList.appendChild(fetched);
  });

  socket.on("self message", (msg) => {
    fetchMessages();
  });

  socket.on("set user", () => {
    username = setName();
  });

  socket.on("delete user", () => {
    delName();
    console.log("deleted = " + username);
  });

  socket.on("error message", (msg) => {
    const item = document.createElement("li");
    item.innerHTML = msg;
    messageList.appendChild(item);
  });

  // updateChannel("global");
})();
