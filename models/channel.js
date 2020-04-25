const mongoose = require("mongoose"),
  user = require("./user");

const Schema = mongoose.Schema;

const channelSchema = new Schema({
  Name: String,
  Topic: String,
  Users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  Messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Channel", channelSchema);
