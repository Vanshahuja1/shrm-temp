const TaskPerformance = require("../models/taskPerformanceModel")
const User = require("../models/userModel")

// Get all task performances
const getAllTaskPerformances = async (req, res) => {
  try {
    const { year, quarter, employeeId, status, teamId } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    if (employeeId) filter.employeeId = employeeId
    if (status) filter.status = status
    if (teamId) filter.teamId = teamId
    
    const taskPerformances = await TaskPerformance.find(filter)
      .populate("employeeId", "name email department role")
      .populate("teamId", "name description")
      .populate("evaluatedBy", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    res.json({
      success: true,
      count: taskPerformances.length,
      data: taskPerformances
    })
  } catch (error) {
    console.error("Get all task performances error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task performances",
      details: error.message
    })
  }
}

// Get task performance by employee ID
const getTaskPerformanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, quarter } = req.query
    
    const filter = { employeeId }
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    const taskPerformances = await TaskPerformance.find(filter)
      .populate("employeeId", "name email department role")
      .populate("teamId", "name description")
      .populate("evaluatedBy", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 })
    
    if (!taskPerformances || taskPerformances.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No task performances found for this employee"
      })
    }
    
    res.json({
      success: true,
      count: taskPerformances.length,
      data: taskPerformances
    })
  } catch (error) {
    console.error("Get task performance by employee error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task performance",
      details: error.message
    })
  }
}

// Get task performance by ID
const getTaskPerformanceById = async (req, res) => {
  try {
    const { id } = req.params
    
    const taskPerformance = await TaskPerformance.findById(id)
      .populate("employeeId", "name email department role")
      .populate("teamId", "name description")
      .populate("evaluatedBy", "name email")
    
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance not found"
      })
    }
    
    res.json({
      success: true,
      data: taskPerformance
    })
  } catch (error) {
    console.error("Get task performance by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task performance",
      details: error.message
    })
  }
}

// Create task performance
const createTaskPerformance = async (req, res) => {
  try {
    const taskPerformanceData = req.body
    
    // Validate employee exists
    const employee = await User.findOne({ id: taskPerformanceData.employeeId })
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      })
    }
    
    // Validate evaluator exists
    const evaluator = await User.findOne({ id: taskPerformanceData.evaluatedBy })
    if (!evaluator) {
      return res.status(404).json({
        success: false,
        error: "Evaluator not found"
      })
    }
    
    const taskPerformance = new TaskPerformance(taskPerformanceData)
    await taskPerformance.save()
    
    await taskPerformance.populate("employeeId", "name email department role")
    await taskPerformance.populate("evaluatedBy", "name email")
    
    res.status(201).json({
      success: true,
      message: "Task performance created successfully",
      data: taskPerformance
    })
  } catch (error) {
    console.error("Create task performance error:", error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Task performance already exists for this employee in this period"
      })
    }
    
    res.status(400).json({
      success: false,
      error: "Failed to create task performance",
      details: error.message
    })
  }
}

// Update task performance
const updateTaskPerformance = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const taskPerformance = await TaskPerformance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department role")
     .populate("teamId", "name description")
     .populate("evaluatedBy", "name email")
    
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance not found"
      })
    }
    
    res.json({
      success: true,
      message: "Task performance updated successfully",
      data: taskPerformance
    })
  } catch (error) {
    console.error("Update task performance error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update task performance",
      details: error.message
    })
  }
}

// Add individual task performance
const addTaskPerformance = async (req, res) => {
  try {
    const { id } = req.params
    const taskData = req.body
    
    const taskPerformance = await TaskPerformance.findById(id)
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance record not found"
      })
    }
    
    await taskPerformance.addTask(taskData)
    await taskPerformance.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "Task added successfully",
      data: taskPerformance
    })
  } catch (error) {
    console.error("Add task performance error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to add task",
      details: error.message
    })
  }
}

// Update individual task rating
const updateTaskRating = async (req, res) => {
  try {
    const { id, taskId } = req.params
    const { deliveryRating, qualityRating, efficiencyRating, comments } = req.body
    
    const taskPerformance = await TaskPerformance.findById(id)
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance record not found"
      })
    }
    
    await taskPerformance.updateTaskRating(taskId, {
      deliveryRating,
      qualityRating,
      efficiencyRating,
      comments
    })
    
    await taskPerformance.populate("employeeId", "name email department role")
    
    res.json({
      success: true,
      message: "Task rating updated successfully",
      data: taskPerformance
    })
  } catch (error) {
    console.error("Update task rating error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to update task rating",
      details: error.message
    })
  }
}

