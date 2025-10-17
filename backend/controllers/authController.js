const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const Organization = require("../models/organizationModel")
const Department = require("../models/departmentModel")

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user.id,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
  )
}

const register = async (req, res) => {
  try {
    const {
      // Basic Information
      name,
      role,
      phone,
      email,
      organizationId,
      departmentId,

      // Personal Information
      dateOfBirth,
      currentAddress,
      photo,

      // Work Information
      joiningDate,
      upperManager,
      salary,
      experience,

      // Identity Documents
      adharCard,
      panCard,

      // Bank Details
      bankDetails,

      // Document Files
      documents,
    } = req.body

    // Validation
    if (!name || !email || !role || !organizationId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, role, organization, and department are required",
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      })
    }

    // Validate role
    const validRoles = ["admin", "manager", "employee", "intern", "hr"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      })
    }

    // Validate organization exists
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization selected",
      })
    }

    // Validate department exists and belongs to organization
    const department = await Department.findById(departmentId)
    if (!department || department.organizationId.toString() !== organizationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid department selected for the chosen organization",
      })
    }

    // Check if user with same name already exists in the same organization
    const existingUser = await User.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      organizationId,
      isActive: true,
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this name already exists in the organization",
      })
    }
    const user  = await User.findOne({
      email: email
    })
    if(user){
      return res.status(400).json({
        success : false,
        message : "User with this email already exists!"
      })
    }

    // Generate unique user ID
    const userId = await User.getNextId(role)

    // Prepare user data
    const userData = {
      // Basic Information
      id: userId,
      name: name.trim(),
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      password: userId, // Default password is the user ID
      role: role.toLowerCase(),
      organizationId,
      departmentId,
      

      // Personal Information
      dateOfBirth: dateOfBirth || null,
      currentAddress: currentAddress?.trim() || "",
      photo: photo || "",

      // Work Information
      joiningDate: joiningDate || null,
      upperManager: upperManager?.trim() || "",
      salary: Number(salary) || 0,
      experience: Number(experience) || 0,

      // Identity Documents
      adharCard: adharCard?.trim() || "",
      panCard: panCard?.trim().toUpperCase() || "",

      // Bank Details
      bankDetails: {
        accountHolder: bankDetails?.accountHolder?.trim() || "",
        accountNumber: bankDetails?.accountNumber?.trim() || "",
        ifsc: bankDetails?.ifsc?.trim().toUpperCase() || "",
        branch: bankDetails?.branch?.trim() || "",
        accountType: bankDetails?.accountType || "SAVING",
      },

      // Document Files
      documents: {
        aadharFront: documents?.aadharFront || "",
        aadharBack: documents?.aadharBack || "",
        panCard: documents?.panCard || "",
        resume: documents?.resume || "",
        experienceLetter: documents?.experienceLetter || "",
        passbookPhoto: documents?.passbookPhoto || "",
        tenthMarksheet: documents?.tenthMarksheet || "",
        twelfthMarksheet: documents?.twelfthMarksheet || "",
        degreeMarksheet: documents?.degreeMarksheet || "",
        policy: documents?.policy || "",
      },

      // Legacy fields for backward compatibility
      organizationName: organization.name,
      departmentName: department.name,
    }

    // Create new user
    const newUser = new User(userData)
    await newUser.save()

    // Update organization and department employee counts
    await Organization.findByIdAndUpdate(organizationId, {
      $inc: { totalEmployees: 1 },
    })

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: organization.name,
        department: department.name,
        message: `Login ID and password: ${userId}`,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User ID already exists",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

const login = async (req, res) => {
  try {
    const { id, password } = req.body

    if (!id || !password) {
      return res.status(400).json({
        success: false,
        message: "ID and password are required",
      })
    }

    const user = await User.findByEmployeeId(id)
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user)

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          organizationName: user.organizationName,
          departmentName: user.departmentName,
          lastLogin: user.lastLogin,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    const user = await User.findById(req.user._id)

    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    user.password = newPassword
    user.passwordChangedAt = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

module.exports = {
  register,
  login,
  changePassword,
}
