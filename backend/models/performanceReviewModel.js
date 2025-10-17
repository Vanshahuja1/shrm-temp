const mongoose = require("mongoose")

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
      index: true,
    },
    reviewerId: {
      type: String,
      required: [true, "Reviewer ID is required"],
      ref: "User",
    },
    reviewType: {
      type: String,
      required: [true, "Review type is required"],
      enum: ["quarterly", "annual", "probation", "promotion", "mid-year", "project-end"],
    },
    evaluationPeriod: {
      quarter: {
        type: String,
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
    performanceData: {
      performanceScoreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PerformanceScore",
      },
      kraId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KRA",
      },
      kpiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KPI",
      },
      taskPerformanceIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TaskPerformance",
        },
      ],
    },
    reviewSections: {
      strengths: [
        {
          area: String,
          description: String,
          evidence: String,
        },
      ],
      areasOfImprovement: [
        {
          area: String,
          description: String,
          actionPlan: String,
          timeline: String,
        },
      ],
      achievements: [
        {
          title: String,
          description: String,
          impact: String,
          recognition: String,
        },
      ],
      goals: [
        {
          title: String,
          description: String,
          timeline: String,
          measurable: String,
          priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
          },
        },
      ],
      trainingNeeds: [
        {
          skill: String,
          justification: String,
          priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
          },
          timeline: String,
        },
      ],
    },
    ratings: {
      technical: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      leadership: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      initiative: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      reliability: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      teamwork: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      problemSolving: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      adaptability: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    incrementDetails: {
      recommended: {
        type: Boolean,
        default: false,
      },
      percentage: {
        type: Number,
        min: 0,
        max: 50,
        default: 0,
      },
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      justification: {
        type: String,
        maxlength: 1000,
      },
      effectiveDate: {
        type: Date,
      },
      companyGrowthFactor: {
        type: Number,
        default: 0,
      },
      performanceFactor: {
        type: Number,
        default: 0,
      },
    },
    actionItems: [
      {
        description: {
          type: String,
          required: true,
          maxlength: 500,
        },
        deadline: {
          type: Date,
          required: true,
        },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed", "overdue"],
          default: "pending",
        },
        assignedTo: {
          type: String,
          ref: "User",
        },
        completedAt: {
          type: Date,
        },
        notes: {
          type: String,
          maxlength: 500,
        },
      },
    ],
    reviewStatus: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "approved", "published", "acknowledged"],
      default: "draft",
    },
    signatures: {
      employee: {
        signed: {
          type: Boolean,
          default: false,
        },
        signedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 1000,
        },
      },
      manager: {
        signed: {
          type: Boolean,
          default: false,
        },
        signedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 1000,
        },
      },
      hr: {
        signed: {
          type: Boolean,
          default: false,
        },
        signedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 1000,
        },
      },
    },
    meetingDetails: {
      scheduled: {
        type: Boolean,
        default: false,
      },
      meetingDate: {
        type: Date,
      },
      duration: {
        type: Number, // in minutes
        default: 60,
      },
      attendees: [String],
      meetingNotes: {
        type: String,
        maxlength: 2000,
      },
    },
    documents: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedBy: String,
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

// Compound index for unique reviews per employee per period
performanceReviewSchema.index(
  { 
    employeeId: 1, 
    reviewType: 1, 
    "evaluationPeriod.quarter": 1, 
    "evaluationPeriod.year": 1 
  },
  { unique: true }
)

// Index for efficient querying
performanceReviewSchema.index({ reviewerId: 1, reviewStatus: 1 })
performanceReviewSchema.index({ reviewType: 1, "evaluationPeriod.year": 1 })

// Virtual for average rating
performanceReviewSchema.virtual("averageRating").get(function () {
  const ratings = this.ratings
  const ratingValues = Object.values(ratings).filter(val => typeof val === "number")
  
  if (ratingValues.length === 0) return 0
  
  const sum = ratingValues.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratingValues.length) * 10) / 10 // Round to 1 decimal
})

