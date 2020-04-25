"use strict";

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLNonNull,
} = require("graphql");

const channelModel = require("../models/channel");
const messageModel = require("../models/message");
const userModel = require("../models/user");

const channel = new GraphQLObjectType({
  name: "channel",
  description: "Channel",
  fields: () => ({
    id: { type: GraphQLID },
    Name: { type: GraphQLString },
    Topic: { type: GraphQLString },
    Users: {
      type: user,
      resolve: async (parent, args) => {
        try {
          return await userModel.findById(parent.Users);
        } catch (e) {
          console.error("channel > Users: ", e);
          return new Error(e);
        }
      },
    },
    Messages: {
      type: message,
      resolve: async (parent, args) => {
        try {
          return await messageModel.findById(parent.Messages);
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
  description: "Message",
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
  description: "User",
  fields: () => ({
    id: { type: GraphQLID },
    Name: { type: GraphQLString },
    Channels: {
      type: channel,
      resolve: async (parent, args) => {
        try {
          return await channelModel.findById(parent.Channels);
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
      description: "Get channel by id",
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
      description: "Get user by id",
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
      description: "Get message by id",
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
      description: "Add channel",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Users: { type: new GraphQLList(GraphQLID) },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const newChannel = new channel(args);
          return await newChannel.save();
        } catch (e) {
          console.error("mutation > addChannel ", e);
          return new Error(e.message);
        }
      },
    },
    modifyChannel: {
      type: channel,
      description: "Modify channel",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Users: { type: new GraphQLList(GraphQLID) },
        Messages: { type: new GraphQLList(GraphQLID) },
      },
      resolve: async (parent, args, { req, res }) => {
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
    deleteChannel: {
      type: channel,
      description: "Delete channel",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, { req, res }) => {
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
      description: "Add user",
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const newUser = new user(args);
          return await newUser.save();
        } catch (e) {
          console.error("mutation > addUser ", e);
          return new Error(e.message);
        }
      },
    },
    modifyUser: {
      type: user,
      description: "Modify user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Channels: { type: new GraphQLList(GraphQLID) }
      },
      resolve: async (parent, args, { req, res }) => {
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
    deleteUser: {
      type: user,
      description: "Delete user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, { req, res }) => {
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
      description: "Add message",
      args: {
        From: { type: new GraphQLNonNull(GraphQLID) },
        To: { type: new GraphQLNonNull(GraphQLID) },
        Content: { type: GraphQLString }
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const newMessage = new message(args);
          return await newMessage.save();
        } catch (e) {
          console.error("mutation > addMessage ", e);
          return new Error(e.message);
        }
      },
    },
    modifyMessage: {
      type: message,
      description: "Modify message",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        Content: { type: GraphQLString }
      },
      resolve: async (parent, args, { req, res }) => {
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
      description: "Delete message",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, { req, res }) => {
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
