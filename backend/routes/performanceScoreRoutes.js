const express = require("express")
const router = express.Router()
const {
  getAllPerformanceScores,
  getPerformanceScoreByEmployee,
  getPerformanceScoreById,
  createPerformanceScore,
  updatePerformanceScore,
  addManagerEvaluation,
  addSelfAssessment,
  calculateIncrementEligibility,
  getPerformanceAnalytics,
  deletePerformanceScore,
  getPerformanceScoreByManager
} = require("../controllers/performanceScoreController")

// Basic CRUD routes
router.get("/", getAllPerformanceScores)
router.get("/analytics", getPerformanceAnalytics)
router.get("/employee/:employeeId", getPerformanceScoreByEmployee)
router.get("/:id", getPerformanceScoreById)
router.post("/", createPerformanceScore)
router.put("/:id", updatePerformanceScore)
router.delete("/:id", deletePerformanceScore)

router.get("/manager/:managerId", getPerformanceScoreByManager)

// Evaluation routes
router.post("/:id/manager-evaluation", addManagerEvaluation)
router.post("/:id/self-assessment", addSelfAssessment)

// Calculation routes
router.post("/:id/calculate-increment", calculateIncrementEligibility)

module.exports = router