// Virtual for completion percentage
performanceReviewSchema.virtual("completionPercentage").get(function () {
  let totalSections = 0
  let completedSections = 0
  
  // Check review sections
  if (this.reviewSections.strengths.length > 0) completedSections++
  totalSections++
  
  if (this.reviewSections.areasOfImprovement.length > 0) completedSections++
  totalSections++
  
  if (this.reviewSections.achievements.length > 0) completedSections++
  totalSections++
  
  if (this.reviewSections.goals.length > 0) completedSections++
  totalSections++
  
  // Check ratings (all must be completed)
  const requiredRatings = ["technical", "communication", "leadership", "initiative", "reliability", "teamwork", "problemSolving", "adaptability"]
  const completedRatings = requiredRatings.filter(rating => this.ratings[rating] && this.ratings[rating] > 0).length
  
  if (completedRatings === requiredRatings.length) completedSections++
  totalSections++
  
  return Math.round((completedSections / totalSections) * 100)
})

// Pre-save hook to calculate overall rating and update status
performanceReviewSchema.pre("save", function (next) {
  // Calculate overall rating
  this.overallRating = this.averageRating || 3
  
  // Update review status based on completion
  if (this.completionPercentage === 100 && this.reviewStatus === "draft") {
    this.reviewStatus = "submitted"
  }
  
  // Update action item statuses based on deadlines
  this.actionItems.forEach(item => {
    if (item.status === "pending" && new Date() > item.deadline) {
      item.status = "overdue"
    }
  })
  
  next()
})

// Methods
performanceReviewSchema.methods.addActionItem = function (actionData) {
  this.actionItems.push(actionData)
  return this.save()
}

performanceReviewSchema.methods.updateActionItemStatus = function (actionId, status, notes) {
  const action = this.actionItems.id(actionId)
  if (action) {
    action.status = status
    if (notes) action.notes = notes
    if (status === "completed") action.completedAt = new Date()
  }
  return this.save()
}

performanceReviewSchema.methods.signReview = function (role, comments) {
  if (this.signatures[role]) {
    this.signatures[role].signed = true
    this.signatures[role].signedAt = new Date()
    if (comments) this.signatures[role].comments = comments
    
    // Check if all required signatures are complete
    const requiredSignatures = ["employee", "manager"]
    const allSigned = requiredSignatures.every(role => this.signatures[role].signed)
    
    if (allSigned && this.reviewStatus === "approved") {
      this.reviewStatus = "acknowledged"
    }
  }
  return this.save()
}

performanceReviewSchema.methods.calculateIncrementRecommendation = function (companyGrowth, currentSalary) {
  const performanceScore = this.overallRating / 5 * 100 // Convert 1-5 rating to 0-100 scale
  const incrementPercentage = (companyGrowth / 100) * (performanceScore / 100) * 100
  const incrementAmount = (currentSalary * incrementPercentage) / 100
  
  this.incrementDetails = {
    recommended: performanceScore >= 60, // Recommend increment for 3+ rating
    percentage: incrementPercentage,
    amount: incrementAmount,
    companyGrowthFactor: companyGrowth,
    performanceFactor: performanceScore,
    justification: `Based on ${performanceScore}% performance score and ${companyGrowth}% company growth`
  }
  
  return this.save()
}

performanceReviewSchema.methods.generateReviewSummary = function () {
  return {
    employee: this.employeeId,
    period: `${this.evaluationPeriod.quarter} ${this.evaluationPeriod.year}`,
    overallRating: this.overallRating,
    averageRating: this.averageRating,
    strengths: this.reviewSections.strengths.length,
    improvements: this.reviewSections.areasOfImprovement.length,
    goals: this.reviewSections.goals.length,
    incrementRecommended: this.incrementDetails.recommended,
    incrementPercentage: this.incrementDetails.percentage,
    actionItems: {
      total: this.actionItems.length,
      pending: this.actionItems.filter(item => item.status === "pending").length,
      completed: this.actionItems.filter(item => item.status === "completed").length,
      overdue: this.actionItems.filter(item => item.status === "overdue").length
    },
    status: this.reviewStatus,
    completionPercentage: this.completionPercentage
  }
}

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema)
