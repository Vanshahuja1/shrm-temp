const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password")
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists or is inactive",
      })
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password recently changed. Please log in again.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      })
    } else if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Token expired",
      })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      })
    }
    next()
  }
}

module.exports = { authenticateToken, restrictTo }
