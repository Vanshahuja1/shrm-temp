const mongoose = require("mongoose")

const salaryIncrementSchema = new mongoose.Schema(
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
        enum: ["Q1", "Q2", "Q3", "Q4"],
      },
      year: {
        type: Number,
        required: [true, "Year is required"],
        min: 2020,
        max: 2030,
      },
      fiscalYear: {
        type: String,
        required: [true, "Fiscal year is required"],
      },
    },
    currentSalary: {
      basic: {
        type: Number,
        required: [true, "Basic salary is required"],
        min: 0,
      },
      hra: {
        type: Number,
        min: 0,
        default: 0,
      },
      allowances: {
        type: Number,
        min: 0,
        default: 0,
      },
      bonus: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        required: [true, "Total salary is required"],
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    performanceData: {
      performanceScore: {
        type: Number,
        required: [true, "Performance score is required"],
        min: 0,
        max: 100,
      },
      category: {
        type: String,
        required: [true, "Performance category is required"],
        enum: ["FEE", "EE", "AE", "BE", "PE"],
      },
      performanceScoreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PerformanceScore",
      },
      performanceReviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PerformanceReview",
      },
      kraScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      kpiScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    companyGrowthData: {
      growthPercentage: {
        type: Number,
        required: [true, "Company growth percentage is required"],
      },
      companyGrowthId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyGrowth",
      },
      revenueGrowth: {
        type: Number,
        default: 0,
      },
      profitGrowth: {
        type: Number,
        default: 0,
      },
    },
    incrementCalculation: {
      formula: {
        type: String,
        default: "Company Growth % × Performance Score %",
      },
      baseIncrement: {
        type: Number,
        required: [true, "Base increment is required"],
      },
      performanceMultiplier: {
        type: Number,
        required: [true, "Performance multiplier is required"],
      },
      categoryMultiplier: {
        type: Number,
        default: 1.0,
      },
      finalIncrement: {
        type: Number,
        required: [true, "Final increment percentage is required"],
      },
      managerDiscretion: {
        percentage: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },
        amount: {
          type: Number,
          min: 0,
          default: 0,
        },
        reason: {
          type: String,
          maxlength: 500,
        },
        approvedBy: {
          type: String,
          ref: "User",
        },
      },
      totalIncrement: {
        type: Number,
        required: [true, "Total increment percentage is required"],
      },
      cappingApplied: {
        type: Boolean,
        default: false,
      },
      cappingReason: {
        type: String,
      },
    },
    newSalary: {
      basic: {
        type: Number,
        required: [true, "New basic salary is required"],
        min: 0,
      },
      hra: {
        type: Number,
        min: 0,
        default: 0,
      },
      allowances: {
        type: Number,
        min: 0,
        default: 0,
      },
      bonus: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        required: [true, "New total salary is required"],
        min: 0,
      },
      incrementAmount: {
        type: Number,
        required: [true, "Increment amount is required"],
        min: 0,
      },
    },
    approvalWorkflow: {
      recommendedBy: {
        type: String,
        required: [true, "Recommender is required"],
        ref: "User",
      },
      recommendedAt: {
        type: Date,
        default: Date.now,
      },
      managerApproval: {
        approved: {
          type: Boolean,
          default: false,
        },
        approvedBy: {
          type: String,
          ref: "User",
        },
        approvedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 500,
        },
      },
      hrApproval: {
        approved: {
          type: Boolean,
          default: false,
        },
        approvedBy: {
          type: String,
          ref: "User",
        },
        approvedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 500,
        },
      },
      financeApproval: {
        approved: {
          type: Boolean,
          default: false,
        },
        approvedBy: {
          type: String,
          ref: "User",
        },
        approvedAt: {
          type: Date,
        },
        comments: {
          type: String,
          maxlength: 500,
        },
        budgetImpact: {
          type: Number,
          default: 0,
        },
      },
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
    },
    implementationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "recommended", "manager-approved", "hr-approved", "finance-approved", "implemented", "rejected"],
      default: "pending",
    },
    justification: {
      type: String,
      required: [true, "Justification is required"],
      maxlength: 1000,
    },
    marketBenchmark: {
      industry: {
        type: String,
      },
      role: {
        type: String,
      },
      experience: {
        type: Number,
      },
      marketSalary: {
        type: Number,
        min: 0,
        default: 0,
      },
      percentile: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
    },
    additionalBenefits: [
      {
        type: {
          type: String,
          enum: ["bonus", "stock-options", "benefits", "perks", "promotion"],
        },
        description: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          min: 0,
          default: 0,
        },
        effectiveDate: {
          type: Date,
        },
      },
    ],
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
    auditTrail: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: String,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        comments: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound index for unique increments per employee per period
salaryIncrementSchema.index(
  { 
    employeeId: 1, 
    "evaluationPeriod.quarter": 1, 
    "evaluationPeriod.year": 1 
  },
  { unique: true }
)

// Index for efficient querying
salaryIncrementSchema.index({ status: 1, effectiveDate: 1 })
salaryIncrementSchema.index({ "approvalWorkflow.recommendedBy": 1, status: 1 })

// Virtual for increment percentage
salaryIncrementSchema.virtual("incrementPercentage").get(function () {
  if (this.currentSalary.total === 0) return 0
  return Math.round(((this.newSalary.incrementAmount / this.currentSalary.total) * 100) * 100) / 100
})

