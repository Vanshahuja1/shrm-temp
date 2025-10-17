const SalaryIncrement = require("../models/salaryIncrementModel")
const User = require("../models/userModel")
const PerformanceScore = require("../models/performanceScoreModel")
const CompanyGrowth = require("../models/companyGrowthModel")

// Get all salary increments
const getAllSalaryIncrements = async (req, res) => {
  try {
    const { year, quarter, employeeId, status, department } = req.query
    const filter = {}
    
    if (year) filter["incrementPeriod.year"] = parseInt(year)
    if (quarter) filter["incrementPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (status) filter.status = status
    
    let increments = await SalaryIncrement.find(filter)
      .populate("employeeId", "name email department role currentSalary")
      .populate("approvedBy", "name email role")
      .populate("performanceScoreId", "scores.totalScore category")
      .populate("companyGrowthId", "overallGrowthPercent period")
      .sort({ "incrementPeriod.year": -1, "incrementPeriod.quarter": -1 })
    
    // Filter by department if specified
    if (department) {
      increments = increments.filter(inc => inc.employeeId.department === department)
    }
    
    res.json({
      success: true,
      count: increments.length,
      data: increments
    })
  } catch (error) {
    console.error("Get all salary increments error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch salary increments",
      details: error.message
    })
  }
}

// Get salary increment by employee ID
const getSalaryIncrementByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId }
    if (year) filter["incrementPeriod.year"] = parseInt(year)
    if (quarter) filter["incrementPeriod.quarter"] = quarter
    
    const increments = await SalaryIncrement.find(filter)
      .populate("employeeId", "name email department role currentSalary")
      .populate("approvedBy", "name email role")
      .populate("performanceScoreId", "scores.totalScore category")
      .populate("companyGrowthId", "overallGrowthPercent period")
      .sort({ "incrementPeriod.year": -1, "incrementPeriod.quarter": -1 })
    
    if (!increments || increments.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No salary increments found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: increments.length,
      data: increments
    })
  } catch (error) {
    console.error("Get salary increment by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch salary increment",
      details: error.message
    })
  }
}

// Get salary increment by ID
const getSalaryIncrementById = async (req, res) => {
  try {
    const { id } = req.params
    
    const increment = await SalaryIncrement.findById(id)
      .populate("employeeId", "name email department role currentSalary")
      .populate("approvedBy", "name email role")
      .populate("performanceScoreId", "scores.totalScore category")
      .populate("companyGrowthId", "overallGrowthPercent period")
    
    if (!increment) {
      return res.status(404).json({
        success: false,
        error: "Salary increment not found"
      })
    }
    
    res.json({
      success: true,
      data: increment
    })
  } catch (error) {
    console.error("Get salary increment by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch salary increment",
      details: error.message
    })
  }
}

// Calculate and create salary increment
const calculateSalaryIncrement = async (req, res) => {
  try {
    const { employeeId, year, quarter, performanceScoreId, companyGrowthId } = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Get performance score
    const performanceScore = await PerformanceScore.findById(performanceScoreId)
    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found"
      })
    }
    
    // Get company growth
    const companyGrowth = await CompanyGrowth.findById(companyGrowthId)
    if (!companyGrowth) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    // Check if increment already exists
    const existingIncrement = await SalaryIncrement.findOne({
      employeeId,
      "incrementPeriod.year": year,
      "incrementPeriod.quarter": quarter
    })
    
    if (existingIncrement) {
      return res.status(400).json({
        success: false,
        error: "Salary increment already calculated for this period"
      })
    }
    
    // Create salary increment record
    const incrementData = {
      employeeId,
      incrementPeriod: { year: parseInt(year), quarter },
      performanceScoreId,
      companyGrowthId,
      currentSalary: employee.currentSalary || 0,
      performanceScore: performanceScore.scores.totalScore,
      companyGrowthRate: companyGrowth.overallGrowthPercent
    }
    
    const salaryIncrement = new SalaryIncrement(incrementData)
    await salaryIncrement.save()
    
    await salaryIncrement.populate("employeeId", "name email department role")
    await salaryIncrement.populate("performanceScoreId", "scores.totalScore category")
    await salaryIncrement.populate("companyGrowthId", "overallGrowthPercent period")
    
    res.status(201).json({
      success: true,
      message: "Salary increment calculated successfully",
      data: salaryIncrement
    })
  } catch (error) {
    console.error("Calculate salary increment error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to calculate salary increment",
      details: error.message
    })
  }
}

