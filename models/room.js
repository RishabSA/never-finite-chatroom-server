const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    isPrivate: { type: Boolean, required: true },
    users: { type: Array, default: [] },
  },
  { collection: "rooms" }
);

const model = mongoose.model("RoomModel", RoomSchema);

module.exports = model;
