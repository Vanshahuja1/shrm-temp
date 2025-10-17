const CompanyGrowth = require("../models/companyGrowthModel")
const User = require("../models/userModel")

// Get all company growth records
const getAllCompanyGrowth = async (req, res) => {
  try {
    const { year, quarter, status } = req.query
    const filter = {}
    
    if (year) filter["period.year"] = parseInt(year)
    if (quarter) filter["period.quarter"] = quarter
    if (status) filter.status = status
    
    const growthRecords = await CompanyGrowth.find(filter)
      .populate("recordedBy", "name email role")
      .populate("approvedBy", "name email role")
      .sort({ "period.year": -1, "period.quarter": -1 })
    
    res.json({
      success: true,
      count: growthRecords.length,
      data: growthRecords
    })
  } catch (error) {
    console.error("Get all company growth error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch company growth records",
      details: error.message
    })
  }
}

// Get company growth by period
const getCompanyGrowthByPeriod = async (req, res) => {
  try {
    const { year, quarter } = req.params
    
    const growthRecord = await CompanyGrowth.findOne({
      "period.year": parseInt(year),
      "period.quarter": quarter
    })
    .populate("recordedBy", "name email role")
    .populate("approvedBy", "name email role")
    
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "No company growth record found for this period"
      })
    }
    
    res.json({
      success: true,
      data: growthRecord
    })
  } catch (error) {
    console.error("Get company growth by period error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch company growth record",
      details: error.message
    })
  }
}

// Get company growth by ID
const getCompanyGrowthById = async (req, res) => {
  try {
    const { id } = req.params
    
    const growthRecord = await CompanyGrowth.findById(id)
      .populate("recordedBy", "name email role")
      .populate("approvedBy", "name email role")
    
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    res.json({
      success: true,
      data: growthRecord
    })
  } catch (error) {
    console.error("Get company growth by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch company growth record",
      details: error.message
    })
  }
}

// Create company growth record
const createCompanyGrowth = async (req, res) => {
  try {
    const growthData = req.body
    
    // Validate recorder exists
    const recorder = await User.findOne({ id: growthData.recordedBy })
    if (!recorder) {
      return res.status(404).json({
        success: false,
        error: "Recorder not found"
      })
    }
    
    const growthRecord = new CompanyGrowth(growthData)
    await growthRecord.save()
    
    await growthRecord.populate("recordedBy", "name email role")
    
    res.status(201).json({
      success: true,
      message: "Company growth record created successfully",
      data: growthRecord
    })
  } catch (error) {
    console.error("Create company growth error:", error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Company growth record already exists for this period"
      })
    }
    
    res.status(400).json({
      success: false,
      error: "Failed to create company growth record",
      details: error.message
    })
  }
}

// Update company growth record
const updateCompanyGrowth = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const growthRecord = await CompanyGrowth.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("recordedBy", "name email role")
     .populate("approvedBy", "name email role")
    
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    res.json({
      success: true,
      message: "Company growth record updated successfully",
      data: growthRecord
    })
  } catch (error) {
    console.error("Update company growth error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update company growth record",
      details: error.message
    })
  }
}

// Calculate growth metrics
const calculateGrowthMetrics = async (req, res) => {
  try {
    const { id } = req.params
    
    const growthRecord = await CompanyGrowth.findById(id)
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    await growthRecord.calculateGrowthMetrics()
    
    res.json({
      success: true,
      message: "Growth metrics calculated successfully",
      data: growthRecord
    })
  } catch (error) {
    console.error("Calculate growth metrics error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to calculate growth metrics",
      details: error.message
    })
  }
}

