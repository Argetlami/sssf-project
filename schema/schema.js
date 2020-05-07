// sorry

"use strict";

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = require("graphql");

const channelModel = require("../models/channel");
const messageModel = require("../models/message");
const userModel = require("../models/user");

const channel = new GraphQLObjectType({
  name: "channel",
  description: "Channel object",
  fields: () => ({
    id: { type: GraphQLID },
    Name: { type: GraphQLString },
    Topic: { type: GraphQLString },
    Users: {
      type: new GraphQLList(user),
      resolve: async (parent, args) => {
        try {
          return await userModel.find({ _id: { $in: parent.Users } });
        } catch (e) {
          console.error("channel > Users: ", e);
          return new Error(e);
        }
      },
    },
    Messages: {
      type: new GraphQLList(message),
      resolve: async (parent, args) => {
        try {
          return await messageModel.find({ _id: { $in: parent.Messages } });
        } catch (e) {
          console.error("channel > Messages: ", e);
          return new Error(e);
        }
      },
    },
  }),
});

const message = new GraphQLObjectType({
  name: "message",
  description: "Message object",
  fields: () => ({
    id: { type: GraphQLID },
    From: {
      type: user,
      resolve: async (parent, args) => {
        try {
          return await userModel.findById(parent.From);
        } catch (e) {
          console.error("message > From: ", e);
          return new Error(e);
        }
      },
    },
    To: {
      type: channel,
      resolve: async (parent, args) => {
        try {
          return await channelModel.findById(parent.To);
        } catch (e) {
          console.error("message > To: ", e);
          return new Error(e);
        }
      },
    },
    Content: { type: GraphQLString },
  }),
});

