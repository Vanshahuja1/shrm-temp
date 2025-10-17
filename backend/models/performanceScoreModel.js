const mongoose = require("mongoose")

const performanceScoreSchema = new mongoose.Schema(
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
      startDate: {
        type: Date,
        required: [true, "Start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "End date is required"],
      },
    },
    scores: {
      taskDelivery: {
        type: Number,
        min: 0,
        max: 40,
        default: 0,
        required: true,
      },
      qualityErrorRate: {
        type: Number,
        min: 0,
        max: 30,
        default: 0,
        required: true,
      },
      teamCoordination: {
        type: Number,
        min: 0,
        max: 20,
        default: 0,
        required: true,
      },
      efficiency: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
        required: true,
      },
      totalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    category: {
      type: String,
      enum: ["FEE", "EE", "AE", "BE", "PE"],
      default: "AE",
    },
    kraAchievement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    kpiAchievement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    managerEvaluation: {
      managerId: {
        type: String,
        ref: "User",
      },
      comments: {
        type: String,
        maxlength: 1000,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      evaluatedAt: {
        type: Date,
      },
    },
    selfAssessment: {
      comments: {
        type: String,
        maxlength: 1000,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      submittedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound index for unique evaluation periods per employee
performanceScoreSchema.index(
  { employeeId: 1, "evaluationPeriod.quarter": 1, "evaluationPeriod.year": 1 },
  { unique: true }
)

// Virtual for performance category calculation
performanceScoreSchema.virtual("performanceCategory").get(function () {
  const score = this.scores.totalScore
  if (score >= 91) return "FEE" // Far Exceeding Expectations
  if (score >= 81) return "EE"  // Exceeding Expectations
  if (score >= 71) return "AE"  // At Expectations
  if (score >= 60) return "BE"  // Below Expectations
  return "PE" // Poor Expectations
})

// Pre-save hook to calculate total score and category
performanceScoreSchema.pre("save", function (next) {
  // Calculate total score
  this.scores.totalScore = 
    this.scores.taskDelivery + 
    this.scores.qualityErrorRate + 
    this.scores.teamCoordination + 
    this.scores.efficiency

  // Set category based on total score
  this.category = this.performanceCategory

  next()
})

// Methods
performanceScoreSchema.methods.calculateIncrementEligibility = function (companyGrowth) {
  const performanceMultiplier = this.scores.totalScore / 100
  return companyGrowth * performanceMultiplier
}

performanceScoreSchema.methods.isEligibleForIncentive = function () {
  return this.scores.totalScore >= 81 // EE and above
}

module.exports = mongoose.model("PerformanceScore", performanceScoreSchema)