// Get growth trend analysis
const getGrowthTrend = async (req, res) => {
  try {
    const { startYear, startQuarter, endYear, endQuarter } = req.query
    
    const filter = {}
    
    // Build date range filter
    if (startYear && startQuarter) {
      filter.$and = filter.$and || []
      filter.$and.push({
        $or: [
          { "period.year": { $gt: parseInt(startYear) } },
          {
            $and: [
              { "period.year": parseInt(startYear) },
              { "period.quarter": { $gte: startQuarter } }
            ]
          }
        ]
      })
    }
    
    if (endYear && endQuarter) {
      filter.$and = filter.$and || []
      filter.$and.push({
        $or: [
          { "period.year": { $lt: parseInt(endYear) } },
          {
            $and: [
              { "period.year": parseInt(endYear) },
              { "period.quarter": { $lte: endQuarter } }
            ]
          }
        ]
      })
    }
    
    const growthRecords = await CompanyGrowth.find(filter)
      .sort({ "period.year": 1, "period.quarter": 1 })
    
    if (!growthRecords || growthRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No growth records found for the specified period"
      })
    }
    
    const trendData = growthRecords.map(record => ({
      period: record.period,
      revenueGrowth: record.revenueGrowthPercent,
      profitGrowth: record.profitGrowthPercent,
      overallGrowth: record.overallGrowthPercent,
      growthScore: record.growthScore,
      metrics: {
        revenue: {
          current: record.metrics.revenue.currentQuarter,
          previous: record.metrics.revenue.previousQuarter
        },
        profit: {
          current: record.metrics.profit.currentQuarter,
          previous: record.metrics.profit.previousQuarter
        }
      }
    }))
    
    // Calculate trend statistics
    const revenueGrowths = trendData.map(d => d.revenueGrowth).filter(g => g !== null)
    const profitGrowths = trendData.map(d => d.profitGrowth).filter(g => g !== null)
    const overallGrowths = trendData.map(d => d.overallGrowth).filter(g => g !== null)
    
    const statistics = {
      averageRevenueGrowth: revenueGrowths.length > 0 
        ? Math.round(revenueGrowths.reduce((sum, g) => sum + g, 0) / revenueGrowths.length * 100) / 100
        : 0,
      averageProfitGrowth: profitGrowths.length > 0 
        ? Math.round(profitGrowths.reduce((sum, g) => sum + g, 0) / profitGrowths.length * 100) / 100
        : 0,
      averageOverallGrowth: overallGrowths.length > 0 
        ? Math.round(overallGrowths.reduce((sum, g) => sum + g, 0) / overallGrowths.length * 100) / 100
        : 0,
      bestQuarter: trendData.reduce((best, current) => 
        current.overallGrowth > (best?.overallGrowth || 0) ? current : best, null
      ),
      totalPeriods: trendData.length
    }
    
    res.json({
      success: true,
      data: {
        trendData,
        statistics
      }
    })
  } catch (error) {
    console.error("Get growth trend error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch growth trend",
      details: error.message
    })
  }
}

// Get current growth rate for increment calculations
const getCurrentGrowthRate = async (req, res) => {
  try {
    const { year, quarter } = req.query
    
    // If no period specified, get the latest approved record
    let filter = { status: "approved" }
    if (year && quarter) {
      filter["period.year"] = parseInt(year)
      filter["period.quarter"] = quarter
    }
    
    const growthRecord = await CompanyGrowth.findOne(filter)
      .sort({ "period.year": -1, "period.quarter": -1 })
    
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "No approved growth record found",
        data: {
          growthRate: 0,
          defaultUsed: true,
          message: "Using default growth rate of 0% for increment calculations"
        }
      })
    }
    
    res.json({
      success: true,
      data: {
        period: growthRecord.period,
        growthRate: growthRecord.overallGrowthPercent,
        growthScore: growthRecord.growthScore,
        revenueGrowth: growthRecord.revenueGrowthPercent,
        profitGrowth: growthRecord.profitGrowthPercent,
        approvedAt: growthRecord.approvedAt,
        defaultUsed: false
      }
    })
  } catch (error) {
    console.error("Get current growth rate error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch current growth rate",
      details: error.message
    })
  }
}

// Approve company growth record
const approveCompanyGrowth = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, approvalComments } = req.body
    
    const growthRecord = await CompanyGrowth.findById(id)
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    if (growthRecord.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "Company growth record is already approved"
      })
    }
    
    growthRecord.approvedBy = approvedBy
    growthRecord.approvedAt = new Date()
    growthRecord.status = "approved"
    if (approvalComments) growthRecord.approvalComments = approvalComments
    
    await growthRecord.save()
    await growthRecord.populate("approvedBy", "name email role")
    
    res.json({
      success: true,
      message: "Company growth record approved successfully",
      data: growthRecord
    })
  } catch (error) {
    console.error("Approve company growth error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve company growth record",
      details: error.message
    })
  }
}

