"use strict";

const apiURL = "./graphql";

const channelModel = require("../models/channel");
const userModel = require("../models/user");
const messageModel = require("../models/message");

const delUser = async (username) => {
  let id;
  try {
    id = await userModel.findOne({ Name: username });
  } catch (e) {
    console.error("socketlogic > delUser > when getting id: " + e);
  }
  try {
    return await userModel.findByIdAndDelete(id);
  } catch (e) {
    console.error("socketlogic > delUser > when deleting by id: " + e);
  }
};

const removeUserFromChannel = async (username) => {
  try {
    const user = await userModel.findOne({ Name: username });
    if (user.Channels != "") {
      try {
        return await channelModel.findByIdAndUpdate(
          user.Channels.pop()._id,
          { $pull: { Users: user._id } },
          { new: true }
        );
      } catch (e) {
        console.error("socketlogic > removeUserFromChannel ", e);
        return new Error(e.message);
      }
    }
  } catch (e) {
    console.error("removeUserFromChannel > username: ", e);
    return new Error(e.message);
  }
};

const removeChannelFromUser = async (username) => {
  try {
    const user = await userModel.findOne({ Name: username });
    try {
      return await userModel.findByIdAndUpdate(
        user._id,
        { Channels: [] },
        { new: true }
      );
    } catch (e) {
      console.error("socketlogic > removeChannelFromUser ", e);
      return new Error(e.message);
    }
  } catch (e) {
    console.error("removeChannelFromUser > username: ", e);
    return new Error(e.message);
  }
};

const addImageMessage = async (userid, channelid, message) => {
  try {
    const newMessage = new messageModel({
      From: userid,
      To: channelid,
      Content: message,
    });
    await newMessage.save((err, messageid) => {
      if (err) return `Error occurred while saving imagemessage ${err}`;

      const { _id } = messageid;
      console.log(`New messageid: ${_id}`);
      addMessageToUser(userid, messageid);
      addMessageToChannel(channelid, messageid);
      return messageid;
    });
  } catch (e) {
    console.error("socketlogic > addimageMessage", e);
    return new Error(e.message);
  }
};

const addMessageToUser = async (userid, messageid) => {
  try {
    return await userModel.findByIdAndUpdate(
      userid,
      { $push: { Messages: messageid } },
      { new: true }
    );
  } catch (e) {
    console.error("socketlogic > addMessageToUser", e);
    return new Error(e.message);
  }
};

const addMessageToChannel = async (channelid, messageid) => {
  try {
    return await channelModel.findByIdAndUpdate(
      channelid,
      { $push: { Messages: messageid } },
      { new: true }
    );
  } catch (e) {
    console.error("socketlogic > addMessageToChannel", e);
    return new Error(e.message);
  }
};

module.exports.addImageMessage = addImageMessage;
module.exports.removeUserFromChannel = removeUserFromChannel;
module.exports.removeChannelFromUser = removeChannelFromUser;
