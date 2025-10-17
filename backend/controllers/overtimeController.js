const Overtime = require("../models/overtimeModel")

// Get overtime requests
const getOvertimeRequests = async (req, res) => {
  try {
    const { id } = req.params

    const requests = await Overtime.find({ employeeId: id }).sort({ submittedAt: -1 })

    const overtimeRequests = requests.map((req) => ({
      id: req._id,
      date: req.date,
      hours: req.hours,
      justification: req.justification,
      status: req.status,
      submittedAt: req.submittedAt.toISOString(),
      reviewedBy: req.reviewedBy,
      reviewedAt: req.reviewedAt ? req.reviewedAt.toISOString() : null,
    }))

    // Get current overtime hours for today
    const today = new Date().toISOString().split("T")[0]
    const todayRequest = requests.find((r) => r.date === today && r.status === "approved")
    const currentHours = todayRequest?.hours || 0

    res.json({
      requests: overtimeRequests,
      currentHours,
    })
  } catch (error) {
    console.error("Get overtime requests error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Submit overtime request
const submitOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params
    const { hours, justification, date } = req.body

    // Check if request already exists for this date
    const existingRequest = await Overtime.findOne({
      employeeId: id,
      date,
    })

    if (existingRequest) {
      return res.status(400).json({
        error: "Overtime request already exists for this date",
      })
    }

    const overtimeRequest = new Overtime({
      employeeId: id,
      date,
      hours,
      justification,
      status: hours <= 1 ? "approved" : "pending", // Auto-approve <= 1 hour
    })

    if (hours <= 1) {
      overtimeRequest.reviewedBy = "System"
      overtimeRequest.reviewedAt = new Date()
    }

    await overtimeRequest.save()

    res.status(201).json({
      id: overtimeRequest._id,
      employeeId: overtimeRequest.employeeId,
      date: overtimeRequest.date,
      hours: overtimeRequest.hours,
      justification: overtimeRequest.justification,
      status: overtimeRequest.status,
      submittedAt: overtimeRequest.submittedAt.toISOString(),
    })
  } catch (error) {
    console.error("Submit overtime request error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getOvertimeRequests,
  submitOvertimeRequest,
}
