const mongoose = require("mongoose"),
  user = require("./user"),
  channel = require("./channel");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  Name: String,
  Channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
});

module.exports = mongoose.model("User", userSchema);
