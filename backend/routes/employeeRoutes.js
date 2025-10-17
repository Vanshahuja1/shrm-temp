const express = require("express")
const router = express.Router()

// Import controllers
const employeeController = require("../controllers/employeeController")
const attendanceController = require("../controllers/attendanceController")
const performanceController = require("../controllers/performanceController")
const overtimeController = require("../controllers/overtimeController")
const workHoursController = require("../controllers/workHoursController")
const dataSyncController = require("../controllers/dataSyncController")
const settingsController = require("../controllers/settingsController")

// Employee basic info
router.get("/:id", employeeController.getEmployeeInfo)

// Tasks
router.get("/:id/tasks", employeeController.getEmployeeTasks)
router.post("/:id/tasks/:taskId/response", employeeController.submitTaskResponse)

// Attendance
router.get("/:id/attendance", attendanceController.getAttendanceRecords)
router.post("/:id/attendance", attendanceController.punchIn)
router.post("/:id/attendance/punch-out", attendanceController.punchOut)
router.post("/:id/attendance/breaks", attendanceController.handleBreak)
router.get("/:id/attendance/breaks", attendanceController.getTodayBreaks)

// Performance
router.get("/:id/performance", performanceController.getPerformanceMetrics)

// Overtime
router.get("/:id/overtime", overtimeController.getOvertimeRequests)
router.post("/:id/overtime", overtimeController.submitOvertimeRequest)

// Work Hours
router.get("/:id/work-hours", workHoursController.getWorkHours)
router.post("/:id/work-hours/test", workHoursController.createTestWorkHours)

// Data Sync
router.get("/:id/data-sync", dataSyncController.getDataSyncStatus)
router.post("/:id/data-sync/force", dataSyncController.forceDataSync)

// Settings
router.get("/:id/settings", settingsController.getEmployeeSettings)
router.put("/:id/settings", settingsController.updateEmployeeSettings)

module.exports = router
