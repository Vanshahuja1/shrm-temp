const mongoose = require("mongoose")

const kraSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
      index: true,
    },
    evaluationPeriod: {
      quarter: {
        type: String,
        required: [true, "Quarter is required"],
        enum: ["Q1", "Q2", "Q3", "Q4"],
      },
      year: {
        type: Number,
        required: [true, "Year is required"],
        min: 2020,
        max: 2030,
      },
    },
    kras: [
      {
        title: {
          type: String,
          required: [true, "KRA title is required"],
          trim: true,
          maxlength: 200,
        },
        description: {
          type: String,
          required: [true, "KRA description is required"],
          trim: true,
          maxlength: 500,
        },
        weight: {
          type: Number,
          required: [true, "KRA weight is required"],
          min: 1,
          max: 100,
        },
        target: {
          type: String,
          required: [true, "KRA target is required"],
          trim: true,
          maxlength: 300,
        },
        achievement: {
          type: String,
          trim: true,
          maxlength: 500,
          default: "",
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        evidence: [
          {
            type: String,
            trim: true,
          },
        ],
        managerComments: {
          type: String,
          trim: true,
          maxlength: 500,
          default: "",
        },
        status: {
          type: String,
          enum: ["pending", "achieved", "partially-achieved", "not-achieved"],
          default: "pending",
        },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        deadline: {
          type: Date,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    overallKraScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    setBy: {
      type: String,
      required: [true, "KRA setter is required"],
      ref: "User",
    },
    approvedBy: {
      type: String,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "in-progress", "completed"],
      default: "draft",
    },
    comments: {
      type: String,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound index for unique KRA sets per employee per period
kraSchema.index(
  { employeeId: 1, "evaluationPeriod.quarter": 1, "evaluationPeriod.year": 1 },
  { unique: true }
)

// Index for efficient querying
kraSchema.index({ setBy: 1, status: 1 })
kraSchema.index({ "kras.status": 1 })

// Virtual for KRA completion percentage
kraSchema.virtual("completionPercentage").get(function () {
  if (!this.kras || this.kras.length === 0) return 0
  
  const completedKras = this.kras.filter(
    kra => kra.status === "achieved" || kra.status === "partially-achieved"
  ).length
  
  return Math.round((completedKras / this.kras.length) * 100)
})

// Virtual for weighted average score
kraSchema.virtual("weightedAverageScore").get(function () {
  if (!this.kras || this.kras.length === 0) return 0
  
  const totalWeight = this.kras.reduce((sum, kra) => sum + kra.weight, 0)
  if (totalWeight === 0) return 0
  
  const weightedSum = this.kras.reduce(
    (sum, kra) => sum + (kra.score * kra.weight), 0
  )
  
  return Math.round(weightedSum / totalWeight)
})

// Pre-save hook to calculate overall KRA score
kraSchema.pre("save", function (next) {
  if (this.kras && this.kras.length > 0) {
    // Validate that total weight doesn't exceed 100
    const totalWeight = this.kras.reduce((sum, kra) => sum + kra.weight, 0)
    if (totalWeight > 100) {
      return next(new Error("Total KRA weights cannot exceed 100%"))
    }
    
    // Calculate weighted average score
    this.overallKraScore = this.weightedAverageScore || 0
  }
  next()
})

// Methods
kraSchema.methods.addKRA = function (kraData) {
  this.kras.push(kraData)
  return this.save()
}

kraSchema.methods.updateKRAStatus = function (kraId, status, achievement) {
  const kra = this.kras.id(kraId)
  if (kra) {
    kra.status = status
    if (achievement) kra.achievement = achievement
    if (status === "achieved" || status === "partially-achieved") {
      kra.completedAt = new Date()
    }
  }
  return this.save()
}

kraSchema.methods.calculateQuarterlyProgress = function () {
  const total = this.kras.length
  const achieved = this.kras.filter(kra => kra.status === "achieved").length
  const partial = this.kras.filter(kra => kra.status === "partially-achieved").length
  
  return {
    total,
    achieved,
    partial,
    pending: total - achieved - partial,
    achievementRate: total > 0 ? Math.round(((achieved + partial * 0.5) / total) * 100) : 0
  }
}

module.exports = mongoose.model("KRA", kraSchema)
