(async () => {
  "use strict";

  //##################################
  //# DECLARATIONS ###################
  //##################################

  const apiURL = "./graphql";
  const socket = io();

  // elements, because why not
  const channelList = document.getElementById("channels");
  const userList = document.getElementById("users");
  const messageForm = document.getElementById("messageform");
  const messageInput = document.getElementById("message");
  const messageList = document.getElementById("messages");
  const fileInput = document.getElementById("file-input");

  // variables, to prevent overflowing server with unnecessary queries
  // (extremely super bad decision security-wise, I know...)
  var username = "noname";
  var userid = "noid";
  var currentChannelid = "";
  var currentChannelname = "";

  //##################################
  // GRAPHQL #########################
  //##################################

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
      console.log("Checking if you are in DB...");
      name = data.username.Name;
    } catch (e) {
      console.log("You are not in DB, running add");
      name = await addUserName();
    }
    console.log("DB entry available for", name);
    return name;
  };

  // get id of user from database by their name
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
      id = data.username.id;
    } catch (e) {
      await addUserName();
      id = await getUserId();
    }
    console.log("Your ID in DB:", id);
    return id;
  };

  // add user to database
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
    name = data.addUser.Name;
    console.log("Created DB entry for you", name);
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

  // fetch messages via channel from graphql API
  const fetchChannel = async () => {
    console.log("Fetching all messages from " + currentChannelid);
    const channelquery = {
      query: `{
        channel(id: "${currentChannelid}") {
          id
          Name
          Topic
          Users {
            id
          }
          Messages {
            id
            From{
              id
              Name
            }
            Content
          }
        }
      }
        `,
    };
    const data = await fetchGraphql(channelquery);
    console.log("Fetching a channel", data);
    data.channel.Messages.forEach((type) => {
      const item = document.createElement("li");
      if (type.Content.startsWith("data:image")) {
        console.log(
          "A message started with 'data:image', including <img> tags to it"
        );
        item.innerHTML = `<b>${type.From.Name}</b>: <img src="${type.Content}" alt="image sent by ${type.From.Name}" width="70%"/>`;
      } else {
        item.innerHTML = `<b>${type.From.Name}</b>: `;
        item.innerText += `${type.Content}`;
      }
      messageList.appendChild(item);
    });
  };

  // fetch latest message from graphql API
  const fetchNew = async () => {
    const channelquery = {
      query: `{
        channel(id: "${currentChannelid}") {
          id
          Name
          Topic
          Users {
            id
          }
          Messages {
            id
            From{
              id
              Name
            }
            Content
          }
        }
      }
      `,
    };
    console.log("Fetching the new message");
    const data = await fetchGraphql(channelquery);
    let latest = data.channel.Messages.pop();
    const item = document.createElement("li");
    if (latest.Content.startsWith("data:image")) {
      console.log(
        "A message started with 'data:image', including <img> tags to it"
      );
      item.innerHTML = `<b>${latest.From.Name}</b>: <img src="${latest.Content}" alt="image sent by ${latest.From.Name}" width="70%"/>`;
    } else {
      item.innerHTML = `<b>${latest.From.Name}</b>: `;
      item.innerText += `${latest.Content}`;
    }
    messageList.appendChild(item);
  };

  // fetch users via channel from graphql API
  const fetchUsers = async () => {
    const channelquery = {
      query: `{
        channel(id: "${currentChannelid}") {
          id
          Users {
            id
            Name
          }
        }
      }
      `,
    };
    const data = await fetchGraphql(channelquery);
    userList.innerHTML = "";
    data.channel.Users.forEach((type) => {
      const item = document.createElement("li");
      item.innerHTML = `${type.Name}`;
      userList.appendChild(item);
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
    channelid = data.addChannel.id;
    console.log(
      "A new channel " + channelname + " was now created with ID " + channelid
    );
    return channelid;
  };

  // fetch get channel id by its name from graphql API
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
      console.log("Channel info:", data);
      channelid = data.channelname.id;
    } catch (e) {
      console.log(
        "The error here is in a catch{} of a try{}, merely indicating that there is no channel with this name."
      );
      console.error(
        "This error is a console.error() entry for the internal server error above. This is probably 'cannot read property channelname, as the channel doesnt yet exist",
        e
      );
      console.log(
        "Therefore calling the creation of the channel" + channelname + "now..."
      );
      channelid = await addChannel(channelname);
    }
    return channelid;
  };

  // push an user to a channel
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
    console.log("An user ID reference was added to the channel object");
    return data;
  };

  // pull an user from a channel
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
    console.log("An user ID reference was removed from the channel object");
    return data;
  };

  // push channel to user
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
    const data = await fetchGraphql(query);
    console.log("An channel ID reference was added to the user object");
    return data;
  };

  // pull channel from user
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
    console.log("An user ID reference was removed from the channel object");
    return data;
  };

  // push message to user
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
    const data = await fetchGraphql(query);
    console.log("A message ID reference was added to the user object");
    return data;
  };

  // push message to channel
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
    const data = await fetchGraphql(query);
    console.log("A message ID reference was added to the channel object");
    return data;
  };

  // add a new message with graphql API
  const addMessage = async (messagecontent) => {
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
    console.log("Created new message:", data);
    return data.addMessage.id;
  };

  //#################################
  //# MESSAGING AND USER MANAGEMENT #
  //#################################

  // Main messageform listener
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (messageInput.value.startsWith("/", 0)) {
      socket.emit("command", messageInput.value);
    } else if (currentChannelid == "") {
      serverMessage(
        "You need to be in a channel to send a non-command message!"
      );
    } else if (fileInput.value != "") {
      if (fileSizeValidation()) {
        encodeImageAndSend(fileInput);
      }
    } else {
      if (messageInput.value != "") {
        sendMessage(messageInput.value);
      } else {
        serverMessage(`Please don't send messages without content`);
      }
    }
    fileInput.value = "";
    messageInput.value = "";
  });

  // Filesize validator
  const fileSizeValidation = () => {
    console.log("fileInput", fileInput.files[0]);
    const file = fileInput.files[0];
    if (file.size > 10485760) {
      alert("file must be select < 10 MB");
      return false;
    }
    return true;
  };

  // Image encoder to base64
  const encodeImageAndSend = (element) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result.startsWith("data:image")) {
        imageMessage(reader.result);
      } else {
        alert("Only image uploads are currently allowed!");
      }
    };
    const file = reader.readAsDataURL(element.files[0]);
  };

  // Non-broadcasted message send to the user, e.g. errormessages
  const serverMessage = (msg) => {
    msg = `<b>SERVER</b>: ${msg}`;
    socket.emit("self message", msg);
  };

  // Channel joining logic
  const joinChannel = async (channel) => {
    channelList.innerHTML = "";
    messageList.innerHTML = "";
    userList.innerHTML = "";
    document.getElementById("channelsh").innerText = "Channels";
    document.getElementById("usersh").innerText = "Users";
    const channelElement = document.createElement("li");
    channelElement.innerText = channel;
    channelList.appendChild(channelElement);
    currentChannelid = await getChannelid(channel);
    currentChannelname = channel;
    await addUserToChannel();
    await addChannelToUser();
    await fetchChannel();
    await fetchUsers();
  };

  // Channel leaving logic
  const leaveChannel = async () => {
    await removeUserFromChannel();
    await removeChannelFromUser();
    document.getElementById("channelsh").innerText = "";
    document.getElementById("usersh").innerText = "";
    currentChannelid = "";
    currentChannelname = "";
    channelList.innerHTML = "";
    messageList.innerHTML = "";
    userList.innerHTML = "";
  };

  // Add an user to the database with socket.id name
  const setOwnName = async () => {
    username = await addUserName();
    userid = await getUserId();
  };

  // Add message to database and make socket broadcast to update messages
  const sendMessage = async (content) => {
    const messageid = await addMessage(content);
    await addMessageToUser(messageid);
    await addMessageToChannel(messageid);
    socket.emit("send message", username, currentChannelname, content);
  };

  // Add base64-encoded image to database and make socket
  // broadcast to update messages
  const imageMessage = async (messagecontent) => {
    console.log(
      "Attached file was <10MB and was image, base64-encoded the file and attached to a message"
    );
    socket.emit(
      "send image message",
      userid,
      currentChannelid,
      currentChannelname,
      messagecontent
    );
    socket.emit("chat message");
  };

  //##################################
  //# COMMAND CALLS AND SOCKET CALLS #
  //##################################

  // Command logic
  socket.on("command", async (msg) => {
    console.log("Command issued: " + msg);
    if (msg.startsWith("/join ")) {
      if (currentChannelid == "") {
        let newchannel = msg.replace("/join ", "");
        await joinChannel(newchannel);
        socket.emit("join", username, newchannel);
      } else {
        serverMessage("Please /leave from this channel before joining another");
      }
    } else if (msg.startsWith("/leave")) {
      const oldchannel = currentChannelname;
      await leaveChannel();
      socket.emit("leave", username, oldchannel);
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

  // Fetch latest message when called by socket event
  socket.on("chat message", () => {
    console.log("Socket.io call for a new message received!");
    fetchNew();
  });

  // Non-broadcasted message
  socket.on("self message", (msg) => {
    const item = document.createElement("li");
    item.innerHTML = msg;
    messageList.appendChild(item);
  });

  // Socket calls to create user on connect with this
  socket.on("set user", () => {
    setOwnName();
  });

  // Update userlist of channel when called by socket event
  socket.on("userlist change", () => {
    if (currentChannelid != "") {
      console.log("Socket.io call for an userlist change received!");
      fetchUsers();
    }
  });
})();
