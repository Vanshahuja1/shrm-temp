const KRA = require("../models/kraModel")
const User = require("../models/userModel")

// Get all KRAs
const getAllKRAs = async (req, res) => {
  try {
    const { year, quarter, status, employeeId } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    if (status) filter.status = status
    if (employeeId) filter.employeeId = employeeId
    
    const kras = await KRA.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "setBy",
        select: "name email",
        model: "User",
        localField: "setBy",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "approvedBy",
        select: "name email",
        model: "User",
        localField: "approvedBy",
        foreignField: "id",
        justOne: true
      })
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    res.json({
      success: true,
      count: kras.length,
      data: kras
    })
  } catch (error) {
    console.error("Get all KRAs error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRAs",
      details: error.message
    })
  }
}
const getKRAByManager = async (req ,res) =>{
  try {
    const { managerId } = req.params
    const { year, quarter } = req.query

    const filter = { "setBy": managerId }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter

    const kras = await KRA.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "setBy",
        select: "name email",
        model: "User",
        localField: "setBy",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "approvedBy",
        select: "name email",
        model: "User",
        localField: "approvedBy",
        foreignField: "id",
        justOne: true
      })

    res.json({
      success: true,
      count: kras.length,
      data: kras
    })
  } catch (error) {
    console.error("Get KRA by manager error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRAs",
      details: error.message
    })
  }
}

// Get KRA by employee ID
const getKRAByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    const kras = await KRA.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "setBy",
        select: "name email",
        model: "User",
        localField: "setBy",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "approvedBy",
        select: "name email",
        model: "User",
        localField: "approvedBy",
        foreignField: "id",
        justOne: true
      })
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    if (!kras || kras.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No KRAs found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: kras.length,
      data: kras
    })
  } catch (error) {
    console.error("Get KRA by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRA",
      details: error.message
    })
  }
}

// Get KRA by ID
const getKRAById = async (req, res) => {
  try {
    const { id } = req.params
    
    const kra = await KRA.findById(id)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "setBy",
        select: "name email",
        model: "User",
        localField: "setBy",
        foreignField: "id",
        justOne: true
      })
      .populate({
        path: "approvedBy",
        select: "name email",
        model: "User",
        localField: "approvedBy",
        foreignField: "id",
        justOne: true
      })
    
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA not found"
      })
    }
    
    res.json({
      success: true,
      data: kra
    })
  } catch (error) {
    console.error("Get KRA by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRA",
      details: error.message
    })
  }
}

// Create KRA
const createKRA = async (req, res) => {
  try {
    const kraData = { ...req.body };

    // Remove _id if present
    if (kraData._id) delete kraData._id;

    // Set initial status to draft (valid enum for top-level KRA status)
    kraData.status = "draft";

    // Accept employeeId as string
    if (kraData.employeeId && typeof kraData.employeeId === "object" && kraData.employeeId.id) {
      kraData.employeeId = kraData.employeeId.id;
    }

    // Validate employee exists
    const employee = await User.findOne({ id: kraData.employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Validate manager exists
    const manager = await User.findOne({ id: kraData.setBy });
    if (!manager) {
      return res.status(404).json({
        success: false,
        error: "Manager not found"
      });
    }



    const kra = new KRA(kraData);
    await kra.save();

    await kra.populate({
      path: "employeeId",
      select: "name email department role",
      model: "User",
      localField: "employeeId",
      foreignField: "id",
      justOne: true
    });
    await kra.populate({
      path: "setBy",
      select: "name email",
      model: "User",
      localField: "setBy",
      foreignField: "id",
      justOne: true
    });

    res.status(201).json({
      success: true,
      message: "KRA created successfully",
      data: kra
    });
  } catch (error) {
    console.error("Create KRA error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "KRA already exists for this employee in this period"
      });
    }

    res.status(400).json({
      success: false,
      error: "Failed to create KRA",
      details: error.message
    });
  }
}

// Update KRA
const updateKRA = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const kra = await KRA.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department role")
     .populate("setBy", "name email")
     .populate("approvedBy", "name email")
    
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA not found"
      })
    }
    
    res.json({
      success: true,
      message: "KRA updated successfully",
      data: kra
    })
  } catch (error) {
    console.error("Update KRA error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update KRA",
      details: error.message
    })
  }
}

// Add individual KRA to existing KRA set
const addIndividualKRA = async (req, res) => {
  try {
    const { id } = req.params
    const kraData = req.body
    
    const kra = await KRA.findById(id)
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA set not found"
      })
    }
    
    await kra.addKRA(kraData)
    await kra.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "Individual KRA added successfully",
      data: kra
    })
  } catch (error) {
    console.error("Add individual KRA error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to add individual KRA",
      details: error.message
    })
  }
}

