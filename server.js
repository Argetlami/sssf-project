"use strict";

require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const db = require("./db/db");
const graphqlHTTP = require("express-graphql");
const MyGraphQLSchema = require("./schema/schema");
const socketlogic = require("./utils/socketlogic");
const cors = require("cors");

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.emit("set user");
  socket.on("disconnect", () => {
    socketlogic.delUser(socket.id);
    console.log("a user disconnected", socket.id);
  });

  socket.on("send message", (user, channel, msg) => {
    if (channel == "") {
      console.log("sent message: " + user + ": " + msg);
      socket.emit(
        "self message",
        "You need to be in a channel to send a non-command message!"
      );
    } else {
      console.log("sent message: " + user + " @ " + channel + ": " + msg);
      io.to(channel).emit("chat message", user, channel, msg);
    }
  });

  socket.on("join", (user, channel) => {
    console.log("user " + user + " joined channel " + channel);
    socket.join(channel);
  });

  socket.on("leave", (user, channel) => {
    console.log("user " + user + " left channel " + channel);
    socket.leave(channel);
  });

  socket.on("command", (msg) => {
    console.log("command: ", msg);
    socket.emit("command", msg);
  });

  socket.on("self message", (msg) => {
    console.log("selfmessage: ", msg);
    io.emit("self message", msg);
  });
});

app.use("/graphql", (req, res) => {
  graphqlHTTP({
    schema: MyGraphQLSchema,
    graphiql: true,
    context: { req, res },
  })(req, res);
});

http.listen(3000, () => {
  console.log("listening on port 3000");
});
