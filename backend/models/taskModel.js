const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      id: String,
      name: String,
    },
    assignedBy: {
      id: String,
      name: String,
    },
    dueDate: {
      type: String,
      required: true,
    },
    dueTime: {
      type: String,
      default: "17:00",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    weightage: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    category: {
      type: String,
      default: "general",
    },
    estimatedHours: {
      type: Number,
      default: 1,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        path: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for better performance
TaskSchema.index({ "assignedTo.id": 1, status: 1 })
TaskSchema.index({ dueDate: 1 })
TaskSchema.index({ priority: 1 })

const Task = mongoose.model("Task", TaskSchema)

module.exports = Task