// Bulk update task performances from task system
const bulkUpdateFromTaskSystem = async (req, res) => {
  try {
    const { taskSystemData } = req.body
    
    if (!Array.isArray(taskSystemData) || taskSystemData.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Task system data must be a non-empty array"
      })
    }
    
    const updatedPerformances = []
    
    for (const taskData of taskSystemData) {
      const { employeeId, quarter, year, tasks } = taskData
      
      // Find or create task performance record
      let taskPerformance = await TaskPerformance.findOne({
        employeeId,
        "evaluationPeriod.quarter": quarter,
        "evaluationPeriod.year": year
      })
      
      if (!taskPerformance) {
        taskPerformance = new TaskPerformance({
          employeeId,
          evaluationPeriod: { quarter, year },
          teamId: taskData.teamId,
          evaluatedBy: taskData.evaluatedBy || employeeId, // Self-evaluation if no evaluator
          tasks: []
        })
      }
      
      // Add or update tasks
      for (const task of tasks) {
        await taskPerformance.addTask(task)
      }
      
      await taskPerformance.save()
      updatedPerformances.push(taskPerformance)
    }
    
    res.json({
      success: true,
      message: `Bulk updated ${updatedPerformances.length} task performance records`,
      data: updatedPerformances
    })
  } catch (error) {
    console.error("Bulk update task performances error:", error)
    res.status(400).json({
      success: false,
      error: "Failed to bulk update task performances",
      details: error.message
    })
  }
}

// Get task performance summary
const getTaskPerformanceSummary = async (req, res) => {
  try {
    const { id } = req.params
    
    const taskPerformance = await TaskPerformance.findById(id)
      .populate("employeeId", "name email department role")
      .populate("teamId", "name description")
    
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance not found"
      })
    }
    
    const summary = taskPerformance.calculateQuarterlySummary()
    
    res.json({
      success: true,
      data: {
        employeeId: taskPerformance.employeeId,
        quarter: taskPerformance.evaluationPeriod.quarter,
        year: taskPerformance.evaluationPeriod.year,
        teamId: taskPerformance.teamId,
        totalTasks: taskPerformance.totalTasks,
        completedTasks: taskPerformance.completedTasks,
        averageDeliveryScore: taskPerformance.averageDeliveryScore,
        averageQualityScore: taskPerformance.averageQualityScore,
        averageEfficiencyScore: taskPerformance.averageEfficiencyScore,
        overallTaskScore: taskPerformance.overallTaskScore,
        summary,
        taskBreakdown: taskPerformance.tasks.map(task => ({
          title: task.title,
          status: task.status,
          deliveryRating: task.deliveryRating,
          qualityRating: task.qualityRating,
          efficiencyRating: task.efficiencyRating,
          overallRating: task.overallRating,
          plannedEndDate: task.plannedEndDate,
          actualEndDate: task.actualEndDate,
          complexity: task.complexity
        }))
      }
    })
  } catch (error) {
    console.error("Get task performance summary error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task performance summary",
      details: error.message
    })
  }
}

// Get team performance comparison
const getTeamPerformanceComparison = async (req, res) => {
  try {
    const { teamId, year, quarter } = req.params
    
    const filter = {
      teamId,
      "evaluationPeriod.year": parseInt(year),
      "evaluationPeriod.quarter": quarter
    }
    
    const teamPerformances = await TaskPerformance.find(filter)
      .populate("employeeId", "name email department role")
      .sort({ overallTaskScore: -1 })
    
    if (!teamPerformances || teamPerformances.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No task performances found for this team"
      })
    }
    
    const teamStats = {
      totalMembers: teamPerformances.length,
      averageTeamScore: Math.round(
        teamPerformances.reduce((sum, tp) => sum + tp.overallTaskScore, 0) / teamPerformances.length
      ),
      averageDeliveryScore: Math.round(
        teamPerformances.reduce((sum, tp) => sum + tp.averageDeliveryScore, 0) / teamPerformances.length
      ),
      averageQualityScore: Math.round(
        teamPerformances.reduce((sum, tp) => sum + tp.averageQualityScore, 0) / teamPerformances.length
      ),
      averageEfficiencyScore: Math.round(
        teamPerformances.reduce((sum, tp) => sum + tp.averageEfficiencyScore, 0) / teamPerformances.length
      ),
      totalTasksCompleted: teamPerformances.reduce((sum, tp) => sum + tp.completedTasks, 0),
      memberPerformances: teamPerformances.map(tp => ({
        employeeId: tp.employeeId.id,
        employeeName: tp.employeeId.name,
        overallScore: tp.overallTaskScore,
        tasksCompleted: tp.completedTasks,
        deliveryScore: tp.averageDeliveryScore,
        qualityScore: tp.averageQualityScore,
        efficiencyScore: tp.averageEfficiencyScore
      }))
    }
    
    res.json({
      success: true,
      data: teamStats
    })
  } catch (error) {
    console.error("Get team performance comparison error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch team performance comparison",
      details: error.message
    })
  }
}