// Virtual for approval status
salaryIncrementSchema.virtual("allApprovalsReceived").get(function () {
  return (
    this.approvalWorkflow.managerApproval.approved &&
    this.approvalWorkflow.hrApproval.approved &&
    this.approvalWorkflow.financeApproval.approved
  )
})

// Virtual for days since recommendation
salaryIncrementSchema.virtual("daysSinceRecommendation").get(function () {
  if (!this.approvalWorkflow.recommendedAt) return 0
  const diffTime = new Date() - this.approvalWorkflow.recommendedAt
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save hook to calculate new salary and update status
salaryIncrementSchema.pre("save", function (next) {
  // Calculate new salary components
  const incrementPercentage = this.incrementCalculation.totalIncrement / 100
  
  this.newSalary.basic = Math.round(this.currentSalary.basic * (1 + incrementPercentage))
  this.newSalary.hra = Math.round(this.currentSalary.hra * (1 + incrementPercentage))
  this.newSalary.allowances = Math.round(this.currentSalary.allowances * (1 + incrementPercentage))
  this.newSalary.bonus = this.currentSalary.bonus // Bonus usually doesn't change with increment
  
  this.newSalary.total = this.newSalary.basic + this.newSalary.hra + this.newSalary.allowances + this.newSalary.bonus
  this.newSalary.incrementAmount = this.newSalary.total - this.currentSalary.total
  
  // Update status based on approvals
  if (this.allApprovalsReceived && this.status !== "implemented") {
    this.status = "finance-approved"
  } else if (this.approvalWorkflow.hrApproval.approved && this.status === "manager-approved") {
    this.status = "hr-approved"
  } else if (this.approvalWorkflow.managerApproval.approved && this.status === "recommended") {
    this.status = "manager-approved"
  }
  
  next()
})

// Methods
salaryIncrementSchema.methods.calculateIncrement = function (companyGrowth, performanceScore, category) {
  // Category multipliers
  const categoryMultipliers = {
    "FEE": 1.5, // Far Exceeding Expectations
    "EE": 1.2,  // Exceeding Expectations  
    "AE": 1.0,  // At Expectations
    "BE": 0.7,  // Below Expectations
    "PE": 0.0   // Poor Expectations
  }
  
  this.incrementCalculation.baseIncrement = companyGrowth
  this.incrementCalculation.performanceMultiplier = performanceScore / 100
  this.incrementCalculation.categoryMultiplier = categoryMultipliers[category] || 1.0
  
  this.incrementCalculation.finalIncrement = 
    companyGrowth * (performanceScore / 100) * this.incrementCalculation.categoryMultiplier
  
  this.incrementCalculation.totalIncrement = 
    this.incrementCalculation.finalIncrement + (this.incrementCalculation.managerDiscretion.percentage || 0)
  
  return this.save()
}

salaryIncrementSchema.methods.addApproval = function (approvalType, approverId, approved, comments) {
  const approval = this.approvalWorkflow[approvalType]
  if (approval) {
    approval.approved = approved
    approval.approvedBy = approverId
    approval.approvedAt = new Date()
    if (comments) approval.comments = comments
    
    // Add to audit trail
    this.auditTrail.push({
      action: `${approvalType} ${approved ? 'approved' : 'rejected'}`,
      performedBy: approverId,
      comments: comments
    })
  }
  return this.save()
}

salaryIncrementSchema.methods.implementIncrement = function (implementedBy) {
  if (!this.allApprovalsReceived) {
    throw new Error("Cannot implement increment without all approvals")
  }
  
  this.status = "implemented"
  this.implementationDate = new Date()
  
  this.auditTrail.push({
    action: "increment implemented",
    performedBy: implementedBy,
    newValue: {
      oldSalary: this.currentSalary.total,
      newSalary: this.newSalary.total,
      incrementAmount: this.newSalary.incrementAmount
    }
  })
  
  return this.save()
}

salaryIncrementSchema.methods.generateIncrementLetter = function () {
  return {
    employee: this.employeeId,
    effectiveDate: this.effectiveDate,
    currentSalary: this.currentSalary.total,
    newSalary: this.newSalary.total,
    incrementAmount: this.newSalary.incrementAmount,
    incrementPercentage: this.incrementPercentage,
    performanceScore: this.performanceData.performanceScore,
    category: this.performanceData.category,
    justification: this.justification,
    approvals: {
      manager: this.approvalWorkflow.managerApproval.approvedBy,
      hr: this.approvalWorkflow.hrApproval.approvedBy,
      finance: this.approvalWorkflow.financeApproval.approvedBy
    }
  }
}

salaryIncrementSchema.methods.calculateBudgetImpact = function (annualMultiplier = 12) {
  const monthlyImpact = this.newSalary.incrementAmount
  const annualImpact = monthlyImpact * annualMultiplier
  
  return {
    monthlyImpact,
    annualImpact,
    effectiveMonths: this.calculateEffectiveMonths(),
    totalCostThisYear: monthlyImpact * this.calculateEffectiveMonths()
  }
}

salaryIncrementSchema.methods.calculateEffectiveMonths = function () {
  if (!this.effectiveDate) return 0
  
  const today = new Date()
  const yearEnd = new Date(today.getFullYear(), 11, 31) // December 31st
  const effectiveDate = new Date(this.effectiveDate)
  
  if (effectiveDate > yearEnd) return 0
  
  const monthsRemaining = Math.ceil((yearEnd - effectiveDate) / (1000 * 60 * 60 * 24 * 30))
  return Math.max(0, Math.min(12, monthsRemaining))
}

module.exports = mongoose.model("SalaryIncrement", salaryIncrementSchema)