// Get growth analytics
const getGrowthAnalytics = async (req, res) => {
  try {
    const { startYear, endYear } = req.query
    const currentYear = new Date().getFullYear()
    
    const filter = {
      "period.year": {
        $gte: startYear ? parseInt(startYear) : currentYear - 2,
        $lte: endYear ? parseInt(endYear) : currentYear
      },
      status: "approved"
    }
    
    const growthRecords = await CompanyGrowth.find(filter)
      .sort({ "period.year": 1, "period.quarter": 1 })
    
    if (!growthRecords || growthRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No approved growth records found for analysis"
      })
    }
    
    // Overall statistics
    const revenueGrowths = growthRecords.map(r => r.revenueGrowthPercent).filter(g => g !== null)
    const profitGrowths = growthRecords.map(r => r.profitGrowthPercent).filter(g => g !== null)
    const overallGrowths = growthRecords.map(r => r.overallGrowthPercent).filter(g => g !== null)
    
    const analytics = {
      totalRecords: growthRecords.length,
      averageRevenueGrowth: revenueGrowths.length > 0 
        ? Math.round(revenueGrowths.reduce((sum, g) => sum + g, 0) / revenueGrowths.length * 100) / 100
        : 0,
      averageProfitGrowth: profitGrowths.length > 0 
        ? Math.round(profitGrowths.reduce((sum, g) => sum + g, 0) / profitGrowths.length * 100) / 100
        : 0,
      averageOverallGrowth: overallGrowths.length > 0 
        ? Math.round(overallGrowths.reduce((sum, g) => sum + g, 0) / overallGrowths.length * 100) / 100
        : 0,
      
      // Growth distribution
      growthDistribution: {
        positive: growthRecords.filter(r => r.overallGrowthPercent > 0).length,
        negative: growthRecords.filter(r => r.overallGrowthPercent < 0).length,
        neutral: growthRecords.filter(r => r.overallGrowthPercent === 0).length
      },
      
      // Best and worst performing quarters
      bestQuarter: growthRecords.reduce((best, current) => 
        current.overallGrowthPercent > (best?.overallGrowthPercent || -Infinity) ? current : best, null
      ),
      worstQuarter: growthRecords.reduce((worst, current) => 
        current.overallGrowthPercent < (worst?.overallGrowthPercent || Infinity) ? current : worst, null
      ),
      
      // Year-over-year analysis
      yearlyAnalysis: growthRecords.reduce((acc, record) => {
        const year = record.period.year
        if (!acc[year]) {
          acc[year] = {
            quarters: 0,
            totalRevenueGrowth: 0,
            totalProfitGrowth: 0,
            totalOverallGrowth: 0,
            records: []
          }
        }
        acc[year].quarters++
        acc[year].totalRevenueGrowth += record.revenueGrowthPercent || 0
        acc[year].totalProfitGrowth += record.profitGrowthPercent || 0
        acc[year].totalOverallGrowth += record.overallGrowthPercent || 0
        acc[year].records.push({
          quarter: record.period.quarter,
          overallGrowth: record.overallGrowthPercent
        })
        return acc
      }, {}),
      
      // Recent trends (last 4 quarters)
      recentTrend: growthRecords.slice(-4).map(record => ({
        period: record.period,
        overallGrowth: record.overallGrowthPercent,
        growthScore: record.growthScore
      }))
    }
    
    // Calculate yearly averages
    Object.keys(analytics.yearlyAnalysis).forEach(year => {
      const yearData = analytics.yearlyAnalysis[year]
      yearData.averageRevenueGrowth = Math.round(yearData.totalRevenueGrowth / yearData.quarters * 100) / 100
      yearData.averageProfitGrowth = Math.round(yearData.totalProfitGrowth / yearData.quarters * 100) / 100
      yearData.averageOverallGrowth = Math.round(yearData.totalOverallGrowth / yearData.quarters * 100) / 100
      
      // Clean up totals
      delete yearData.totalRevenueGrowth
      delete yearData.totalProfitGrowth
      delete yearData.totalOverallGrowth
    })
    
    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error("Get growth analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch growth analytics",
      details: error.message
    })
  }
}

// Delete company growth record
const deleteCompanyGrowth = async (req, res) => {
  try {
    const { id } = req.params
    
    const growthRecord = await CompanyGrowth.findByIdAndDelete(id)
    if (!growthRecord) {
      return res.status(404).json({
        success: false,
        error: "Company growth record not found"
      })
    }
    
    res.json({
      success: true,
      message: "Company growth record deleted successfully"
    })
  } catch (error) {
    console.error("Delete company growth error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete company growth record",
      details: error.message
    })
  }
}

module.exports = {
  getAllCompanyGrowth,
  getCompanyGrowthByPeriod,
  getCompanyGrowthById,
  createCompanyGrowth,
  updateCompanyGrowth,
  calculateGrowthMetrics,
  getGrowthTrend,
  getCurrentGrowthRate,
  approveCompanyGrowth,
  getGrowthAnalytics,
  deleteCompanyGrowth
}
