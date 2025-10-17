const PLI_VLI = require("../models/pliVliModel")
const User = require("../models/userModel")
const PerformanceScore = require("../models/performanceScoreModel")

// ==================== PLI CONTROLLERS ====================

// Get all PLI records
const getAllPLI = async (req, res) => {
  try {
    const { year, quarter, employeeId, status, department } = req.query
    const filter = { incentiveType: "PLI" }
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (status) filter.status = status
    
    let pliRecords = await PLI_VLI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("approvedBy", "name email role")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    // Filter by department if specified
    if (department) {
      pliRecords = pliRecords.filter(pli => pli.employeeId.department === department)
    }
    
    res.json({
      success: true,
      count: pliRecords.length,
      data: pliRecords
    })
  } catch (error) {
    console.error("Get all PLI error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch PLI records",
      details: error.message
    })
  }
}

// Get PLI by employee ID
const getPLIByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId, incentiveType: "PLI" }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    const pliRecords = await PLI_VLI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("approvedBy", "name email role")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    if (!pliRecords || pliRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No PLI records found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: pliRecords.length,
      data: pliRecords
    })
  } catch (error) {
    console.error("Get PLI by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch PLI records",
      details: error.message
    })
  }
}

// Calculate and create PLI
const calculatePLI = async (req, res) => {
  try {
    const { 
      employeeId, 
      year, 
      quarter, 
      fiscalYear,
      startDate,
      endDate,
      criteria,
      performanceScore,
      achievements,
      comments 
    } = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Check if PLI already exists
    const existingPLI = await PLI_VLI.findOne({
      employeeId,
      incentiveType: "PLI",
      "evaluationPeriod.year": year,
      "evaluationPeriod.quarter": quarter
    })
    
    if (existingPLI) {
      return res.status(400).json({
        success: false,
        error: "PLI already calculated for this period"
      })
    }
    
    const pliData = {
      employeeId,
      incentiveType: "PLI",
      evaluationPeriod: { 
        year: parseInt(year), 
        quarter,
        fiscalYear,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      criteria: criteria || [],
      performanceScore: performanceScore || 0,
      achievements: achievements || [],
      comments
    }
    
    const pli = new PLI_VLI(pliData)
    await pli.save()
    
    await pli.populate("employeeId", "name email department role")
    
    res.status(201).json({
      success: true,
      message: "PLI calculated successfully",
      data: pli
    })
  } catch (error) {
    console.error("Calculate PLI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to calculate PLI",
      details: error.message
    })
  }
}

// Approve PLI
const approvePLI = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, comments } = req.body
    
    const pli = await PLI_VLI.findById(id)
    if (!pli || pli.incentiveType !== "PLI") {
      return res.status(404).json({
        success: false,
        error: "PLI record not found"
      })
    }
    
    if (pli.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "PLI is already approved"
      })
    }
    
    pli.approvedBy = approvedBy
    pli.approvedAt = new Date()
    pli.status = "approved"
    if (comments) pli.comments = comments
    
    await pli.save()
    await pli.populate("approvedBy", "name email role")
    
    res.json({
      success: true,
      message: "PLI approved successfully",
      data: pli
    })
  } catch (error) {
    console.error("Approve PLI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve PLI",
      details: error.message
    })
  }
}

// ==================== VLI CONTROLLERS ====================

// Get all VLI records
const getAllVLI = async (req, res) => {
  try {
    const { year, quarter, employeeId, status, department } = req.query
    const filter = { incentiveType: "VLI" }
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (status) filter.status = status
    
    let vliRecords = await PLI_VLI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("approvedBy", "name email role")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    // Filter by department if specified
    if (department) {
      vliRecords = vliRecords.filter(vli => vli.employeeId.department === department)
    }
    
    res.json({
      success: true,
      count: vliRecords.length,
      data: vliRecords
    })
  } catch (error) {
    console.error("Get all VLI error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch VLI records",
      details: error.message
    })
  }
}

// Get VLI by employee ID
const getVLIByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId, incentiveType: "VLI" }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    const vliRecords = await PLI_VLI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("approvedBy", "name email role")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    if (!vliRecords || vliRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No VLI records found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: vliRecords.length,
      data: vliRecords
    })
  } catch (error) {
    console.error("Get VLI by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch VLI records",
      details: error.message
    })
  }
}

