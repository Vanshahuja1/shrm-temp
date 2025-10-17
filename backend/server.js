require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/database")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const projectRoutes = require("./routes/projectRoutes")
const taskRoutes = require("./routes/taskRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const organizationRoutes = require("./routes/organizationRoutes") // Add this
const overviewRoutes = require("./routes/overviewRoutes")
const mailRoutes = require("./routes/mailRoutes")
const employeeRoutes = require("./routes/employeeRoutes")
const uploadRoutes = require("./routes/uploadRoutes") // Update this
const taskResponseRoutes = require("./routes/taskResponseRoutes") // Update this

// Performance Management System Routes
const performanceScoreRoutes = require("./routes/performanceScoreRoutes")
const kraRoutes = require("./routes/kraRoutes")
const kpiRoutes = require("./routes/kpiRoutes")
const taskPerformanceRoutes = require("./routes/taskPerformanceRoutes")
const performanceReviewRoutes = require("./routes/performanceReviewRoutes")
const companyGrowthRoutes = require("./routes/companyGrowthRoutes")
const salaryIncrementRoutes = require("./routes/salaryIncrementRoutes")
const incentiveRoutes = require("./routes/incentiveRoutes")
const performanceOverviewRoutes = require("./routes/performanceOverviewRoutes")

const app = express()
const PORT = process.env.PORT || 5000

connectDB()
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(
  cors({
    // origin: process.env.FRONTEND_URL || "http://localhost:3000",
    origin: true,
    credentials: true,
  }),
)

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes) // Reverted back to "/api/user"
app.use("/api/admin", adminRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/organizations", organizationRoutes) 
app.use("/api/overview", overviewRoutes)
app.use("/api/mail/", mailRoutes)
app.use("/api/reports", require("./routes/reportRoutes"))
app.use("/api/employees", employeeRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/files", require("./routes/fileRoutes"))
app.use("/api/task-responses", taskResponseRoutes);
app.use("/api/attendance", require("./routes/attendanceRoutes"))
app.use("/api/recruitment", require("./routes/recruitmentRoutes"))
app.use("/api/payroll", require("./routes/payrollRoutes")) // Add payroll routes

// Performance Management System Routes
app.use("/api/performance-scores", performanceScoreRoutes)
app.use("/api/kra", kraRoutes)
app.use("/api/kpi", kpiRoutes)
app.use("/api/task-performance", taskPerformanceRoutes)
app.use("/api/performance-reviews", performanceReviewRoutes)
app.use("/api/company-growth", companyGrowthRoutes)
app.use("/api/salary-increments", salaryIncrementRoutes)
app.use("/api/incentives", incentiveRoutes)
app.use("/api/performance-overview", performanceOverviewRoutes)

app.use(
  "/api/:orgName/org-members",
  (req, res, next) => {
    req.orgName = req.params.orgName
    next()
  },
  require("./routes/orgMemberRoutes"),
)

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// Graceful Shutdown
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  process.exit(1)
})
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err)
  process.exit(1)
})

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🩺 Health Check: https://shrm-backend.onrender.com/api/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
