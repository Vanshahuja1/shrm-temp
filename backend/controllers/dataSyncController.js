const User = require("../models/userModel")
const Attendance = require("../models/attendanceModel")
const Performance = require("../models/performanceModel")
const TaskResponse = require("../models/taskResponseModel")

// Get data sync status
const getDataSyncStatus = async (req, res) => {
  try {
    const { id } = req.params

    // Mock data sync status - you can implement actual sync logic
    const adminData = []
    const managerData = []

    // Get recent performance and attendance data
    const recentPerformance = await Performance.findOne({ employeeId: id }).sort({ createdAt: -1 })

    const recentAttendance = await Attendance.find({ employeeId: id }).sort({ date: -1 }).limit(7)

    if (recentPerformance) {
      adminData.push({
        performanceMetrics: true,
        attendanceRecords: recentAttendance.map((a) => ({
          date: a.date,
          punchIn: a.punchIn ? a.punchIn.toTimeString().slice(0, 5) : null,
          punchOut: a.punchOut ? a.punchOut.toTimeString().slice(0, 5) : null,
          totalHours: a.totalHours,
          status: a.status,
        })),
        workHours: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Get recent task responses
    const recentResponses = await TaskResponse.find({ employeeId: id }).sort({ submittedAt: -1 }).limit(5)

    if (recentResponses.length > 0) {
      managerData.push({
        taskResponses: recentResponses.map((r) => ({
          id: r._id,
          response: r.response,
          format: r.format,
          documents: r.documents,
          submittedAt: r.submittedAt.toISOString(),
          status: r.status,
        })),
        completionStatus: true,
        performanceData: true,
        timestamp: new Date().toISOString(),
      })
    }

    res.json({
      adminData,
      managerData,
      lastSyncTime: new Date().toISOString(),
      syncStatus: "synced",
    })
  } catch (error) {
    console.error("Get data sync status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Force data sync
const forceDataSync = async (req, res) => {
  try {
    const { id } = req.params

    // Implement your sync logic here
    // This could involve sending data to external systems,
    // updating caches, etc.

    // For now, just return success
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Force data sync error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getDataSyncStatus,
  forceDataSync,
}
