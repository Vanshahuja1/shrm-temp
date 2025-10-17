const KPI = require("../models/kpiModel")
const User = require("../models/userModel")

// Get all KPIs
const getAllKPIs = async (req, res) => {
  try {
    const { year, quarter, employeeId, category, status } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (category) filter.category = category
    if (status) filter.status = status
    
    const kpis = await KPI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("setBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    res.json({
      success: true,
      count: kpis.length,
      data: kpis
    })
  } catch (error) {
    console.error("Get all KPIs error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KPIs",
      details: error.message
    })
  }
}

// Get KPI by employee ID
const getKPIByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    const kpis = await KPI.find(filter)
      .populate("employeeId", "name email department role")
      .populate("setBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    if (!kpis || kpis.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No KPIs found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: kpis.length,
      data: kpis
    })
  } catch (error) {
    console.error("Get KPI by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KPI",
      details: error.message
    })
  }
}

// Get KPI by ID
const getKPIById = async (req, res) => {
  try {
    const { id } = req.params
    
    const kpi = await KPI.findById(id)
      .populate("employeeId", "name email department role")
      .populate("setBy", "name email")
      .populate("approvedBy", "name email")
    
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI not found"
      })
    }
    
    res.json({
      success: true,
      data: kpi
    })
  } catch (error) {
    console.error("Get KPI by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KPI",
      details: error.message
    })
  }
}

// Create KPI
const createKPI = async (req, res) => {
  try {
    const kpiData = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: kpiData.employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Validate manager exists
    const manager = await User.findOne({ id: kpiData.setBy })
    if (!manager) {
      return res.status(404).json({
        success: false,
        error: "Manager not found"
      })
    }
    
    const kpi = new KPI(kpiData)
    await kpi.save()
    
    await kpi.populate("employeeId", "name email department role")
    await kpi.populate("setBy", "name email")
    
    res.status(201).json({
      success: true,
      message: "KPI created successfully",
      data: kpi
    })
  } catch (error) {
    console.error("Create KPI error:", error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "KPI already exists for this employee in this period"
      })
    }
    
    res.status(400).json({
      success: false,
      error: "Failed to create KPI",
      details: error.message
    })
  }
}

// Update KPI
const updateKPI = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const kpi = await KPI.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department role")
     .populate("setBy", "name email")
     .populate("approvedBy", "name email")
    
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI not found"
      })
    }
    
    res.json({
      success: true,
      message: "KPI updated successfully",
      data: kpi
    })
  } catch (error) {
    console.error("Update KPI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update KPI",
      details: error.message
    })
  }
}

// Update KPI value and auto-calculate score
const updateKPIValue = async (req, res) => {
  try {
    const { id, kpiId } = req.params
    const { actualValue, managerOverride, overrideScore, overrideComments } = req.body
    
    const kpi = await KPI.findById(id)
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI set not found"
      })
    }
    
    await kpi.updateKPIValue(kpiId, actualValue, managerOverride, overrideScore, overrideComments)
    await kpi.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "KPI value updated successfully",
      data: kpi
    })
  } catch (error) {
    console.error("Update KPI value error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update KPI value",
      details: error.message
    })
  }
}

// Add individual KPI to existing KPI set
const addIndividualKPI = async (req, res) => {
  try {
    const { id } = req.params
    const kpiData = req.body
    
    const kpi = await KPI.findById(id)
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI set not found"
      })
    }
    
    await kpi.addKPI(kpiData)
    await kpi.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "Individual KPI added successfully",
      data: kpi
    })
  } catch (error) {
    console.error("Add individual KPI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to add individual KPI",
      details: error.message
    })
  }
}

// Bulk update KPI values from external data source
const bulkUpdateKPIs = async (req, res) => {
  try {
    const { employeeId, dataSourceType, dataPoints } = req.body
    
    const kpis = await KPI.find({ 
      employeeId,
      status: "active"
    })
    
    if (!kpis || kpis.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No active KPIs found for this employee"
      })
    }
    
    const updatedKPIs = []
    
    for (const kpi of kpis) {
      // Filter KPIs that match the data source type
      const matchingKPIs = kpi.kpis.filter(k => k.dataSource === dataSourceType)
      
      for (const individualKPI of matchingKPIs) {
        // Find matching data point
        const dataPoint = dataPoints.find(dp => dp.kpiId === individualKPI._id.toString())
        if (dataPoint) {
          await kpi.updateKPIValue(individualKPI._id, dataPoint.actualValue)
          updatedKPIs.push({
            kpiSetId: kpi._id,
            kpiId: individualKPI._id,
            title: individualKPI.title,
            actualValue: dataPoint.actualValue,
            score: individualKPI.score
          })
        }
      }
      
      await kpi.save()
    }
    
    res.json({
      success: true,
      message: `Bulk updated ${updatedKPIs.length} KPIs from ${dataSourceType}`,
      data: updatedKPIs
    })
  } catch (error) {
    console.error("Bulk update KPIs error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to bulk update KPIs",
      details: error.message
    })
  }
}

