const Organization = require("../models/organizationModel")

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findActive()
    res.json({
      success: true,
      data: organizations,
      count: organizations.length,
    })
  } catch (error) {
    console.error("Get all organizations error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations",
      error: error.message,
    })
  }
}

exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      })
    }

    const organization = await Organization.findById(id)
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      })
    }

    res.json({
      success: true,
      data: organization,
    })
  } catch (error) {
    console.error("Get organization by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization",
      error: error.message,
    })
  }
}

exports.createOrganization = async (req, res) => {
  try {
    const newOrganization = await Organization.create(req.body)
    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: newOrganization,
    })
  } catch (error) {
    console.error("Create organization error:", error)

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Organization with this name already exists",
      })
    }

    res.status(400).json({
      success: false,
      message: "Failed to create organization",
      error: error.message,
    })
  }
}

exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      })
    }

    const updated = await Organization.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      })
    }

    res.json({
      success: true,
      message: "Organization updated successfully",
      data: updated,
    })
  } catch (error) {
    console.error("Update organization error:", error)
    res.status(400).json({
      success: false,
      message: "Failed to update organization",
      error: error.message,
    })
  }
}

exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      })
    }

    const deleted = await Organization.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      })
    }

    res.json({
      success: true,
      message: "Organization deleted successfully",
    })
  } catch (error) {
    console.error("Delete organization error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete organization",
      error: error.message,
    })
  }
}

exports.getOrganizationSummary = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      })
    }

    const organization = await Organization.findById(id)
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      })
    }

    res.json({
      success: true,
      data: organization.getSummary(),
    })
  } catch (error) {
    console.error("Get organization summary error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization summary",
      error: error.message,
    })
  }
}
