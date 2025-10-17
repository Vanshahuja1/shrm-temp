const User = require("../models/userModel")

const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { isActive: true }

    if (req.query.role) {
      filter.role = req.query.role.toLowerCase()
    }

    if (req.query.department) {
      filter.departmentName = { $regex: req.query.department, $options: "i" }
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

module.exports = {
  getAllUsers,
}
