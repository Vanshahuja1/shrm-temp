const express = require("express")
const router = express.Router()
const PerformanceScore = require("../models/performanceScoreModel")
const KRA = require("../models/kraModel")
const KPI = require("../models/kpiModel")
const TaskPerformance = require("../models/taskPerformanceModel")
const PerformanceReview = require("../models/performanceReviewModel")
const CompanyGrowth = require("../models/companyGrowthModel")
const SalaryIncrement = require("../models/salaryIncrementModel")
const PLI_VLI = require("../models/pliVliModel")
const User = require("../models/userModel")

// Get comprehensive performance management dashboard data
const getPerformanceDashboard = async (req, res) => {
  try {
    const { year, quarter, department } = req.query
    const currentYear = year ? parseInt(year) : new Date().getFullYear()
    const currentQuarter = quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
    
    const filter = {
      $or: [
        { "evaluationPeriod.year": currentYear, "evaluationPeriod.quarter": currentQuarter },
        { "reviewPeriod.year": currentYear, "reviewPeriod.quarter": currentQuarter },
        { "incrementPeriod.year": currentYear, "incrementPeriod.quarter": currentQuarter },
        { "period.year": currentYear, "period.quarter": currentQuarter }
      ]
    }
    
    // Get all performance data
    const [
      performanceScores,
      kraRecords,
      kpiRecords,
      taskPerformances,
      performanceReviews,
      companyGrowth,
      salaryIncrements,
      pliRecords,
      vliRecords,
      totalEmployees
    ] = await Promise.all([
      PerformanceScore.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      KRA.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      KPI.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      TaskPerformance.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      PerformanceReview.find({
        "reviewPeriod.year": currentYear,
        "reviewPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      CompanyGrowth.findOne({
        "period.year": currentYear,
        "period.quarter": currentQuarter,
        status: "approved"
      }),
      
      SalaryIncrement.find({
        "incrementPeriod.year": currentYear,
        "incrementPeriod.quarter": currentQuarter
      }).populate("employeeId", "name department"),
      
      PLI_VLI.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter,
        incentiveType: "PLI"
      }).populate("employeeId", "name department"),
      
      PLI_VLI.find({
        "evaluationPeriod.year": currentYear,
        "evaluationPeriod.quarter": currentQuarter,
        incentiveType: "VLI"
      }).populate("employeeId", "name department"),
      
      User.countDocuments({ role: { $ne: "admin" } })
    ])
    
    // Filter by department if specified
    const filterByDept = (records) => department 
      ? records.filter(record => record.employeeId?.department === department)
      : records
    
    const filteredPerformanceScores = filterByDept(performanceScores)
    const filteredKRAs = filterByDept(kraRecords)
    const filteredKPIs = filterByDept(kpiRecords)
    const filteredTaskPerformances = filterByDept(taskPerformances)
    const filteredReviews = filterByDept(performanceReviews)
    const filteredIncrements = filterByDept(salaryIncrements)
    const filteredPLI = filterByDept(pliRecords)
    const filteredVLI = filterByDept(vliRecords)
    
    // Calculate key metrics
    const dashboardData = {
      period: {
        year: currentYear,
        quarter: currentQuarter
      },
      
      overview: {
        totalEmployees,
        employeesEvaluated: filteredPerformanceScores.length,
        evaluationProgress: totalEmployees > 0 
          ? Math.round((filteredPerformanceScores.length / totalEmployees) * 100)
          : 0,
        companyGrowthRate: companyGrowth?.overallGrowthPercent || 0
      },
      
      performanceScores: {
        total: filteredPerformanceScores.length,
        averageScore: filteredPerformanceScores.length > 0
          ? Math.round(filteredPerformanceScores.reduce((sum, p) => sum + p.scores.totalScore, 0) / filteredPerformanceScores.length)
          : 0,
        categoryDistribution: filteredPerformanceScores.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1
          return acc
        }, {}),
        topPerformers: filteredPerformanceScores
          .sort((a, b) => b.scores.totalScore - a.scores.totalScore)
          .slice(0, 5)
          .map(p => ({
            employeeId: p.employeeId.id,
            name: p.employeeId.name,
            score: p.scores.totalScore,
            category: p.category
          }))
      },
      
      kra: {
        total: filteredKRAs.length,
        completed: filteredKRAs.filter(k => k.status === "completed").length,
        averageScore: filteredKRAs.length > 0
          ? Math.round(filteredKRAs.reduce((sum, k) => sum + k.overallKraScore, 0) / filteredKRAs.length)
          : 0,
        completionRate: filteredKRAs.length > 0
          ? Math.round((filteredKRAs.filter(k => k.status === "completed").length / filteredKRAs.length) * 100)
          : 0
      },
      
      kpi: {
        total: filteredKPIs.length,
        averageScore: filteredKPIs.length > 0
          ? Math.round(filteredKPIs.reduce((sum, k) => sum + k.overallKpiScore, 0) / filteredKPIs.length)
          : 0,
        categoryPerformance: {
          quality: filteredKPIs.length > 0
            ? Math.round(filteredKPIs.reduce((sum, k) => sum + (k.categoryScores?.quality || 0), 0) / filteredKPIs.length)
            : 0,
          productivity: filteredKPIs.length > 0
            ? Math.round(filteredKPIs.reduce((sum, k) => sum + (k.categoryScores?.productivity || 0), 0) / filteredKPIs.length)
            : 0,
          collaboration: filteredKPIs.length > 0
            ? Math.round(filteredKPIs.reduce((sum, k) => sum + (k.categoryScores?.collaboration || 0), 0) / filteredKPIs.length)
            : 0
        }
      },
      
      taskPerformance: {
        total: filteredTaskPerformances.length,
        averageScore: filteredTaskPerformances.length > 0
          ? Math.round(filteredTaskPerformances.reduce((sum, t) => sum + t.overallTaskScore, 0) / filteredTaskPerformances.length)
          : 0,
        totalTasksCompleted: filteredTaskPerformances.reduce((sum, t) => sum + t.completedTasks, 0),
        averageDeliveryScore: filteredTaskPerformances.length > 0
          ? Math.round(filteredTaskPerformances.reduce((sum, t) => sum + t.averageDeliveryScore, 0) / filteredTaskPerformances.length)
          : 0
      },
      
      reviews: {
        total: filteredReviews.length,
        completed: filteredReviews.filter(r => r.status === "approved").length,
        pending: filteredReviews.filter(r => r.status === "pending").length,
        averageRating: filteredReviews.filter(r => r.status === "approved").length > 0
          ? Math.round(filteredReviews
              .filter(r => r.status === "approved")
              .reduce((sum, r) => sum + r.overallRating, 0) / filteredReviews.filter(r => r.status === "approved").length)
          : 0
      },
      
      increments: {
        total: filteredIncrements.length,
        approved: filteredIncrements.filter(i => i.status === "approved").length,
        totalAmount: filteredIncrements
          .filter(i => i.status === "approved")
          .reduce((sum, i) => sum + i.incrementAmount, 0),
        averagePercentage: filteredIncrements.filter(i => i.status === "approved").length > 0
          ? Math.round(filteredIncrements
              .filter(i => i.status === "approved")
              .reduce((sum, i) => sum + i.incrementPercentage, 0) / filteredIncrements.filter(i => i.status === "approved").length * 100) / 100
          : 0
      },
      
      incentives: {
        pli: {
          total: filteredPLI.length,
          approved: filteredPLI.filter(p => p.status === "approved").length,
          totalAmount: filteredPLI
            .filter(p => p.status === "approved")
            .reduce((sum, p) => sum + (p.finalAmount || 0), 0)
        },
        vli: {
          total: filteredVLI.length,
          approved: filteredVLI.filter(v => v.status === "approved").length,
          totalAmount: filteredVLI
            .filter(v => v.status === "approved")
            .reduce((sum, v) => sum + (v.finalAmount || 0), 0)
        }
      },
      
      companyGrowth: companyGrowth ? {
        revenueGrowth: companyGrowth.revenueGrowthPercent,
        profitGrowth: companyGrowth.profitGrowthPercent,
        overallGrowth: companyGrowth.overallGrowthPercent,
        growthScore: companyGrowth.growthScore,
        status: companyGrowth.status
      } : null
    }
    
    res.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error("Get performance dashboard error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance dashboard data",
      details: error.message
    })
  }
}