// Bulk calculate increments for multiple employees
const bulkCalculateIncrements = async (req, res) => {
  try {
    const { year, quarter, companyGrowthId, employeeIds } = req.body
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Employee IDs must be a non-empty array"
      })
    }
    
    // Get company growth record
    const companyGrowth = await CompanyGrowth.findById(companyGrowthId)
    if (!companyGrowth) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    const results = []
    const errors = []
    
    for (const employeeId of employeeIds) {
      try {
        // Get latest performance score for the employee
        const performanceScore = await PerformanceScore.findOne({
          employeeId,
          "evaluationPeriod.year": year,
          "evaluationPeriod.quarter": quarter
        })
        
        if (!performanceScore) {
          errors.push({
            employeeId,
            error: "No performance score found for this period"
          })
          continue
        }
        
        // Get employee details
        const employee = await User.findOne({ id: employeeId })
        if (!employee) {
          errors.push({
            employeeId,
            error: "Employee not found"
          })
          continue
        }
        
        // Check if increment already exists
        const existingIncrement = await SalaryIncrement.findOne({
          employeeId,
          "incrementPeriod.year": year,
          "incrementPeriod.quarter": quarter
        })
        
        if (existingIncrement) {
          errors.push({
            employeeId,
            error: "Increment already calculated for this period"
          })
          continue
        }
        
        // Create increment record
        const incrementData = {
          employeeId,
          incrementPeriod: { year: parseInt(year), quarter },
          performanceScoreId: performanceScore._id,
          companyGrowthId,
          currentSalary: employee.currentSalary || 0,
          performanceScore: performanceScore.scores.totalScore,
          companyGrowthRate: companyGrowth.overallGrowthPercent
        }
        
        const salaryIncrement = new SalaryIncrement(incrementData)
        await salaryIncrement.save()
        
        results.push({
          employeeId,
          incrementId: salaryIncrement._id,
          incrementAmount: salaryIncrement.incrementAmount,
          incrementPercentage: salaryIncrement.incrementPercentage
        })
      } catch (error) {
        errors.push({
          employeeId,
          error: error.message
        })
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${employeeIds.length} employees`,
      data: {
        successful: results,
        errors,
        summary: {
          total: employeeIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    })
  } catch (error) {
    console.error("Bulk calculate increments error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to bulk calculate increments",
      details: error.message
    })
  }
}

// Update salary increment
const updateSalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const increment = await SalaryIncrement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department role")
     .populate("approvedBy", "name email role")
     .populate("performanceScoreId", "scores.totalScore category")
     .populate("companyGrowthId", "overallGrowthPercent period")
    
    if (!increment) {
      return res.status(404).json({
        success: false,
        error: "Salary increment not found"
      })
    }
    
    res.json({
      success: true,
      message: "Salary increment updated successfully",
      data: increment
    })
  } catch (error) {
    console.error("Update salary increment error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update salary increment",
      details: error.message
    })
  }
}

// Approve salary increment
const approveSalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, comments } = req.body
    
    const increment = await SalaryIncrement.findById(id)
    if (!increment) {
      return res.status(404).json({
        success: false,
        error: "Salary increment not found"
      })
    }
    
    if (increment.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "Salary increment is already approved"
      })
    }
    
    increment.approvedBy = approvedBy
    increment.approvedAt = new Date()
    increment.status = "approved"
    if (comments) increment.comments = comments
    
    await increment.save()
    await increment.populate("approvedBy", "name email role")
    
    res.json({
      success: true,
      message: "Salary increment approved successfully",
      data: increment
    })
  } catch (error) {
    console.error("Approve salary increment error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve salary increment",
      details: error.message
    })
  }
}

// Get increment analytics
const getIncrementAnalytics = async (req, res) => {
  try {
    const { year, quarter, department } = req.query
    const filter = {}
    
    if (year) filter["incrementPeriod.year"] = parseInt(year)
    if (quarter) filter["incrementPeriod.quarter"] = quarter
    
    let increments = await SalaryIncrement.find(filter)
      .populate("employeeId", "name email department role")
    
    // Filter by department if specified
    if (department) {
      increments = increments.filter(inc => inc.employeeId.department === department)
    }
    
    const totalEmployees = increments.length
    const approvedIncrements = increments.filter(inc => inc.status === "approved")
    const totalIncrementAmount = approvedIncrements.reduce((sum, inc) => sum + inc.incrementAmount, 0)
    const averageIncrementPercentage = approvedIncrements.length > 0 
      ? Math.round(approvedIncrements.reduce((sum, inc) => sum + inc.incrementPercentage, 0) / approvedIncrements.length * 100) / 100
      : 0
    
    // Department-wise analytics
    const departmentStats = increments.reduce((acc, inc) => {
      const dept = inc.employeeId.department
      if (!acc[dept]) {
        acc[dept] = { 
          count: 0, 
          approved: 0,
          totalAmount: 0,
          totalPercentage: 0,
          averagePercentage: 0
        }
      }
      acc[dept].count++
      
      if (inc.status === "approved") {
        acc[dept].approved++
        acc[dept].totalAmount += inc.incrementAmount
        acc[dept].totalPercentage += inc.incrementPercentage
      }
      
      return acc
    }, {})
    
    // Calculate department averages
    Object.keys(departmentStats).forEach(dept => {
      const deptData = departmentStats[dept]
      deptData.averagePercentage = deptData.approved > 0 
        ? Math.round(deptData.totalPercentage / deptData.approved * 100) / 100
        : 0
      deptData.approvalRate = deptData.count > 0 
        ? Math.round((deptData.approved / deptData.count) * 100)
        : 0
      delete deptData.totalPercentage // Clean up for response
    })
    
    // Performance category distribution
    const categoryDistribution = approvedIncrements.reduce((acc, inc) => {
      // We need to populate the performance score to get category
      return acc
    }, {})
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        approvedIncrements: approvedIncrements.length,
        approvalRate: totalEmployees > 0 ? Math.round((approvedIncrements.length / totalEmployees) * 100) : 0,
        totalIncrementAmount,
        averageIncrementPercentage,
        departmentStats,
        incrementDistribution: {
          excellent: approvedIncrements.filter(inc => inc.incrementPercentage >= 15).length,
          good: approvedIncrements.filter(inc => inc.incrementPercentage >= 10 && inc.incrementPercentage < 15).length,
          average: approvedIncrements.filter(inc => inc.incrementPercentage >= 5 && inc.incrementPercentage < 10).length,
          minimal: approvedIncrements.filter(inc => inc.incrementPercentage < 5).length
        }
      }
    })
  } catch (error) {
    console.error("Get increment analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch increment analytics",
      details: error.message
    })
  }
}

// Delete salary increment
const deleteSalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params
    
    const increment = await SalaryIncrement.findByIdAndDelete(id)
    if (!increment) {
      return res.status(404).json({
        success: false,
        error: "Salary increment not found"
      })
    }
    
    res.json({
      success: true,
      message: "Salary increment deleted successfully"
    })
  } catch (error) {
    console.error("Delete salary increment error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete salary increment",
      details: error.message
    })
  }
}

module.exports = {
  getAllSalaryIncrements,
  getSalaryIncrementByEmployee,
  getSalaryIncrementById,
  calculateSalaryIncrement,
  bulkCalculateIncrements,
  updateSalaryIncrement,
  approveSalaryIncrement,
  getIncrementAnalytics,
  deleteSalaryIncrement
}
