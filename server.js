"use strict";

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const graphqlHTTP = require("express-graphql");
const MyGraphQLSchema = require("./schema/schema");
const cors = require("cors");

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.join("global");
  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
  });

  socket.on("chat message", (user, channel, msg) => {
    if (channel == "") {
      console.log("chatmessage: " + user + ": " + msg);
      socket.emit("self message", "You need to be in a channel to send a non-command message!");
    } else {
      console.log("chatmessage: " + user + " @ " + channel + ": " + msg);
      io.to(channel).emit("chat message", user, channel, msg);
    }
  });

  socket.on("join", (channel) => {
    console.log("user " + socket.id + " joined channel " + channel);
    socket.leave("global");
    socket.join(channel);
  });

  socket.on("leave", (channel) => {
    console.log("user " + socket.id + " joined channel global");
    socket.leave(channel);
    socket.join("global");
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
    context: { req, res }
  })(req, res);
});

http.listen(3000, () => {
  console.log("listening on port 3000");
});
