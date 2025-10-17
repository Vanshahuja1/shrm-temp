const express = require("express")
const router = express.Router()
const {
  getAllSalaryIncrements,
  getSalaryIncrementByEmployee,
  getSalaryIncrementById,
  calculateSalaryIncrement,
  bulkCalculateIncrements,
  updateSalaryIncrement,
  approveSalaryIncrement,
  getIncrementAnalytics,
  deleteSalaryIncrement
} = require("../controllers/salaryIncrementController")

// Basic CRUD routes
router.get("/", getAllSalaryIncrements)
router.get("/analytics", getIncrementAnalytics)
router.get("/employee/:employeeId", getSalaryIncrementByEmployee)
router.get("/:id", getSalaryIncrementById)
router.put("/:id", updateSalaryIncrement)
router.delete("/:id", deleteSalaryIncrement)

// Calculation routes
router.post("/calculate", calculateSalaryIncrement)
router.post("/bulk-calculate", bulkCalculateIncrements)

// Approval routes
router.post("/:id/approve", approveSalaryIncrement)

module.exports = router
