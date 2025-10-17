const PerformanceReview = require("../models/performanceReviewModel")
const User = require("../models/userModel")

// Get all performance reviews
const getAllPerformanceReviews = async (req, res) => {
  try {
    const { year, quarter, employeeId, reviewerId, status, reviewType } = req.query
    const filter = {}
    
    if (year) filter["reviewPeriod.year"] = parseInt(year)
    if (quarter) filter["reviewPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (reviewerId) filter.reviewerId = reviewerId
    if (status) filter.status = status
    if (reviewType) filter.reviewType = reviewType
    
    const reviews = await PerformanceReview.find(filter)
      .populate("employeeId", "name email department role")
      .populate("reviewerId", "name email role")
      .populate("approvedBy", "name email")
      .sort({ "reviewPeriod.year": -1, "reviewPeriod.quarter": -1 })
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } catch (error) {
    console.error("Get all performance reviews error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance reviews",
      details: error.message
    })
  }
}

// Get performance review by employee ID
const getPerformanceReviewByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId }
    if (year) filter["reviewPeriod.year"] = parseInt(year)
    if (quarter) filter["reviewPeriod.quarter"] = quarter
    
    const reviews = await PerformanceReview.find(filter)
      .populate("employeeId", "name email department role")
      .populate("reviewerId", "name email role")
      .populate("approvedBy", "name email")
      .sort({ "reviewPeriod.year": -1, "reviewPeriod.quarter": -1 })
    
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No performance reviews found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } catch (error) {
    console.error("Get performance review by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance review",
      details: error.message
    })
  }
}

// Get performance review by ID
const getPerformanceReviewById = async (req, res) => {
  try {
    const { id } = req.params
    
    const review = await PerformanceReview.findById(id)
      .populate("employeeId", "name email department role")
      .populate("reviewerId", "name email role")
      .populate("approvedBy", "name email")
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    res.json({
      success: true,
      data: review
    })
  } catch (error) {
    console.error("Get performance review by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance review",
      details: error.message
    })
  }
}

// Create performance review
const createPerformanceReview = async (req, res) => {
  try {
    const reviewData = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: reviewData.employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Validate reviewer exists
    const reviewer = await User.findOne({ id: reviewData.reviewerId })
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        error: "Reviewer not found"
      })
    }
    
    const review = new PerformanceReview(reviewData)
    await review.save()
    
    await review.populate("employeeId", "name email department role")
    await review.populate("reviewerId", "name email role")
    
    res.status(201).json({
      success: true,
      message: "Performance review created successfully",
      data: review
    })
  } catch (error) {
    console.error("Create performance review error:", error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Performance review already exists for this employee in this period"
      })
    }
    
    res.status(400).json({
      success: false,
      error: "Failed to create performance review",
      details: error.message
    })
  }
}

// Update performance review
const updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const review = await PerformanceReview.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department role")
     .populate("reviewerId", "name email role")
     .populate("approvedBy", "name email")
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    res.json({
      success: true,
      message: "Performance review updated successfully",
      data: review
    })
  } catch (error) {
    console.error("Update performance review error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update performance review",
      details: error.message
    })
  }
}

// Submit self-assessment
const submitSelfAssessment = async (req, res) => {
  try {
    const { id } = req.params
    const { selfAssessment } = req.body
    
    const review = await PerformanceReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    if (review.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot submit self-assessment for a review that is not pending"
      })
    }
    
    await review.submitSelfAssessment(selfAssessment)
    await review.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "Self-assessment submitted successfully",
      data: review
    })
  } catch (error) {
    console.error("Submit self-assessment error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to submit self-assessment",
      details: error.message
    })
  }
}

// Submit manager evaluation
const submitManagerEvaluation = async (req, res) => {
  try {
    const { id } = req.params
    const { managerEvaluation } = req.body
    
    const review = await PerformanceReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    if (!review.selfAssessment || !review.selfAssessment.submittedAt) {
      return res.status(400).json({
        success: false,
        error: "Self-assessment must be completed before manager evaluation"
      })
    }
    
    await review.submitManagerEvaluation(managerEvaluation)
    await review.populate("reviewerId", "name email role")
    
    res.json({
      success: true,
      message: "Manager evaluation submitted successfully",
      data: review
    })
  } catch (error) {
    console.error("Submit manager evaluation error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to submit manager evaluation",
      details: error.message
    })
  }
}

// Calculate final scores
const calculateFinalScores = async (req, res) => {
  try {
    const { id } = req.params
    
    const review = await PerformanceReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    if (review.status !== "manager_completed") {
      return res.status(400).json({
        success: false,
        error: "Both self-assessment and manager evaluation must be completed"
      })
    }
    
    await review.calculateFinalScores()
    
    res.json({
      success: true,
      message: "Final scores calculated successfully",
      data: review
    })
  } catch (error) {
    console.error("Calculate final scores error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to calculate final scores",
      details: error.message
    })
  }
}

// Approve performance review
const approvePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params
    const { approvedBy, approvalComments } = req.body
    
    const review = await PerformanceReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    if (review.status !== "calculated") {
      return res.status(400).json({
        success: false,
        error: "Final scores must be calculated before approval"
      })
    }
    
    review.approvedBy = approvedBy
    review.approvedAt = new Date()
    review.status = "approved"
    if (approvalComments) review.approvalComments = approvalComments
    
    await review.save()
    await review.populate("approvedBy", "name email")
    
    res.json({
      success: true,
      message: "Performance review approved successfully",
      data: review
    })
  } catch (error) {
    console.error("Approve performance review error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to approve performance review",
      details: error.message
    })
  }
}

