(async () => {
  "use strict";

  const apiURL = "./graphql";
  const socket = io();

  // elements
  const channelList = document.getElementById("channels");
  const userlist = document.getElementById("users");
  const messageForm = document.getElementById("messageform");
  const messageInput = document.getElementById("message");
  const messageList = document.getElementById("messages");

  // variables
  var username = "noname";
  var userid = "noid"
  var currentChannelid = "";
  var currentChannelname = "";

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
  const getUserName = async () => {
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
      console.log("getName: ", data);
      name = data.username.Name;
    } catch (e) {
      name = await addUserName();
    }
    console.log("getUserName name: " + name);
    return name;
  };

    // get name of user from database
    const getUserId = async () => {
      let id;
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
        console.log("getName: ", data);
        id = data.username.id;
      } catch (e) {
        await addUserName();
        id = await getUserId()
      }
      console.log("getUserId id: " + id);
      return id;
    };

  // set name of user to database
  const addUserName = async () => {
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
    name = data.addUser.Name
    userid = await getUserName();
    return name;
  };

  // delete user from database
  const delUser = async () => {
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

  // fetch messages from graphql API
  const fetchChannel = async () => {
    const query = {
      query: `{
        channel(id="${channel}") {
          id
          Name
          Topic
          Users {
            id
          }
          Messages {
            id
          }
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

  // fetch messages from graphql API
  const fetchChannelMessages = async () => {
    const query = {
      query: `{
          channel(id="${currentChannelid}") {
            Messages {
              From
              Content
            }
          }
        }
          `,
    };
    const data = await fetchGraphql(query);
    data.messages.forEach((type) => {
      const item = document.createElement("li");
      //item.innerHTML = `GRAPHQL_BE: <b>${type.From.Name}</b>: ${type.Content}`;
      item.innerHTML = `GRAPHQL_BE: <b>${type.From.Name}</b>: ${type.Content}`;
      messageList.appendChild(item);
    });
  };

  // create channel to database
  const addChannel = async (channelname) => {
    let channelid;
    const query = {
      query: `mutation {
        addChannel(Name: "${channelname}"){
          id
        }
      }
              `,
    };
    const data = await fetchGraphql(query);
    console.log("addChannel: ", data.addChannel);
    channelid = data.addChannel.id;
    console.log("channelid in addChannel(): ", channelid)
    return channelid;
  };

  // fetch messages from graphql API
  const getChannelid = async (channelname) => {
    let channelid;
    const query = {
      query: `{
        channelname(Name: "${channelname}"){
          id
        }
      }
      `,
    };
    try {
      const data = await fetchGraphql(query);
      console.log("getChannelid: ", data);
      channelid = data.channelname.id;
    } catch (e) {
      console.error("getChannelid channel not found: " + e);
      channelid = await addChannel(channelname);
    }
    return channelid;
  };

  // create channel to database
  const addUserToChannel = async () => {
    const query = {
      query: `mutation {
        addUserToChannel(id: "${currentChannelid}", User: "${userid}")
        {
          id
          Name
          Users {
            id
          }
        }
      }
      `,
    };
    const data = await fetchGraphql(query);
    console.log("addUserToChannel: ", data);
    return data;
  };

  // create channel to database
  const removeUserFromChannel = async () => {
    const query = {
      query: `mutation {
        removeUserFromChannel(id: "${currentChannelid}", User: "${userid}")
        {
          id
          Name
          Users {
            id
          }
        }
      }                  
      `,
    };
    const data = await fetchGraphql(query);
    console.log("removeUserFromChannel: ", data);
    return data;
  };

  // create channel to database
  const addChannelToUser = async () => {
    const query = {
      query: `mutation {
        addChannelToUser(id: "${userid}", Channel: "${currentChannelid}")
        {
          id
          Name
        }
      }
      `,
    };
    console.log(query);
    const data = await fetchGraphql(query);
    console.log("addChannelToUser: ", data);
    return data
  };

  // create channel to database
  const removeChannelFromUser = async () => {
    const query = {
      query: `mutation {
        removeChannelFromUser(id: "${userid}", Channel: "${currentChannelid}")
        {
          id
          Name
        }
      }
      `,
    };
    const data = await fetchGraphql(query);
    console.log("removeChannelFromUser: ", data);
    return data;
  };

  // create channel to database
  const addMessageToUser = async (messageid) => {
    const query = {
      query: `mutation {
          addMessageToUser(id: "${userid}", Message: "${messageid}")
          {
            id
            Name
            Messages {
              id
            }
          }
        }
        `,
    };
    return await fetchGraphql(query);
  };

  // create channel to database
  const addMessageToChannel = async (messageid) => {
    const query = {
      query: `mutation {
          addMessageToChannel(id: "${currentChannelid}", Message: "${messageid}")
          {
            id
            Name
            Messages {
              id
            }
          }
        }
        `,
    };
    return await fetchGraphql(query);
  };

  // put messages with graphql API
  const sendMessage = async (messagecontent) => {
    const query = {
      query: `mutation {
        addMessage(From: "${userid}", To: "${currentChannelid}", Content: "${messagecontent}") {
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
    const data = await fetchGraphql(query);
    addMessageToUser(data.addMessage.id);
    addMessageToChannel(data.addMessage.id);
  };

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const inp = messageInput;
    if (inp.value.startsWith("/", 0)) {
      socket.emit("command", inp.value);
    } else if (currentChannelid == "") {
      serverMessage(
        "You need to be in a channel to send a non-command message!"
      );
    } else {
      sendMessage(inp.value);
      socket.emit("send message", username, currentChannelname, inp.value);
      socket.emit("chat message", username, currentChannelname, inp.value);
    }
    inp.value = "";
  });

  function serverMessage(msg) {
    socket.emit("self message", msg);
  }

  const joinChannel = async (channel) => {
    console.log(userid);
    document.getElementById("channelsh").innerText = "Channels";
    document.getElementById("channels").innerHTML = "";
    const channelElement = document.createElement("li");
    channelElement.innerText = channel;
    channelList.appendChild(channelElement);
    currentChannelid = await getChannelid(channel);
    console.log(userid);
    console.log("currentChannelID: ", currentChannelid)
    console.log(userid);
    currentChannelname = channel;
    await addUserToChannel();
    console.log(userid);
    await addChannelToUser();
    console.log(userid);
  };

  const leaveChannel = async () => {
    await removeUserFromChannel();
    await removeChannelFromUser();
    document.getElementById("channelsh").innerText = "";
    document.getElementById("channels").innerHTML = "";
    currentChannelid = "";
    currentChannelname = "";
  };

  const setOwnName = async () => {
    username = await addUserName();
    userid = await getUserId();
    console.log("username: ", username)
    console.log("userid: ", userid)
  }

  socket.on("command", (msg) => {
    console.log("command issued: " + msg);
    if (msg.startsWith("/join ")) {
      let newchannel = msg.replace("/join ", "");
      socket.emit("join", username, newchannel);
      joinChannel(newchannel);
    } else if (msg.startsWith("/leave")) {
      socket.emit("leave", username, currentChannelname);
      leaveChannel();
    } else if (msg.startsWith("/help ")) {
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
    fetchMessages();
  });

  socket.on("self message", (msg) => {
    const item = document.createElement("li");
    item.innerHTML = msg;
    messageList.appendChild(item);
  });

  socket.on("set user", () => {
    setOwnName();
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
