const Department = require("../models/departmentModel")

exports.getAllDepartments = async (req, res) => {
  try {
    const { organizationId } = req.query

    let departments
    if (organizationId) {
      // Validate ObjectId format
      if (!organizationId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid organization ID format",
        })
      }
      departments = await Department.findByOrganization(organizationId)
    } else {
      try {
        departments = await Department.find({}).populate("organizationId", "name").sort({ name: 1 })
      } catch (populateError) {
        console.error("Population failed, trying without populate:", populateError)
        // If populate fails, get departments without population
        departments = await Department.find({}).sort({ name: 1 })
      }
    }

    res.json({
      success: true,
      data: departments,
      count: departments.length,
    })
  } catch (error) {
    console.error("Get all departments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    })
  }
}

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      })
    }

    const department = await Department.findById(id).populate("organizationId", "name")
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    res.json({
      success: true,
      data: department,
    })
  } catch (error) {
    console.error("Get department by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department",
      error: error.message,
    })
  }
}

exports.createDepartment = async (req, res) => {
  try {
    const newDepartment = await Department.create(req.body)
    const populatedDepartment = await Department.findById(newDepartment._id).populate("organizationId", "name")

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: populatedDepartment,
    })
  } catch (error) {
    console.error("Create department error:", error)
    res.status(400).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    })
  }
}

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      })
    }

    const updated = await Department.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate(
      "organizationId",
      "name",
    )

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    res.json({
      success: true,
      message: "Department updated successfully",
      data: updated,
    })
  } catch (error) {
    console.error("Update department error:", error)
    res.status(400).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    })
  }
}

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      })
    }

    const deleted = await Department.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    })
  } catch (error) {
    console.error("Delete department error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete department",
      error: error.message,
    })
  }
}

exports.getDepartmentsByOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params

    // Validate ObjectId format
    if (!orgId || !orgId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      })
    }

    const departments = await Department.findByOrganization(orgId)
    res.json({
      success: true,
      data: departments,
      count: departments.length,
    })
  } catch (error) {
    console.error("Get departments by organization error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    })
  }
}

exports.getDepartmentSummary = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      })
    }

    const department = await Department.findById(id)
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    res.json({
      success: true,
      data: department.getSummary(),
    })
  } catch (error) {
    console.error("Get department summary error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch department summary",
      error: error.message,
    })
  }
}
