const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    photoURL: { type: String, required: true },
    email: { type: String, required: true },
    accountStatus: { type: String, required: true },
    rooms: { type: Array, default: [] },
    invites: { type: Array, default: [] },
  },
  { collection: "users" }
);

const model = mongoose.model("UserModel", UserSchema);

module.exports = model;