// Get KPI performance summary
const getKPIPerformance = async (req, res) => {
  try {
    const { id } = req.params
    
    const kpi = await KPI.findById(id)
      .populate("employeeId", "name email department role")
    
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI not found"
      })
    }
    
    const categoryScores = kpi.categoryScores
    
    res.json({
      success: true,
      data: {
        employeeId: kpi.employeeId,
        quarter: kpi.evaluationPeriod.quarter,
        year: kpi.evaluationPeriod.year,
        overallScore: kpi.overallKpiScore,
        weightedScore: kpi.weightedKpiScore,
        categoryScores,
        kpiDetails: kpi.kpis.map(k => ({
          title: k.title,
          category: k.category,
          weight: k.weight,
          targetValue: k.targetValue,
          actualValue: k.actualValue,
          score: k.score,
          dataSource: k.dataSource,
          isAutoCalculated: k.isAutoCalculated,
          managerOverride: k.managerOverride
        }))
      }
    })
  } catch (error) {
    console.error("Get KPI performance error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KPI performance",
      details: error.message
    })
  }
}

// Approve KPI
const approveKPI = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, comments } = req.body
    
    const kpi = await KPI.findById(id)
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI not found"
      })
    }
    
    kpi.approvedBy = approvedBy
    kpi.approvedAt = new Date()
    kpi.status = "approved"
    if (comments) kpi.comments = comments
    
    await kpi.save()
    await kpi.populate("approvedBy", "name email")
    
    res.json({
      success: true,
      message: "KPI approved successfully",
      data: kpi
    })
  } catch (error) {
    console.error("Approve KPI error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve KPI",
      details: error.message
    })
  }
}

// Get KPI analytics
const getKPIAnalytics = async (req, res) => {
  try {
    const { year, quarter, department, category } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    let kpis = await KPI.find(filter)
      .populate("employeeId", "name email department role")
    
    // Filter by department if specified
    if (department) {
      kpis = kpis.filter(kpi => kpi.employeeId.department === department)
    }
    
    const totalEmployees = kpis.length
    const averageScore = totalEmployees > 0 
      ? Math.round(kpis.reduce((sum, kpi) => sum + kpi.overallKpiScore, 0) / totalEmployees)
      : 0
    
    // Category-wise analytics
    const categoryStats = {}
    const categories = ["quality", "productivity", "initiative", "collaboration", "compliance"]
    
    categories.forEach(cat => {
      const categoryKPIs = kpis.filter(kpi => 
        kpi.kpis.some(k => k.category === cat)
      )
      
      if (categoryKPIs.length > 0) {
        const categoryScores = categoryKPIs.map(kpi => kpi.categoryScores[cat] || 0)
        categoryStats[cat] = {
          count: categoryKPIs.length,
          averageScore: Math.round(
            categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
          ),
          maxScore: Math.max(...categoryScores),
          minScore: Math.min(...categoryScores)
        }
      }
    })
    
    // Department-wise analytics
    const departmentStats = kpis.reduce((acc, kpi) => {
      const dept = kpi.employeeId.department
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalScore: 0, scores: [] }
      }
      acc[dept].count++
      acc[dept].totalScore += kpi.overallKpiScore
      acc[dept].scores.push(kpi.overallKpiScore)
      return acc
    }, {})
    
    // Calculate department averages and distribution
    Object.keys(departmentStats).forEach(dept => {
      const dept_data = departmentStats[dept]
      dept_data.averageScore = Math.round(dept_data.totalScore / dept_data.count)
      dept_data.maxScore = Math.max(...dept_data.scores)
      dept_data.minScore = Math.min(...dept_data.scores)
      delete dept_data.scores // Remove individual scores for cleaner response
    })
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        averageScore,
        categoryStats,
        departmentStats,
        performanceDistribution: {
          excellent: kpis.filter(kpi => kpi.overallKpiScore >= 90).length,
          good: kpis.filter(kpi => kpi.overallKpiScore >= 70 && kpi.overallKpiScore < 90).length,
          average: kpis.filter(kpi => kpi.overallKpiScore >= 50 && kpi.overallKpiScore < 70).length,
          needsImprovement: kpis.filter(kpi => kpi.overallKpiScore < 50).length
        }
      }
    })
  } catch (error) {
    console.error("Get KPI analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch KPI analytics",
      details: error.message
    })
  }
}

// Delete KPI
const deleteKPI = async (req, res) => {
  try {
    const { id } = req.params
    
    const kpi = await KPI.findByIdAndDelete(id)
    if (!kpi) {
      return res.status(404).json({
        success: false,
        error: "KPI not found"
      })
    }
    
    res.json({
      success: true,
      message: "KPI deleted successfully"
    })
  } catch (error) {
    console.error("Delete KPI error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete KPI",
      details: error.message
    })
  }
}

module.exports = {
  getAllKPIs,
  getKPIByEmployee,
  getKPIById,
  createKPI,
  updateKPI,
  updateKPIValue,
  addIndividualKPI,
  bulkUpdateKPIs,
  getKPIPerformance,
  approveKPI,
  getKPIAnalytics,
  deleteKPI
}
