const express = require("express")
const router = express.Router()
const {
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
} = require("../controllers/performanceReviewController")

// Basic CRUD routes
router.get("/", getAllPerformanceReviews)
router.get("/analytics", getReviewAnalytics)
router.get("/due", getReviewsDue)
router.get("/employee/:employeeId", getPerformanceReviewByEmployee)
router.get("/:id", getPerformanceReviewById)
router.post("/", createPerformanceReview)
router.put("/:id", updatePerformanceReview)
router.delete("/:id", deletePerformanceReview)

// Review workflow routes
router.post("/:id/self-assessment", submitSelfAssessment)
router.post("/:id/manager-evaluation", submitManagerEvaluation)
router.post("/:id/calculate-scores", calculateFinalScores)
router.post("/:id/approve", approvePerformanceReview)

// Report generation
router.get("/:id/report", generateReviewReport)

module.exports = router
