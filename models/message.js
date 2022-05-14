const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    room: { type: String, required: true },
    photoURL: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, required: true },
    createdAtDisplay: { type: String, required: true },
    text: { type: String, default: "" },
    media: { type: String, default: "" },
    mediaPath: { type: String, default: "" },
    isEdited: { type: Boolean, default: false },
    uid: { type: String, required: "" },
  },
  { collection: "messages" }
);

const model = mongoose.model("MessageModel", MessageSchema);

module.exports = model;