// Calculate and create VLI
const calculateVLI = async (req, res) => {
  try {
    const { 
      employeeId, 
      year, 
      quarter, 
      fiscalYear,
      startDate,
      endDate,
      criteria,
      performanceScore,
      values,
      leadership,
      comments 
    } = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Check eligibility (score >= 70)
    if (performanceScore < 70) {
      return res.status(400).json({
        success: false,
        error: "Employee not eligible for VLI. Performance score must be >= 70."
      })
    }
    
    // Check if VLI already exists
    const existingVLI = await PLI_VLI.findOne({
      employeeId,
      incentiveType: "VLI",
      "evaluationPeriod.year": year,
      "evaluationPeriod.quarter": quarter
    })
    
    if (existingVLI) {
      return res.status(400).json({
        success: false,
        error: "VLI already calculated for this period"
      })
    }
    
    const vliData = {
      employeeId,
      incentiveType: "VLI",
      evaluationPeriod: { 
        year: parseInt(year), 
        quarter,
        fiscalYear,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      criteria: criteria || [],
      performanceScore: performanceScore || 0,
      values: values || [],
      leadership: leadership || [],
      comments
    }
    
    const vli = new PLI_VLI(vliData)
    await vli.save()
    
    await vli.populate("employeeId", "name email department role")
    
    res.status(201).json({
      success: true,
      message: "VLI calculated successfully",
      data: vli
    })
  } catch (error) {
    console.error("Calculate VLI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to calculate VLI",
      details: error.message
    })
  }
}

// Approve VLI
const approveVLI = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, comments } = req.body
    
    const vli = await PLI_VLI.findById(id)
    if (!vli || vli.incentiveType !== "VLI") {
      return res.status(404).json({
        success: false,
        error: "VLI record not found"
      })
    }
    
    if (vli.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "VLI is already approved"
      })
    }
    
    vli.approvedBy = approvedBy
    vli.approvedAt = new Date()
    vli.status = "approved"
    if (comments) vli.comments = comments
    
    await vli.save()
    await vli.populate("approvedBy", "name email role")
    
    res.json({
      success: true,
      message: "VLI approved successfully",
      data: vli
    })
  } catch (error) {
    console.error("Approve VLI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve VLI",
      details: error.message
    })
  }
}

// ==================== COMBINED ANALYTICS ====================

// Get incentive analytics (PLI + VLI combined)
const getIncentiveAnalytics = async (req, res) => {
  try {
    const { year, quarter, department } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    // Get PLI and VLI records
    let pliRecords = await PLI_VLI.find({ ...filter, incentiveType: "PLI" })
      .populate("employeeId", "name department")
    let vliRecords = await PLI_VLI.find({ ...filter, incentiveType: "VLI" })
      .populate("employeeId", "name department")
    
    // Filter by department if specified
    if (department) {
      pliRecords = pliRecords.filter(pli => pli.employeeId.department === department)
      vliRecords = vliRecords.filter(vli => vli.employeeId.department === department)
    }
    
    const analytics = {
      pli: {
        total: pliRecords.length,
        approved: pliRecords.filter(p => p.status === "approved").length,
        totalAmount: pliRecords
          .filter(p => p.status === "approved")
          .reduce((sum, p) => sum + (p.finalAmount || 0), 0)
      },
      vli: {
        total: vliRecords.length,
        approved: vliRecords.filter(v => v.status === "approved").length,
        totalAmount: vliRecords
          .filter(v => v.status === "approved")
          .reduce((sum, v) => sum + (v.finalAmount || 0), 0)
      },
      combined: {
        totalIncentives: pliRecords.length + vliRecords.length,
        totalApproved: pliRecords.filter(p => p.status === "approved").length + 
                      vliRecords.filter(v => v.status === "approved").length,
        totalAmount: pliRecords
          .filter(p => p.status === "approved")
          .reduce((sum, p) => sum + (p.finalAmount || 0), 0) +
          vliRecords
          .filter(v => v.status === "approved")
          .reduce((sum, v) => sum + (v.finalAmount || 0), 0)
      }
    }
    
    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error("Get incentive analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch incentive analytics",
      details: error.message
    })
  }
}

// Delete PLI
const deletePLI = async (req, res) => {
  try {
    const { id } = req.params
    
    const pli = await PLI_VLI.findOneAndDelete({ _id: id, incentiveType: "PLI" })
    if (!pli) {
      return res.status(404).json({
        success: false,
        error: "PLI record not found"
      })
    }
    
    res.json({
      success: true,
      message: "PLI record deleted successfully"
    })
  } catch (error) {
    console.error("Delete PLI error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete PLI record",
      details: error.message
    })
  }
}

// Delete VLI
const deleteVLI = async (req, res) => {
  try {
    const { id } = req.params
    
    const vli = await PLI_VLI.findOneAndDelete({ _id: id, incentiveType: "VLI" })
    if (!vli) {
      return res.status(404).json({
        success: false,
        error: "VLI record not found"
      })
    }
    
    res.json({
      success: true,
      message: "VLI record deleted successfully"
    })
  } catch (error) {
    console.error("Delete VLI error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete VLI record",
      details: error.message
    })
  }
}

module.exports = {
  // PLI controllers
  getAllPLI,
  getPLIByEmployee,
  calculatePLI,
  approvePLI,
  deletePLI,
  
  // VLI controllers
  getAllVLI,
  getVLIByEmployee,
  calculateVLI,
  approveVLI,
  deleteVLI,
  
  // Combined analytics
  getIncentiveAnalytics
}
