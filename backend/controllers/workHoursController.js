const Attendance = require("../models/attendanceModel")
const Task = require("../models/taskModel")
const TaskResponse = require("../models/taskResponseModel")

// Create test attendance data for an employee
const createTestWorkHours = async (req, res) => {
  try {
    const { id } = req.params
    const today = new Date().toISOString().split("T")[0]

    // Check if attendance record already exists
    let attendance = await Attendance.findOne({ employeeId: id, date: today })

    if (!attendance) {
      // Create a sample attendance record for today
      const now = new Date()
      const punchInTime = new Date()
      punchInTime.setHours(9, 0, 0, 0) // 9:00 AM

      attendance = new Attendance({
        employeeId: id,
        date: today,
        punchIn: punchInTime,
        punchOut: null, // Still working
        totalHours: 7.5, // Sample: worked 7.5 hours so far
        breakTime: 45, // 45 minutes break
        overtimeHours: 0,
        status: "present",
        isActive: true, // Currently punched in
      })
      
      await attendance.save()
    }

    // Create some sample tasks for justification
    const existingTasks = await Task.find({ "assignedTo.id": id })
    if (existingTasks.length === 0) {
      const sampleTasks = [
        {
          title: "Frontend dashboard development",
          description: "Working on employee dashboard components",
          assignedTo: { id: id, name: "Employee" },
          assignedBy: { id: "MGR001", name: "Manager" },
          dueDate: today,
          status: "in-progress"
        },
        {
          title: "API integration for work hours",
          description: "Integrating backend API with frontend components",
          assignedTo: { id: id, name: "Employee" },
          assignedBy: { id: "MGR001", name: "Manager" },
          dueDate: today,
          status: "completed"
        }
      ]

      await Task.insertMany(sampleTasks)
    }

    res.json({ message: "Test work hours data created successfully" })
  } catch (error) {
    console.error("Create test work hours error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get work hours data
const getWorkHours = async (req, res) => {
  try {
    const { id } = req.params
    const { date = new Date().toISOString().split("T")[0] } = req.query

    console.log(`Fetching work hours for employee ${id} on ${date}`)

    const attendance = await Attendance.findOne({ employeeId: id, date })

    if (!attendance) {
      console.log(`No attendance record found for employee ${id} on ${date}`)
      return res.json({
        todayHours: 0,
        requiredHours: 8,
        breakTime: 0,
        overtimeHours: 0,
        taskJustification: [],
        isActive: false,
      })
    }

    console.log(`Found attendance record:`, {
      totalHours: attendance.totalHours,
      breakTime: attendance.breakTime,
      overtimeHours: attendance.overtimeHours,
      isActive: attendance.isActive
    })

    // Get task justifications for the day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const tasks = await Task.find({
      "assignedTo.id": id,
      updatedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })

    const taskJustification = tasks.map((task) => task.title)

    const workHoursData = {
      todayHours: attendance.totalHours || 0,
      requiredHours: 8,
      breakTime: attendance.breakTime || 0,
      overtimeHours: attendance.overtimeHours || 0,
      taskJustification,
      isActive: attendance.isActive || false,
    }

    console.log(`Returning work hours data:`, workHoursData)
    res.json(workHoursData)
  } catch (error) {
    console.error("Get work hours error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getWorkHours,
  createTestWorkHours,
}
