const express = require("express")
const router = express.Router()
const {
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
} = require("../controllers/kraController")

// Basic CRUD routes
router.get("/", getAllKRAs)
router.get("/analytics", getKRAAnalytics)
router.get("/employee/:employeeId", getKRAByEmployee)
router.get("/:id", getKRAById)
router.post("/", createKRA)
router.put("/:id", updateKRA)
router.delete("/:id", deleteKRA)

// KRA management routes
router.post("/:id/add-kra", addIndividualKRA)
router.put("/:id/kra/:kraId/status", updateKRAStatus)
router.get("/:id/progress", getKRAProgress)

router.get("/manager/:managerId", getKRAByManager)
// Approval routes
router.post("/:id/approve", approveKRA)

module.exports = router
