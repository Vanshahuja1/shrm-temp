const express = require("express")
const router = express.Router()
const {
  getAllTaskPerformances,
  getTaskPerformanceByEmployee,
  getTaskPerformanceById,
  createTaskPerformance,
  updateTaskPerformance,
  addTaskPerformance,
  updateTaskRating,
  bulkUpdateFromTaskSystem,
  getTaskPerformanceSummary,
  getTeamPerformanceComparison,
  getTaskPerformanceAnalytics,
  deleteTaskPerformance
} = require("../controllers/taskPerformanceController")

// Basic CRUD routes
router.get("/", getAllTaskPerformances)
router.get("/analytics", getTaskPerformanceAnalytics)
router.get("/employee/:employeeId", getTaskPerformanceByEmployee)
router.get("/:id", getTaskPerformanceById)
router.post("/", createTaskPerformance)
router.put("/:id", updateTaskPerformance)
router.delete("/:id", deleteTaskPerformance)

// Task management routes
router.post("/:id/add-task", addTaskPerformance)
router.put("/:id/task/:taskId/rating", updateTaskRating)
router.get("/:id/summary", getTaskPerformanceSummary)

// Team and bulk operations
router.get("/team/:teamId/:year/:quarter", getTeamPerformanceComparison)
router.post("/bulk-update", bulkUpdateFromTaskSystem)

module.exports = router
