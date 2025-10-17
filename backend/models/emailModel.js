const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "member_crud",
      "increment",
      "decrement",
      "penalty",
      "general",
      "notification",
      "warning"
    ],
    default: "notification",
    required: true,
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
  },
  recipients: {
    type: [String],
    default: [],
    trim: true,
  },
  recipientId: {
    type: String,
    required: true,
    trim: true,
  },
  recipientIds: {
    type: [String],
    default: [],
    trim: true,
  },
  cc: {
    type: [String],
    default: [],
    trim: true,
  },
  ccIds: {
    type: [String],
    default: [],
    trim: true,
  },
  sender: {
    type: String,
    required: true,
    trim: true,
  },
  senderId: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "failed", "pending"],
    default: "pending",
  },
  isRead: {
    type: Boolean,
    default: false,
  },

  isStarred: {
    type: Boolean,
    default: false,
  },
  attachments: {
    type: [String], 
    default: [],
  },
});

module.exports = mongoose.model("Email", emailSchema);
