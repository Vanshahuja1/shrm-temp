const mongoose = require("mongoose")

const companyGrowthSchema = new mongoose.Schema(
  {
    period: {
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
    financialMetrics: {
      revenue: {
        current: {
          type: Number,
          required: [true, "Current revenue is required"],
          min: 0,
        },
        previous: {
          type: Number,
          required: [true, "Previous revenue is required"],
          min: 0,
        },
        growth: {
          type: Number,
          default: 0,
        },
        target: {
          type: Number,
          min: 0,
          default: 0,
        },
        currency: {
          type: String,
          default: "INR",
        },
      },
      profit: {
        current: {
          type: Number,
          min: 0,
          default: 0,
        },
        previous: {
          type: Number,
          min: 0,
          default: 0,
        },
        growth: {
          type: Number,
          default: 0,
        },
        margin: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
      },
      clientBase: {
        current: {
          type: Number,
          min: 0,
          default: 0,
        },
        previous: {
          type: Number,
          min: 0,
          default: 0,
        },
        growth: {
          type: Number,
          default: 0,
        },
        retention: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
      },
      employeeCount: {
        current: {
          type: Number,
          min: 0,
          default: 0,
        },
        previous: {
          type: Number,
          min: 0,
          default: 0,
        },
        growth: {
          type: Number,
          default: 0,
        },
      },
    },
    incrementPool: {
      totalBudget: {
        type: Number,
        required: [true, "Total increment budget is required"],
        min: 0,
      },
      percentageOfRevenue: {
        type: Number,
        min: 0,
        max: 50,
        required: [true, "Percentage of revenue for increments is required"],
      },
      distributionStrategy: {
        type: String,
        enum: ["performance-based", "equal", "hybrid", "role-based"],
        default: "performance-based",
      },
      approvedBy: {
        type: String,
        required: [true, "Approval authority is required"],
        ref: "User",
      },
      approvedAt: {
        type: Date,
        required: [true, "Approval date is required"],
      },
      utilizationPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    performanceDistribution: {
      feePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10, // % of employees in FEE category
      },
      eePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 20, // % of employees in EE category
      },
      aePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 60, // % of employees in AE category
      },
      bePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10, // % of employees in BE category
      },
    },
    benchmarks: {
      industryGrowth: {
        type: Number,
        default: 0,
      },
      competitorGrowth: {
        type: Number,
        default: 0,
      },
      marketConditions: {
        type: String,
        enum: ["excellent", "good", "stable", "challenging", "poor"],
        default: "stable",
      },
      inflationRate: {
        type: Number,
        default: 0,
      },
      gdpGrowth: {
        type: Number,
        default: 0,
      },
    },
    targets: {
      nextQuarterRevenue: {
        type: Number,
        min: 0,
        default: 0,
      },
      nextQuarterGrowth: {
        type: Number,
        default: 0,
      },
      yearEndRevenue: {
        type: Number,
        min: 0,
        default: 0,
      },
      yearEndGrowth: {
        type: Number,
        default: 0,
      },
    },
    risks: [
      {
        description: {
          type: String,
          required: true,
        },
        impact: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        probability: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        mitigation: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "published", "archived"],
      default: "draft",
    },
    createdBy: {
      type: String,
      required: [true, "Creator is required"],
      ref: "User",
    },
    approvedBy: {
      type: String,
      ref: "User",
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound index for unique periods
companyGrowthSchema.index(
  { 
    "period.quarter": 1, 
    "period.year": 1,
    "period.fiscalYear": 1
  },
  { unique: true }
)

// Index for efficient querying
companyGrowthSchema.index({ status: 1, "period.year": 1 })
companyGrowthSchema.index({ createdBy: 1, status: 1 })

// Virtual for revenue growth calculation
companyGrowthSchema.virtual("calculatedRevenueGrowth").get(function () {
  if (this.financialMetrics.revenue.previous === 0) return 0
  
  const current = this.financialMetrics.revenue.current
  const previous = this.financialMetrics.revenue.previous
  
  return Math.round(((current - previous) / previous) * 100 * 100) / 100 // Round to 2 decimals
})

// Virtual for profit growth calculation
companyGrowthSchema.virtual("calculatedProfitGrowth").get(function () {
  if (this.financialMetrics.profit.previous === 0) return 0
  
  const current = this.financialMetrics.profit.current
  const previous = this.financialMetrics.profit.previous
  
  return Math.round(((current - previous) / previous) * 100 * 100) / 100
})

// Virtual for employee growth calculation
companyGrowthSchema.virtual("calculatedEmployeeGrowth").get(function () {
  if (this.financialMetrics.employeeCount.previous === 0) return 0
  
  const current = this.financialMetrics.employeeCount.current
  const previous = this.financialMetrics.employeeCount.previous
  
  return Math.round(((current - previous) / previous) * 100 * 100) / 100
})

// Virtual for overall growth score
companyGrowthSchema.virtual("overallGrowthScore").get(function () {
  const revenueGrowth = this.calculatedRevenueGrowth || 0
  const profitGrowth = this.calculatedProfitGrowth || 0
  const clientGrowth = this.financialMetrics.clientBase.growth || 0
  
  // Weighted average: Revenue(50%) + Profit(30%) + Client(20%)
  return Math.round((revenueGrowth * 0.5 + profitGrowth * 0.3 + clientGrowth * 0.2) * 100) / 100
})

// Pre-save hook to calculate growth percentages
companyGrowthSchema.pre("save", function (next) {
  // Calculate revenue growth
  this.financialMetrics.revenue.growth = this.calculatedRevenueGrowth
  
  // Calculate profit growth
  this.financialMetrics.profit.growth = this.calculatedProfitGrowth
  
  // Calculate profit margin
  if (this.financialMetrics.revenue.current > 0) {
    this.financialMetrics.profit.margin = Math.round(
      (this.financialMetrics.profit.current / this.financialMetrics.revenue.current) * 100 * 100
    ) / 100
  }
  
  // Calculate employee growth
  this.financialMetrics.employeeCount.growth = this.calculatedEmployeeGrowth
  
  // Calculate client growth
  if (this.financialMetrics.clientBase.previous > 0) {
    const clientGrowth = ((this.financialMetrics.clientBase.current - this.financialMetrics.clientBase.previous) / this.financialMetrics.clientBase.previous) * 100
    this.financialMetrics.clientBase.growth = Math.round(clientGrowth * 100) / 100
  }
  
  next()
})

// Methods
companyGrowthSchema.methods.calculateIncrementBudget = function (totalEmployees, averageSalary) {
  const budget = this.incrementPool.totalBudget
  const budgetPerEmployee = budget / totalEmployees
  const averageIncrementPercentage = (budgetPerEmployee / averageSalary) * 100
  
  return {
    totalBudget: budget,
    budgetPerEmployee: Math.round(budgetPerEmployee),
    averageIncrementPercentage: Math.round(averageIncrementPercentage * 100) / 100,
    canAffordIncrement: budget > (totalEmployees * averageSalary * 0.05) // At least 5% increment
  }
}

companyGrowthSchema.methods.getIncrementMultiplier = function (performanceCategory) {
  const baseGrowth = this.calculatedRevenueGrowth / 100
  
  const multipliers = {
    "FEE": 1.5, // 150% of company growth
    "EE": 1.2,  // 120% of company growth
    "AE": 1.0,  // 100% of company growth
    "BE": 0.7,  // 70% of company growth
    "PE": 0.0   // No increment for poor performance
  }
  
  return baseGrowth * (multipliers[performanceCategory] || 1.0)
}

companyGrowthSchema.methods.generateGrowthReport = function () {
  return {
    period: `${this.period.quarter} ${this.period.year}`,
    fiscalYear: this.period.fiscalYear,
    financialSummary: {
      revenueGrowth: this.calculatedRevenueGrowth,
      profitGrowth: this.calculatedProfitGrowth,
      profitMargin: this.financialMetrics.profit.margin,
      clientGrowth: this.financialMetrics.clientBase.growth,
      employeeGrowth: this.calculatedEmployeeGrowth
    },
    incrementDetails: {
      totalBudget: this.incrementPool.totalBudget,
      percentageOfRevenue: this.incrementPool.percentageOfRevenue,
      strategy: this.incrementPool.distributionStrategy
    },
    benchmarks: this.benchmarks,
    overallScore: this.overallGrowthScore,
    status: this.status
  }
}

companyGrowthSchema.methods.validateBudgetAllocation = function (plannedIncrements) {
  const totalPlannedAmount = plannedIncrements.reduce((sum, increment) => sum + increment.amount, 0)
  const budgetUtilization = (totalPlannedAmount / this.incrementPool.totalBudget) * 100
  
  return {
    totalPlanned: totalPlannedAmount,
    budgetAvailable: this.incrementPool.totalBudget,
    utilizationPercentage: Math.round(budgetUtilization * 100) / 100,
    withinBudget: totalPlannedAmount <= this.incrementPool.totalBudget,
    remainingBudget: this.incrementPool.totalBudget - totalPlannedAmount
  }
}

module.exports = mongoose.model("CompanyGrowth", companyGrowthSchema)
