const mongoose = require("mongoose"),
  user = require("./user"),
  channel = require("./channel");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  From: { type: Schema.Types.ObjectId, ref: "User" },
  To: { type: Schema.Types.ObjectId, ref: "Channel" },
  Content: String,
});

module.exports = mongoose.model("Message", messageSchema);