const user = new GraphQLObjectType({
  name: "user",
  description: "User object",
  fields: () => ({
    id: { type: GraphQLID },
    Name: { type: GraphQLString },
    Channels: {
      type: new GraphQLList(channel),
      resolve: async (parent, args) => {
        try {
          return await channelModel.find({ _id: { $in: parent.Channels } });
        } catch (e) {
          console.error("user > Channels: ", e);
          return new Error(e);
        }
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Main query",
  fields: {
    channels: {
      type: new GraphQLNonNull(GraphQLList(channel)),
      description: "Get all channels",
      resolve: async (parent, args) => {
        try {
          return await channelModel.find();
        } catch (e) {
          console.error("root > channels: ", e);
          return new Error(e.message);
        }
      },
    },
    channel: {
      type: new GraphQLNonNull(channel),
      description: "Get a channel by id",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findById(args.id);
        } catch (e) {
          console.error("root > channel: ", e);
          return new Error(e.message);
        }
      },
    },
    channelname: {
      type: new GraphQLNonNull(channel),
      description: "Get channel by its name",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findOne({ Name: args.Name });
        } catch (e) {
          console.error("root > channelname: ", e);
          return new Error(e.message);
        }
      },
    },
    users: {
      type: new GraphQLNonNull(GraphQLList(user)),
      description: "Get all users",
      resolve: async (parent, args) => {
        try {
          return await userModel.find();
        } catch (e) {
          console.error("root > users: ", e);
          return new Error(e.message);
        }
      },
    },
    user: {
      type: new GraphQLNonNull(user),
      description: "Get an user by id",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findById(args.id);
        } catch (e) {
          console.error("root > user: ", e);
          return new Error(e.message);
        }
      },
    },
    username: {
      type: new GraphQLNonNull(user),
      description: "Get user by its name",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findOne({ Name: args.Name });
        } catch (e) {
          console.error("root > username: ", e);
          return new Error(e.message);
        }
      },
    },
    messages: {
      type: new GraphQLNonNull(GraphQLList(message)),
      description: "Get all messages",
      resolve: async (parent, args) => {
        try {
          return await messageModel.find();
        } catch (e) {
          console.error("root > messages: ", e);
          return new Error(e.message);
        }
      },
    },
    message: {
      type: new GraphQLNonNull(message),
      description: "Get a message by id",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await messageModel.findById(args.id);
        } catch (e) {
          console.error("root > message: ", e);
          return new Error(e.message);
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutations",
  fields: {
    addChannel: {
      type: channel,
      description: "Add a new channel",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Users: { type: new GraphQLList(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          const newChannel = new channelModel(args);
          return await newChannel.save();
        } catch (e) {
          console.error("mutation > addChannel ", e);
          return new Error(e.message);
        }
      },
    },
    modifyChannel: {
      type: channel,
      description: "Modify an existing channel",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Name: { type: GraphQLString },
        Users: { type: new GraphQLList(GraphQLID) },
        Messages: { type: new GraphQLList(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findByIdAndUpdate(args.id, args, {
            new: true,
          });
        } catch (e) {
          console.error("mutation > modifyChannel ", e);
          return new Error(e.message);
        }
      },
    },
    addUserToChannel: {
      type: channel,
      description: "Add an user to the Users list of channel object ",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        User: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findByIdAndUpdate(
            args.id,
            { $push: { Users: args.User } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > addUserToChannel ", e);
          return new Error(e.message);
        }
      },
    },
    removeUserFromChannel: {
      type: channel,
      description: "Remove an user from Users list of the channel object",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        User: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findByIdAndUpdate(
            args.id,
            { $pull: { Users: args.User } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > removeUserFromChannel ", e);
          return new Error(e.message);
        }
      },
    },
    addMessageToChannel: {
      type: channel,
      description: "Add a message to the Messages list of the channel object",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Message: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findByIdAndUpdate(
            args.id,
            { $push: { Messages: args.Message } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > addMessageToChannel ", e);
          return new Error(e.message);
        }
      },
    },
    deleteChannel: {
      type: channel,
      description: "Delete an existing channel",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await channelModel.findByIdAndDelete(args.id);
        } catch (e) {
          console.error("mutation > deleteChannel ", e);
          return new Error(e.message);
        }
      },
    },
    addUser: {
      type: user,
      description: "Add a new user",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const newUser = new userModel(args);
          return await newUser.save();
        } catch (e) {
          console.error("mutation > addUser ", e);
          return new Error(e.message);
        }
      },
    },
    modifyUser: {
      type: user,
      description: "Modify an existing user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Channels: { type: new GraphQLList(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndUpdate(args.id, args, {
            new: true,
          });
        } catch (e) {
          console.error("mutation > modifyUser ", e);
          return new Error(e.message);
        }
      },
    },
    addChannelToUser: {
      type: channel,
      description: "Add a channel to the Channels list of an user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Channel: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndUpdate(
            args.id,
            { $push: { Channels: args.Channel } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > addChannelToUser ", e);
          return new Error(e.message);
        }
      },
    },
    removeChannelFromUser: {
      type: channel,
      description: "Remove a channel from the Channels list of an user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Channel: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndUpdate(
            args.id,
            { $pull: { Channels: args.Channel } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > removeChannelFromUser ", e);
          return new Error(e.message);
        }
      },
    },
    addMessageToUser: {
      type: channel,
      description: "Add a message to the Messages list of an user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Message: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndUpdate(
            args.id,
            { $push: { Messages: args.Message } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > addMessageToUser ", e);
          return new Error(e.message);
        }
      },
    },
    removeMessageFromUser: {
      type: channel,
      description: "Remove a message from an user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Channel: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndUpdate(
            args.id,
            { $pull: { Messages: args.Message } },
            { new: true }
          );
        } catch (e) {
          console.error("mutation > removeMessageFromUser ", e);
          return new Error(e.message);
        }
      },
    },
    deleteUser: {
      type: user,
      description: "Delete an existing user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await userModel.findByIdAndDelete(args.id);
        } catch (e) {
          console.error("mutation > deleteUser ", e);
          return new Error(e.message);
        }
      },
    },
    addMessage: {
      type: message,
      description: "Add a new message",
      args: {
        From: { type: new GraphQLNonNull(GraphQLID) },
        To: { type: new GraphQLNonNull(GraphQLID) },
        Content: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          const newMessage = new messageModel(args);
          return await newMessage.save();
        } catch (e) {
          console.error("mutation > addMessage ", e);
          return new Error(e.message);
        }
      },
    },
    modifyMessage: {
      type: message,
      description: "Modify an existing message",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Content: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          return await messageModel.findByIdAndUpdate(args.id, args, {
            new: true,
          });
        } catch (e) {
          console.error("mutation > modifyMessage ", e);
          return new Error(e.message);
        }
      },
    },
    deleteMessage: {
      type: message,
      description: "Delete an existing message",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await messageModel.findByIdAndDelete(args.id);
        } catch (e) {
          console.error("mutation > deleteMessage ", e);
          return new Error(e.message);
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
