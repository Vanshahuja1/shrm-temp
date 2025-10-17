const EmployeeSettings = require("../models/employeeSettingsModel")

// Get employee settings
const getEmployeeSettings = async (req, res) => {
  try {
    const { id } = req.params

    let settings = await EmployeeSettings.findOne({ employeeId: id })

    if (!settings) {
      // Create default settings
      settings = new EmployeeSettings({ employeeId: id })
      await settings.save()
    }

    res.json({
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone,
      notifications: settings.notifications,
      dashboardLayout: settings.dashboardLayout,
      colorScheme: settings.colorScheme,
    })
  } catch (error) {
    console.error("Get employee settings error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Update employee settings
const updateEmployeeSettings = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const settings = await EmployeeSettings.findOneAndUpdate({ employeeId: id }, updateData, {
      new: true,
      upsert: true,
    })

    res.json({
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone,
      notifications: settings.notifications,
      dashboardLayout: settings.dashboardLayout,
      colorScheme: settings.colorScheme,
    })
  } catch (error) {
    console.error("Update employee settings error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getEmployeeSettings,
  updateEmployeeSettings,
}
