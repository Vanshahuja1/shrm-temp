const express = require("express")
const router = express.Router()
const {
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
} = require("../controllers/kpiController")

// Basic CRUD routes
router.get("/", getAllKPIs)
router.get("/analytics", getKPIAnalytics)
router.get("/employee/:employeeId", getKPIByEmployee)
router.get("/:id", getKPIById)
router.post("/", createKPI)
router.put("/:id", updateKPI)
router.delete("/:id", deleteKPI)

// KPI management routes
router.post("/:id/add-kpi", addIndividualKPI)
router.put("/:id/kpi/:kpiId/value", updateKPIValue)
router.get("/:id/performance", getKPIPerformance)

// Bulk operations
router.post("/bulk-update", bulkUpdateKPIs)

// Approval routes
router.post("/:id/approve", approveKPI)

module.exports = router
