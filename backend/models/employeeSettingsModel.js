const mongoose = require("mongoose")

const employeeSettingsSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    language: {
      type: String,
      enum: ["en", "es", "fr"],
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC-8",
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      taskReminders: {
        type: Boolean,
        default: true,
      },
      overtimeAlerts: {
        type: Boolean,
        default: true,
      },
      performanceUpdates: {
        type: Boolean,
        default: false,
      },
    },
    dashboardLayout: {
      type: String,
      enum: ["compact", "detailed", "minimal"],
      default: "detailed",
    },
    colorScheme: {
      type: String,
      enum: ["blue", "green", "purple"],
      default: "blue",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("EmployeeSettings", employeeSettingsSchema)