// Get task performance analytics
const getTaskPerformanceAnalytics = async (req, res) => {
  try {
    const { year, quarter, department } = req.query
    const filter = {}
    
    if (year) filter["evaluationPeriod.year"] = parseInt(year)
    if (quarter) filter["evaluationPeriod.quarter"] = quarter
    
    let taskPerformances = await TaskPerformance.find(filter)
      .populate("employeeId", "name email department role")
    
    // Filter by department if specified
    if (department) {
      taskPerformances = taskPerformances.filter(tp => tp.employeeId.department === department)
    }
    
    const totalEmployees = taskPerformances.length
    const totalTasks = taskPerformances.reduce((sum, tp) => sum + tp.totalTasks, 0)
    const completedTasks = taskPerformances.reduce((sum, tp) => sum + tp.completedTasks, 0)
    const averageOverallScore = totalEmployees > 0 
      ? Math.round(taskPerformances.reduce((sum, tp) => sum + tp.overallTaskScore, 0) / totalEmployees)
      : 0
    
    // Performance distribution
    const performanceDistribution = {
      excellent: taskPerformances.filter(tp => tp.overallTaskScore >= 90).length,
      good: taskPerformances.filter(tp => tp.overallTaskScore >= 70 && tp.overallTaskScore < 90).length,
      average: taskPerformances.filter(tp => tp.overallTaskScore >= 50 && tp.overallTaskScore < 70).length,
      needsImprovement: taskPerformances.filter(tp => tp.overallTaskScore < 50).length
    }
    
    // Department-wise analytics
    const departmentStats = taskPerformances.reduce((acc, tp) => {
      const dept = tp.employeeId.department
      if (!acc[dept]) {
        acc[dept] = { 
          count: 0, 
          totalScore: 0, 
          totalTasks: 0, 
          completedTasks: 0,
          deliveryScores: [],
          qualityScores: [],
          efficiencyScores: []
        }
      }
      acc[dept].count++
      acc[dept].totalScore += tp.overallTaskScore
      acc[dept].totalTasks += tp.totalTasks
      acc[dept].completedTasks += tp.completedTasks
      acc[dept].deliveryScores.push(tp.averageDeliveryScore)
      acc[dept].qualityScores.push(tp.averageQualityScore)
      acc[dept].efficiencyScores.push(tp.averageEfficiencyScore)
      return acc
    }, {})
    
    // Calculate department averages
    Object.keys(departmentStats).forEach(dept => {
      const deptData = departmentStats[dept]
      deptData.averageScore = Math.round(deptData.totalScore / deptData.count)
      deptData.completionRate = deptData.totalTasks > 0 
        ? Math.round((deptData.completedTasks / deptData.totalTasks) * 100)
        : 0
      deptData.averageDeliveryScore = Math.round(
        deptData.deliveryScores.reduce((sum, score) => sum + score, 0) / deptData.deliveryScores.length
      )
      deptData.averageQualityScore = Math.round(
        deptData.qualityScores.reduce((sum, score) => sum + score, 0) / deptData.qualityScores.length
      )
      deptData.averageEfficiencyScore = Math.round(
        deptData.efficiencyScores.reduce((sum, score) => sum + score, 0) / deptData.efficiencyScores.length
      )
      
      // Clean up arrays for response
      delete deptData.deliveryScores
      delete deptData.qualityScores
      delete deptData.efficiencyScores
    })
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        averageOverallScore,
        performanceDistribution,
        departmentStats
      }
    })
  } catch (error) {
    console.error("Get task performance analytics error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch task performance analytics",
      details: error.message
    })
  }
}

// Delete task performance
const deleteTaskPerformance = async (req, res) => {
  try {
    const { id } = req.params
    
    const taskPerformance = await TaskPerformance.findByIdAndDelete(id)
    if (!taskPerformance) {
      return res.status(404).json({
        success: false,
        error: "Task performance not found"
      })
    }
    
    res.json({
      success: true,
      message: "Task performance deleted successfully"
    })
  } catch (error) {
    console.error("Delete task performance error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete task performance",
      details: error.message
    })
  }
}

module.exports = {
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
}
