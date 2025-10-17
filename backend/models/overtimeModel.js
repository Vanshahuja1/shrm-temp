const mongoose = require("mongoose")

const overtimeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "User",
    },
    date: {
      type: String,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 8,
    },
    justification: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComments: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

overtimeSchema.index({ employeeId: 1, date: 1 })
overtimeSchema.index({ status: 1 })

module.exports = mongoose.model("Overtime", overtimeSchema)