// Generate comprehensive review report
const generateReviewReport = async (req, res) => {
  try {
    const { id } = req.params
    
    const review = await PerformanceReview.findById(id)
      .populate("employeeId", "name email department role")
      .populate("reviewerId", "name email role")
      .populate("approvedBy", "name email")
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    const report = review.generateComprehensiveReport()
    
    res.json({
      success: true,
      data: {
        employee: {
          id: review.employeeId.id,
          name: review.employeeId.name,
          email: review.employeeId.email,
          department: review.employeeId.department,
          role: review.employeeId.role
        },
        reviewer: {
          id: review.reviewerId.id,
          name: review.reviewerId.name,
          email: review.reviewerId.email,
          role: review.reviewerId.role
        },
        reviewPeriod: review.reviewPeriod,
        reviewType: review.reviewType,
        status: review.status,
        finalScores: review.finalScores,
        overallRating: review.overallRating,
        performanceCategory: review.performanceCategory,
        report,
        approvedBy: review.approvedBy,
        approvedAt: review.approvedAt,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    })
  } catch (error) {
    console.error("Generate review report error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to generate review report",
      details: error.message
    })
  }
}

// Get review analytics
const getReviewAnalytics = async (req, res) => {
  try {
    const { year, quarter, department, reviewType } = req.query
    const filter = {}
    
    if (year) filter["reviewPeriod.year"] = parseInt(year)
    if (quarter) filter["reviewPeriod.quarter"] = quarter
    if (reviewType) filter.reviewType = reviewType
    
    let reviews = await PerformanceReview.find(filter)
      .populate("employeeId", "name email department role")
    
    // Filter by department if specified
    if (department) {
      reviews = reviews.filter(review => review.employeeId.department === department)
    }
    
    const totalReviews = reviews.length
    const completedReviews = reviews.filter(review => review.status === "approved").length
    const averageOverallRating = completedReviews > 0 
      ? Math.round(reviews
          .filter(review => review.status === "approved")
          .reduce((sum, review) => sum + review.overallRating, 0) / completedReviews)
      : 0
    
    // Performance category distribution
    const categoryDistribution = reviews
      .filter(review => review.status === "approved")
      .reduce((acc, review) => {
        const category = review.performanceCategory
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
    
    // Department-wise analytics
    const departmentStats = reviews.reduce((acc, review) => {
      const dept = review.employeeId.department
      if (!acc[dept]) {
        acc[dept] = { 
          total: 0, 
          completed: 0, 
          pending: 0,
          totalRating: 0,
          categories: {}
        }
      }
      acc[dept].total++
      
      if (review.status === "approved") {
        acc[dept].completed++
        acc[dept].totalRating += review.overallRating
        
        const category = review.performanceCategory
        acc[dept].categories[category] = (acc[dept].categories[category] || 0) + 1
      } else {
        acc[dept].pending++
      }
      
      return acc
    }, {})
    
    // Calculate department averages
    Object.keys(departmentStats).forEach(dept => {
      const deptData = departmentStats[dept]
      deptData.completionRate = deptData.total > 0 
        ? Math.round((deptData.completed / deptData.total) * 100)
        : 0
      deptData.averageRating = deptData.completed > 0 
        ? Math.round(deptData.totalRating / deptData.completed)
        : 0
      delete deptData.totalRating // Clean up for response
    })
    
    // Review type distribution
    const reviewTypeDistribution = reviews.reduce((acc, review) => {
      acc[review.reviewType] = (acc[review.reviewType] || 0) + 1
      return acc
    }, {})
    
    // Status distribution
    const statusDistribution = reviews.reduce((acc, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1
      return acc
    }, {})
    
    res.json({
      success: true,
      data: {
        totalReviews,
        completedReviews,
        completionRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
        averageOverallRating,
        categoryDistribution,
        departmentStats,
        reviewTypeDistribution,
        statusDistribution
      }
    })
  } catch (error) {
    console.error("Get review analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch review analytics",
      details: error.message
    })
  }
}

// Get reviews due for approval
const getReviewsDue = async (req, res) => {
  try {
    const { days = 7 } = req.query
    
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + parseInt(days))
    
    const reviewsDue = await PerformanceReview.find({
      status: { $in: ["pending", "self_completed", "manager_completed", "calculated"] },
      createdAt: { $lte: dueDate }
    })
    .populate("employeeId", "name email department role")
    .populate("reviewerId", "name email role")
    .sort({ createdAt: 1 })
    
    // Group by status for better organization
    const groupedReviews = reviewsDue.reduce((acc, review) => {
      if (!acc[review.status]) {
        acc[review.status] = []
      }
      acc[review.status].push({
        id: review._id,
        employee: review.employeeId,
        reviewer: review.reviewerId,
        reviewType: review.reviewType,
        reviewPeriod: review.reviewPeriod,
        createdAt: review.createdAt,
        daysSinceCreated: Math.floor((new Date() - review.createdAt) / (1000 * 60 * 60 * 24))
      })
      return acc
    }, {})
    
    res.json({
      success: true,
      count: reviewsDue.length,
      data: groupedReviews
    })
  } catch (error) {
    console.error("Get reviews due error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews due",
      details: error.message
    })
  }
}

// Delete performance review
const deletePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params
    
    const review = await PerformanceReview.findByIdAndDelete(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Performance review not found"
      })
    }
    
    res.json({
      success: true,
      message: "Performance review deleted successfully"
    })
  } catch (error) {
    console.error("Delete performance review error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete performance review",
      details: error.message
    })
  }
}

module.exports = {
  getAllPerformanceReviews,
  getPerformanceReviewByEmployee,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  submitSelfAssessment,
  submitManagerEvaluation,
  calculateFinalScores,
  approvePerformanceReview,
  generateReviewReport,
  getReviewAnalytics,
  getReviewsDue,
  deletePerformanceReview
}