// Get department-wise performance comparison
const getDepartmentComparison = async (req, res) => {
  try {
    const { year, quarter } = req.query
    const currentYear = year ? parseInt(year) : new Date().getFullYear()
    const currentQuarter = quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
    
    // Get all performance scores with employee department info
    const performanceScores = await PerformanceScore.find({
      "evaluationPeriod.year": currentYear,
      "evaluationPeriod.quarter": currentQuarter
    }).populate("employeeId", "name department")
    
    // Group by department
    const departmentStats = performanceScores.reduce((acc, score) => {
      const dept = score.employeeId.department
      if (!acc[dept]) {
        acc[dept] = {
          employeeCount: 0,
          totalScore: 0,
          scores: [],
          categories: {}
        }
      }
      
      acc[dept].employeeCount++
      acc[dept].totalScore += score.scores.totalScore
      acc[dept].scores.push(score.scores.totalScore)
      
      // Category distribution
      acc[dept].categories[score.category] = (acc[dept].categories[score.category] || 0) + 1
      
      return acc
    }, {})
    
    // Calculate department averages and rankings
    const departmentComparison = Object.keys(departmentStats).map(dept => {
      const stats = departmentStats[dept]
      return {
        department: dept,
        employeeCount: stats.employeeCount,
        averageScore: Math.round(stats.totalScore / stats.employeeCount),
        maxScore: Math.max(...stats.scores),
        minScore: Math.min(...stats.scores),
        categoryDistribution: stats.categories
      }
    }).sort((a, b) => b.averageScore - a.averageScore)
    
    res.json({
      success: true,
      data: {
        period: { year: currentYear, quarter: currentQuarter },
        departments: departmentComparison
      }
    })
  } catch (error) {
    console.error("Get department comparison error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch department comparison data",
      details: error.message
    })
  }
}

// Routes
router.get("/dashboard", getPerformanceDashboard)
router.get("/department-comparison", getDepartmentComparison)

module.exports = router
