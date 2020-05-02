"use strict";

const apiURL = "./graphql";

const userModel = require("../models/user");

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

module.exports.delUser = delUser;
