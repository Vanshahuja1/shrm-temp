const mongoose = require("mongoose")

const pliVliSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
      index: true,
    },
    incentiveType: {
      type: String,
      required: [true, "Incentive type is required"],
      enum: ["PLI", "VLI", "bonus", "commission", "spot-award", "project-bonus"],
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
      startDate: {
        type: Date,
        required: [true, "Period start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "Period end date is required"],
      },
    },
    criteria: [
      {
        parameter: {
          type: String,
          required: [true, "Parameter name is required"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
        target: {
          type: Number,
          required: [true, "Target value is required"],
        },
        achieved: {
          type: Number,
          required: [true, "Achieved value is required"],
          default: 0,
        },
        weight: {
          type: Number,
          required: [true, "Weight percentage is required"],
          min: 0,
          max: 100,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        measurementType: {
          type: String,
          enum: ["percentage", "currency", "count", "rating", "hours"],
          default: "percentage",
        },
        dataSource: {
          type: String,
          enum: ["project", "client-feedback", "revenue", "manual", "system"],
          required: true,
        },
        evidence: [
          {
            description: String,
            fileUrl: String,
            verifiedBy: {
              type: String,
              ref: "User",
            },
            verifiedAt: Date,
          },
        ],
      },
    ],
    calculationMethod: {
      baseAmount: {
        type: Number,
        required: [true, "Base amount is required"],
        min: 0,
      },
      multiplier: {
        type: Number,
        default: 1.0,
        min: 0,
        max: 5.0,
      },
      formula: {
        type: String,
        default: "Base Amount × Achievement Score × Multiplier",
      },
      cappingLimit: {
        type: Number,
        min: 0,
        default: 0, // 0 means no capping
      },
      minimumThreshold: {
        type: Number,
        min: 0,
        max: 100,
        default: 70, // Minimum 70% achievement required
      },
    },
    incentiveAmount: {
      calculated: {
        type: Number,
        min: 0,
        default: 0,
      },
      managerAdjustment: {
        type: Number,
        default: 0,
      },
      adjustmentReason: {
        type: String,
        maxlength: 500,
      },
      finalAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
      payoutDate: {
        type: Date,
      },
      payoutMode: {
        type: String,
        enum: ["salary", "separate", "bonus-cycle"],
        default: "separate",
      },
    },
    projectProfitability: {
      projectId: {
        type: String,
        ref: "Project",
      },
      budgetVsActual: {
        type: Number,
        default: 0,
      },
      profitMargin: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      clientSatisfactionScore: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      timelines: {
        plannedDays: Number,
        actualDays: Number,
        efficiency: Number,
      },
      qualityMetrics: {
        bugCount: {
          type: Number,
          min: 0,
          default: 0,
        },
        reworkHours: {
          type: Number,
          min: 0,
          default: 0,
        },
        clientRevisions: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    },
    performanceMetrics: {
      overallPerformanceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
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
      attendanceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    approvalWorkflow: {
      nominatedBy: {
        type: String,
        required: [true, "Nominator is required"],
        ref: "User",
      },
      nominatedAt: {
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
        score: {
          type: Number,
          min: 0,
          max: 100,
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
        budgetApproval: {
          type: Boolean,
          default: false,
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
    approvalStatus: {
      type: String,
      enum: ["pending", "manager-approved", "hr-approved", "finance-approved", "paid", "rejected"],
      default: "pending",
    },
    paymentDetails: {
      processedBy: {
        type: String,
        ref: "User",
      },
      processedAt: {
        type: Date,
      },
      paymentReference: {
        type: String,
      },
      taxDeducted: {
        type: Number,
        min: 0,
        default: 0,
      },
      netAmount: {
        type: Number,
        min: 0,
        default: 0,
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
        category: {
          type: String,
          enum: ["evidence", "approval", "calculation", "payment"],
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

// Compound index for unique incentives per employee per period and type
pliVliSchema.index(
  { 
    employeeId: 1, 
    incentiveType: 1,
    "evaluationPeriod.quarter": 1, 
    "evaluationPeriod.year": 1 
  },
  { unique: true }
)

// Index for efficient querying
pliVliSchema.index({ approvalStatus: 1, "evaluationPeriod.year": 1 })
pliVliSchema.index({ "approvalWorkflow.nominatedBy": 1, approvalStatus: 1 })

// Virtual for overall achievement score
pliVliSchema.virtual("overallAchievementScore").get(function () {
  if (!this.criteria || this.criteria.length === 0) return 0
  
  const totalWeight = this.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
  if (totalWeight === 0) return 0
  
  const weightedSum = this.criteria.reduce(
    (sum, criterion) => sum + (criterion.score * criterion.weight), 0
  )
  
  return Math.round(weightedSum / totalWeight)
})

// Virtual for eligibility check
pliVliSchema.virtual("isEligible").get(function () {
  const achievementScore = this.overallAchievementScore
  return achievementScore >= this.calculationMethod.minimumThreshold
})

// Virtual for all approvals received
pliVliSchema.virtual("allApprovalsReceived").get(function () {
  return (
    this.approvalWorkflow.managerApproval.approved &&
    this.approvalWorkflow.hrApproval.approved &&
    this.approvalWorkflow.financeApproval.approved
  )
})

// Pre-save hook to calculate scores and amounts
pliVliSchema.pre("save", function (next) {
  // Calculate individual criterion scores
  this.criteria.forEach(criterion => {
    if (criterion.target > 0) {
      const achievementRatio = criterion.achieved / criterion.target
      criterion.score = Math.min(100, achievementRatio * 100)
    }
  })
  
  // Calculate incentive amount
  const achievementScore = this.overallAchievementScore
  
  if (achievementScore >= this.calculationMethod.minimumThreshold) {
    this.incentiveAmount.calculated = 
      this.calculationMethod.baseAmount * 
      (achievementScore / 100) * 
      this.calculationMethod.multiplier
    
    // Apply capping if defined
    if (this.calculationMethod.cappingLimit > 0) {
      this.incentiveAmount.calculated = Math.min(
        this.incentiveAmount.calculated, 
        this.calculationMethod.cappingLimit
      )
    }
  } else {
    this.incentiveAmount.calculated = 0
  }
  
  // Calculate final amount with manager adjustment
  this.incentiveAmount.finalAmount = 
    this.incentiveAmount.calculated + (this.incentiveAmount.managerAdjustment || 0)
  
  // Calculate net amount after tax
  this.paymentDetails.netAmount = 
    this.incentiveAmount.finalAmount - (this.paymentDetails.taxDeducted || 0)
  
  // Update approval status
  if (this.allApprovalsReceived && this.approvalStatus !== "paid") {
    this.approvalStatus = "finance-approved"
  }
  
  next()
})

// Methods
pliVliSchema.methods.addCriterion = function (criterionData) {
  // Validate total weight doesn't exceed 100
  const currentTotalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0)
  if (currentTotalWeight + criterionData.weight > 100) {
    throw new Error("Total criteria weight cannot exceed 100%")
  }
  
  this.criteria.push(criterionData)
  return this.save()
}

pliVliSchema.methods.updateAchievement = function (criterionId, achievedValue, evidence) {
  const criterion = this.criteria.id(criterionId)
  if (criterion) {
    criterion.achieved = achievedValue
    if (evidence) {
      criterion.evidence.push(evidence)
    }
    
    this.auditTrail.push({
      action: "achievement updated",
      performedBy: evidence?.verifiedBy || "system",
      newValue: { criterionId, achievedValue }
    })
  }
  return this.save()
}

pliVliSchema.methods.addApproval = function (approvalType, approverId, approved, comments, score) {
  const approval = this.approvalWorkflow[approvalType]
  if (approval) {
    approval.approved = approved
    approval.approvedBy = approverId
    approval.approvedAt = new Date()
    if (comments) approval.comments = comments
    if (score) approval.score = score
    
    this.auditTrail.push({
      action: `${approvalType} ${approved ? 'approved' : 'rejected'}`,
      performedBy: approverId,
      comments: comments
    })
  }
  return this.save()
}

pliVliSchema.methods.processPayment = function (processedBy, paymentReference, taxRate = 0) {
  if (!this.allApprovalsReceived) {
    throw new Error("Cannot process payment without all approvals")
  }
  
  const taxAmount = this.incentiveAmount.finalAmount * (taxRate / 100)
  
  this.paymentDetails.processedBy = processedBy
  this.paymentDetails.processedAt = new Date()
  this.paymentDetails.paymentReference = paymentReference
  this.paymentDetails.taxDeducted = taxAmount
  this.paymentDetails.netAmount = this.incentiveAmount.finalAmount - taxAmount
  
  this.approvalStatus = "paid"
  
  this.auditTrail.push({
    action: "payment processed",
    performedBy: processedBy,
    newValue: {
      grossAmount: this.incentiveAmount.finalAmount,
      taxDeducted: taxAmount,
      netAmount: this.paymentDetails.netAmount,
      reference: paymentReference
    }
  })
  
  return this.save()
}

pliVliSchema.methods.generateIncentiveReport = function () {
  return {
    employee: this.employeeId,
    incentiveType: this.incentiveType,
    period: `${this.evaluationPeriod.quarter} ${this.evaluationPeriod.year}`,
    overallScore: this.overallAchievementScore,
    eligible: this.isEligible,
    calculatedAmount: this.incentiveAmount.calculated,
    finalAmount: this.incentiveAmount.finalAmount,
    netAmount: this.paymentDetails.netAmount,
    criteria: this.criteria.map(c => ({
      parameter: c.parameter,
      target: c.target,
      achieved: c.achieved,
      score: c.score,
      weight: c.weight
    })),
    approvalStatus: this.approvalStatus,
    paymentDate: this.paymentDetails.processedAt
  }
}

pliVliSchema.methods.calculateTeamIncentive = function (teamMembers, distributionMethod = "equal") {
  const totalAmount = this.incentiveAmount.finalAmount
  let distribution = {}
  
  if (distributionMethod === "equal") {
    const amountPerMember = totalAmount / teamMembers.length
    teamMembers.forEach(member => {
      distribution[member] = amountPerMember
    })
  } else if (distributionMethod === "performance") {
    // Distribution based on individual performance scores
    // Implementation would depend on having access to performance data
  }
  
  return distribution
}

module.exports = mongoose.model("PLI_VLI", pliVliSchema)