// Update KRA status
const updateKRAStatus = async (req, res) => {
  try {
    const { id, kraId } = req.params
    const { status, achievement } = req.body
    
    const kra = await KRA.findById(id)
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA set not found"
      })
    }
    
    await kra.updateKRAStatus(kraId, status, achievement)
    await kra.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "KRA status updated successfully",
      data: kra
    })
  } catch (error) {
    console.error("Update KRA status error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update KRA status",
      details: error.message
    })
  }
}

// Get KRA progress
const getKRAProgress = async (req, res) => {
  try {
    const { id } = req.params
    
    const kra = await KRA.findById(id)
      .populate("employeeId", "name email department role")
    
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA not found"
      })
    }
    
    const progress = kra.calculateQuarterlyProgress()
    
    res.json({
      success: true,
      data: {
        employeeId: kra.employeeId,
        quarter: kra.evaluationPeriod.quarter,
        year: kra.evaluationPeriod.year,
        overallScore: kra.overallKraScore,
        completionPercentage: kra.completionPercentage,
        weightedAverageScore: kra.weightedAverageScore,
        progress,
        kraDetails: kra.kras.map(k => ({
          title: k.title,
          weight: k.weight,
          score: k.score,
          status: k.status,
          achievement: k.achievement
        }))
      }
    })
  } catch (error) {
    console.error("Get KRA progress error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRA progress",
      details: error.message
    })
  }
}

// Approve KRA
const approveKRA = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, comments } = req.body
    
    const kra = await KRA.findById(id)
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA not found"
      })
    }
    
    kra.approvedBy = approvedBy
    kra.approvedAt = new Date()
    kra.status = "approved"
    if (comments) kra.comments = comments
    
    await kra.save()
    await kra.populate("approvedBy", "name email")
    
    res.json({
      success: true,
      message: "KRA approved successfully",
      data: kra
    })
  } catch (error) {
    console.error("Approve KRA error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve KRA",
      details: error.message
    })
  }
}

// Get KRA analytics
const getKRAAnalytics = async (req, res) => {
  try {
    const { year, quarter, department } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    let kras = await KRA.find(filter)
      .populate("employeeId", "name email department role")
    
    // Filter by department if specified
    if (department) {
      kras = kras.filter(kra => kra.employeeId.department === department)
    }
    
    const totalEmployees = kras.length
    const completedKRAs = kras.filter(kra => kra.status === "completed").length
    const averageScore = totalEmployees > 0 
      ? Math.round(kras.reduce((sum, kra) => sum + kra.overallKraScore, 0) / totalEmployees)
      : 0
    
    const departmentStats = kras.reduce((acc, kra) => {
      const dept = kra.employeeId.department
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalScore: 0, completed: 0 }
      }
      acc[dept].count++
      acc[dept].totalScore += kra.overallKraScore
      if (kra.status === "completed") acc[dept].completed++
      return acc
    }, {})
    
    // Calculate department averages
    Object.keys(departmentStats).forEach(dept => {
      departmentStats[dept].averageScore = Math.round(
        departmentStats[dept].totalScore / departmentStats[dept].count
      )
      departmentStats[dept].completionRate = Math.round(
        (departmentStats[dept].completed / departmentStats[dept].count) * 100
      )
    })
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        completedKRAs,
        completionRate: totalEmployees > 0 ? Math.round((completedKRAs / totalEmployees) * 100) : 0,
        averageScore,
        departmentStats
      }
    })
  } catch (error) {
    console.error("Get KRA analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KRA analytics",
      details: error.message
    })
  }
}

// Delete KRA
const deleteKRA = async (req, res) => {
  try {
    const { id } = req.params
    
    const kra = await KRA.findByIdAndDelete(id)
    if (!kra) {
      return res.status(404).json({
        success: false,
        error: "KRA not found"
      })
    }
    
    res.json({
      success: true,
      message: "KRA deleted successfully"
    })
  } catch (error) {
    console.error("Delete KRA error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete KRA",
      details: error.message
    })
  }
}

module.exports = {
  getAllKRAs,
  getKRAByEmployee,
  getKRAById,
  createKRA,
  updateKRA,
  addIndividualKRA,
  updateKRAStatus,
  getKRAProgress,
  approveKRA,
  getKRAAnalytics,
  deleteKRA,
  getKRAByManager
}
