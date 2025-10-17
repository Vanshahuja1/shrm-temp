const mongoose = require("mongoose")

const taskPerformanceSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, "Task ID is required"],
      ref: "Task",
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
      index: true,
    },
    projectId: {
      type: String,
      ref: "Project",
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
    taskDetails: {
      title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      complexity: {
        type: String,
        enum: ["simple", "medium", "complex", "expert"],
        default: "medium",
      },
      category: {
        type: String,
        enum: ["development", "design", "testing", "documentation", "review", "meeting", "research"],
        required: true,
      },
    },
    timeMetrics: {
      estimatedHours: {
        type: Number,
        required: [true, "Estimated hours is required"],
        min: 0.5,
        max: 200,
      },
      actualHours: {
        type: Number,
        required: [true, "Actual hours is required"],
        min: 0,
        max: 300,
      },
      efficiency: {
        type: Number,
        min: 0,
        max: 200,
        default: 0,
      },
      deadlineAdherence: {
        type: Boolean,
        default: false,
      },
      daysEarlyLate: {
        type: Number,
        default: 0,
      },
      plannedStartDate: {
        type: Date,
      },
      actualStartDate: {
        type: Date,
      },
      plannedEndDate: {
        type: Date,
      },
      actualEndDate: {
        type: Date,
      },
    },
    qualityMetrics: {
      errorCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      reworkRequired: {
        type: Boolean,
        default: false,
      },
      reworkHours: {
        type: Number,
        min: 0,
        default: 0,
      },
      clientFeedback: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      codeQualityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      testCoverage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      bugCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      reviewComments: {
        type: String,
        maxlength: 1000,
      },
    },
    deliveryMetrics: {
      onTimeDelivery: {
        type: Boolean,
        default: false,
      },
      completionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      scopeAdherence: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      requirementsCoverage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    teamMetrics: {
      communicationRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      collaborationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      helpProvided: {
        type: Number,
        min: 0,
        default: 0,
      },
      knowledgeSharing: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      mentoring: {
        type: Number,
        min: 0,
        default: 0,
      },
      teamContribution: {
        type: String,
        maxlength: 500,
      },
    },
    overallTaskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    weightInPerformance: {
      type: Number,
      min: 1,
      max: 100,
      default: 10,
    },
    evaluatedBy: {
      type: String,
      required: [true, "Evaluator is required"],
      ref: "User",
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "evaluated", "approved"],
      default: "pending",
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      managerComments: {
        type: String,
        maxlength: 1000,
      },
      employeeComments: {
        type: String,
        maxlength: 1000,
      },
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound indexes for efficient querying
taskPerformanceSchema.index({ employeeId: 1, "evaluationPeriod.quarter": 1, "evaluationPeriod.year": 1 })
taskPerformanceSchema.index({ taskId: 1, employeeId: 1 }, { unique: true })
taskPerformanceSchema.index({ projectId: 1, status: 1 })
taskPerformanceSchema.index({ evaluatedBy: 1, status: 1 })

// Virtual for efficiency calculation
taskPerformanceSchema.virtual("calculatedEfficiency").get(function () {
  if (this.timeMetrics.actualHours === 0) return 0
  return Math.round((this.timeMetrics.estimatedHours / this.timeMetrics.actualHours) * 100)
})

// Virtual for quality score
taskPerformanceSchema.virtual("qualityScore").get(function () {
  const baseScore = 100
  const errorPenalty = this.qualityMetrics.errorCount * 5
  const reworkPenalty = this.qualityMetrics.reworkRequired ? 10 : 0
  const bugPenalty = this.qualityMetrics.bugCount * 3
  
  return Math.max(0, baseScore - errorPenalty - reworkPenalty - bugPenalty)
})

// Virtual for delivery score
taskPerformanceSchema.virtual("deliveryScore").get(function () {
  let score = 0
  
  // On-time delivery (40 points)
  if (this.deliveryMetrics.onTimeDelivery) score += 40
  
  // Completion percentage (30 points)
  score += (this.deliveryMetrics.completionPercentage / 100) * 30
  
  // Scope adherence (20 points)
  score += (this.deliveryMetrics.scopeAdherence / 100) * 20
  
  // Requirements coverage (10 points)
  score += (this.deliveryMetrics.requirementsCoverage / 100) * 10
  
  return Math.round(score)
})

// Pre-save hook to calculate metrics and overall score
taskPerformanceSchema.pre("save", function (next) {
  // Calculate efficiency
  if (this.timeMetrics.estimatedHours > 0 && this.timeMetrics.actualHours > 0) {
    this.timeMetrics.efficiency = this.calculatedEfficiency
  }
  
  // Calculate days early/late
  if (this.timeMetrics.plannedEndDate && this.timeMetrics.actualEndDate) {
    const diffTime = this.timeMetrics.plannedEndDate - this.timeMetrics.actualEndDate
    this.timeMetrics.daysEarlyLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    this.timeMetrics.deadlineAdherence = this.timeMetrics.daysEarlyLate >= 0
    this.deliveryMetrics.onTimeDelivery = this.timeMetrics.deadlineAdherence
  }
  
  // Calculate overall task score (weighted average)
  const timeScore = Math.min(100, this.timeMetrics.efficiency || 0)
  const qualityScore = this.qualityScore || 0
  const deliveryScore = this.deliveryScore || 0
  const teamScore = (this.teamMetrics.collaborationScore || 0)
  
  // Weighted calculation: Time(30%) + Quality(40%) + Delivery(20%) + Team(10%)
  this.overallTaskScore = Math.round(
    (timeScore * 0.3) + 
    (qualityScore * 0.4) + 
    (deliveryScore * 0.2) + 
    (teamScore * 0.1)
  )
  
  next()
})

// Methods
taskPerformanceSchema.methods.updateProgress = function (completionPercentage) {
  this.deliveryMetrics.completionPercentage = completionPercentage
  if (completionPercentage === 100) {
    this.status = "completed"
    this.timeMetrics.actualEndDate = new Date()
  }
  return this.save()
}

taskPerformanceSchema.methods.addFeedback = function (feedbackData, feedbackType = "manager") {
  if (feedbackType === "manager") {
    this.feedback.managerComments = feedbackData.comments
    if (feedbackData.strengths) this.feedback.strengths = feedbackData.strengths
    if (feedbackData.improvements) this.feedback.improvements = feedbackData.improvements
  } else {
    this.feedback.employeeComments = feedbackData.comments
  }
  return this.save()
}

taskPerformanceSchema.methods.calculateImpactOnPerformance = function () {
  const score = this.overallTaskScore
  const weight = this.weightInPerformance
  
  return {
    contribution: (score * weight) / 100,
    category: score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "average" : "poor",
    recommendations: this.generateRecommendations()
  }
}

taskPerformanceSchema.methods.generateRecommendations = function () {
  const recommendations = []
  
  if (this.timeMetrics.efficiency < 80) {
    recommendations.push("Focus on time management and planning")
  }
  
  if (this.qualityMetrics.errorCount > 3) {
    recommendations.push("Improve code review and testing practices")
  }
  
  if (this.teamMetrics.collaborationScore < 60) {
    recommendations.push("Enhance team communication and collaboration")
  }
  
  if (!this.deliveryMetrics.onTimeDelivery) {
    recommendations.push("Work on meeting deadlines consistently")
  }
  
  return recommendations
}

module.exports = mongoose.model("TaskPerformance", taskPerformanceSchema)
