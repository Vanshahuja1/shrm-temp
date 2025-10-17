const mongoose = require("mongoose")

const kpiSchema = new mongoose.Schema(
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
    kpis: [
      {
        indicator: {
          type: String,
          required: [true, "KPI indicator name is required"],
          trim: true,
          maxlength: 200,
        },
        description: {
          type: String,
          required: [true, "KPI description is required"],
          trim: true,
          maxlength: 500,
        },
        measurementType: {
          type: String,
          required: [true, "Measurement type is required"],
          enum: ["percentage", "count", "hours", "rating", "currency", "ratio"],
        },
        target: {
          type: Number,
          required: [true, "Target value is required"],
        },
        actual: {
          type: Number,
          default: 0,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        weight: {
          type: Number,
          required: [true, "Weight is required"],
          min: 1,
          max: 100,
        },
        dataSource: {
          type: String,
          required: [true, "Data source is required"],
          enum: ["attendance", "task-system", "project-system", "manual", "hr-system"],
        },
        autoCalculated: {
          type: Boolean,
          default: false,
        },
        calculationFormula: {
          type: String,
          trim: true,
        },
        managerOverride: {
          value: {
            type: Number,
          },
          reason: {
            type: String,
            maxlength: 500,
          },
          overriddenBy: {
            type: String,
            ref: "User",
          },
          overriddenAt: {
            type: Date,
          },
        },
        frequency: {
          type: String,
          enum: ["daily", "weekly", "monthly", "quarterly"],
          default: "quarterly",
        },
        category: {
          type: String,
          enum: ["quality", "productivity", "behavior", "attendance", "collaboration"],
          required: true,
        },
        benchmark: {
          type: Number,
          default: 0,
        },
        unit: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    overallKpiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
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
      enum: ["draft", "active", "calculated", "approved", "finalized"],
      default: "draft",
    },
    autoUpdateEnabled: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound index for unique KPI sets per employee per period
kpiSchema.index(
  { employeeId: 1, "evaluationPeriod.quarter": 1, "evaluationPeriod.year": 1 },
  { unique: true }
)

// Index for efficient querying
kpiSchema.index({ status: 1, autoUpdateEnabled: 1 })
kpiSchema.index({ "kpis.dataSource": 1, "kpis.autoCalculated": 1 })

// Virtual for KPI achievement rate
kpiSchema.virtual("achievementRate").get(function () {
  if (!this.kpis || this.kpis.length === 0) return 0
  
  const totalKpis = this.kpis.length
  const achievedKpis = this.kpis.filter(kpi => kpi.actual >= kpi.target).length
  
  return Math.round((achievedKpis / totalKpis) * 100)
})

// Virtual for weighted score calculation
kpiSchema.virtual("weightedScore").get(function () {
  if (!this.kpis || this.kpis.length === 0) return 0
  
  const totalWeight = this.kpis.reduce((sum, kpi) => sum + kpi.weight, 0)
  if (totalWeight === 0) return 0
  
  const weightedSum = this.kpis.reduce(
    (sum, kpi) => sum + (kpi.score * kpi.weight), 0
  )
  
  return Math.round(weightedSum / totalWeight)
})

// Pre-save hook to calculate overall KPI score and validate weights
kpiSchema.pre("save", function (next) {
  if (this.kpis && this.kpis.length > 0) {
    // Validate that total weight doesn't exceed 100
    const totalWeight = this.kpis.reduce((sum, kpi) => sum + kpi.weight, 0)
    if (totalWeight > 100) {
      return next(new Error("Total KPI weights cannot exceed 100%"))
    }
    
    // Calculate scores for each KPI
    this.kpis.forEach(kpi => {
      if (!kpi.managerOverride.value) {
        // Auto-calculate score based on target vs actual
        const achievementRatio = kpi.actual / kpi.target
        
        if (kpi.measurementType === "percentage") {
          kpi.score = Math.min(100, achievementRatio * 100)
        } else {
          // For other types, use achievement ratio capped at 100
          kpi.score = Math.min(100, achievementRatio * 100)
        }
      } else {
        // Use manager override value
        kpi.score = kpi.managerOverride.value
      }
    })
    
    // Calculate overall weighted score
    this.overallKpiScore = this.weightedScore || 0
    this.calculatedAt = new Date()
    this.lastUpdated = new Date()
  }
  next()
})

// Methods
kpiSchema.methods.updateKPI = function (kpiId, actualValue, manualOverride = false) {
  const kpi = this.kpis.id(kpiId)
  if (kpi) {
    kpi.actual = actualValue
    kpi.autoCalculated = !manualOverride
    this.lastUpdated = new Date()
  }
  return this.save()
}

kpiSchema.methods.setManagerOverride = function (kpiId, overrideValue, reason, managerId) {
  const kpi = this.kpis.id(kpiId)
  if (kpi) {
    kpi.managerOverride = {
      value: overrideValue,
      reason: reason,
      overriddenBy: managerId,
      overriddenAt: new Date()
    }
  }
  return this.save()
}

kpiSchema.methods.calculateCategoryScores = function () {
  const categories = ["quality", "productivity", "behavior", "attendance", "collaboration"]
  const categoryScores = {}
  
  categories.forEach(category => {
    const categoryKpis = this.kpis.filter(kpi => kpi.category === category)
    if (categoryKpis.length > 0) {
      const totalWeight = categoryKpis.reduce((sum, kpi) => sum + kpi.weight, 0)
      const weightedSum = categoryKpis.reduce((sum, kpi) => sum + (kpi.score * kpi.weight), 0)
      categoryScores[category] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
    } else {
      categoryScores[category] = 0
    }
  })
  
  return categoryScores
}

kpiSchema.methods.generatePerformanceInsights = function () {
  const insights = []
  
  this.kpis.forEach(kpi => {
    const achievementRate = (kpi.actual / kpi.target) * 100
    
    if (achievementRate >= 110) {
      insights.push(`Exceptional performance in ${kpi.indicator} (${achievementRate.toFixed(1)}% of target)`)
    } else if (achievementRate < 80) {
      insights.push(`Needs improvement in ${kpi.indicator} (${achievementRate.toFixed(1)}% of target)`)
    }
  })
  
  return insights
}

module.exports = mongoose.model("KPI", kpiSchema)
