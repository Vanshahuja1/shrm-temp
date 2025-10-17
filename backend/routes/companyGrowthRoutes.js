const express = require("express")
const router = express.Router()
const {
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
} = require("../controllers/companyGrowthController")

// Basic CRUD routes
router.get("/", getAllCompanyGrowth)
router.get("/analytics", getGrowthAnalytics)
router.get("/current-rate", getCurrentGrowthRate)
router.get("/trend", getGrowthTrend)
router.get("/period/:year/:quarter", getCompanyGrowthByPeriod)
router.get("/:id", getCompanyGrowthById)
router.post("/", createCompanyGrowth)
router.put("/:id", updateCompanyGrowth)
router.delete("/:id", deleteCompanyGrowth)

// Growth calculation routes
router.post("/:id/calculate-metrics", calculateGrowthMetrics)

// Approval routes
router.post("/:id/approve", approveCompanyGrowth)

module.exports = router
