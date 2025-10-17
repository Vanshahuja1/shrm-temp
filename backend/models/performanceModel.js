const mongoose = require("mongoose")

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "User",
    },
    month: {
      type: String,
      required: true,
      // Format: YYYY-MM
    },
    metrics: {
      tasksCompleted: {
        type: Number,
        default: 0,
      },
      tasksAssigned: {
        type: Number,
        default: 0,
      },
      averageTasksPerDay: {
        type: Number,
        default: 0,
      },
      attendanceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      managerRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      combinedPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      managerComments: String,
    },
    goals: [
      {
        title: String,
        description: String,
        targetDate: Date,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

performanceSchema.index({ employeeId: 1, month: 1 }, { unique: true })

// Calculate combined percentage
performanceSchema.methods.calculateCombinedScore = function () {
  const weights = {
    completionRate: 0.4,
    attendanceScore: 0.3,
    managerRating: 0.3,
  }

  const normalizedManagerRating = (this.metrics.managerRating / 5) * 100

  this.metrics.combinedPercentage = Math.round(
    this.metrics.completionRate * weights.completionRate +
      this.metrics.attendanceScore * weights.attendanceScore +
      normalizedManagerRating * weights.managerRating,
  )
}

module.exports = mongoose.model("Performance", performanceSchema)
