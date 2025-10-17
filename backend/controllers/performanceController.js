
const Performance = require("../models/performanceModel")
const Task = require("../models/taskModel")
const Attendance = require("../models/attendanceModel")
const User = require("../models/userModel")

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
  try {
    const { id } = req.params
    const { period = "monthly" } = req.query

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    let performance = await Performance.findOne({
      employeeId: id,
      month: currentMonth,
    })

    if (!performance) {
      // Calculate and create performance record
      performance = await calculatePerformanceMetrics(id, currentMonth)
    }

    res.json({
      combinedPercentage: performance.metrics.combinedPercentage,
      tasksPerDay: performance.metrics.averageTasksPerDay,
      attendanceScore: performance.metrics.attendanceScore,
      managerRating: performance.metrics.managerRating,
      completionRate: performance.metrics.completionRate,
      monthlyTasks: performance.metrics.tasksCompleted,
    })
  } catch (error) {
    console.error("Get performance metrics error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Calculate performance metrics
const calculatePerformanceMetrics = async (employeeId, month) => {
  try {
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // Get tasks for the month
    const tasks = await Task.find({
      "assignedTo.id": employeeId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })

    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get attendance for the month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    })

    const presentDays = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length
    const totalWorkingDays = attendanceRecords.length
    const attendanceScore = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0

    // Calculate average tasks per day
    const workingDays = Math.max(totalWorkingDays, 1)
    const averageTasksPerDay = Math.round((completedTasks / workingDays) * 10) / 10

    // Get or set manager rating (you might want to implement a rating system)
    const user = await User.findOne({ id: employeeId })
    const managerRating = user.performance / 20 || 3.5 // Convert 0-100 to 0-5 scale

    const metrics = {
      tasksCompleted: completedTasks,
      tasksAssigned: totalTasks,
      averageTasksPerDay,
      attendanceScore,
      managerRating,
      completionRate,
    }

    // Create performance record
    const performance = new Performance({
      employeeId,
      month,
      metrics,
    })

    performance.calculateCombinedScore()
    await performance.save()

    return performance
  } catch (error) {
    console.error("Calculate performance metrics error:", error)
    throw error
  }
}

module.exports = {
  getPerformanceMetrics,
  calculatePerformanceMetrics,
}
