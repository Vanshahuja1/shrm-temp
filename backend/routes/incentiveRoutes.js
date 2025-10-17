const express = require("express")
const router = express.Router()
const {
  // PLI controllers
  getAllPLI,
  getPLIByEmployee,
  calculatePLI,
  approvePLI,
  deletePLI,
  
  // VLI controllers
  getAllVLI,
  getVLIByEmployee,
  calculateVLI,
  approveVLI,
  deleteVLI,
  
  // Combined analytics
  getIncentiveAnalytics
} = require("../controllers/incentiveController")

// Combined analytics route
router.get("/analytics", getIncentiveAnalytics)

// PLI routes
router.get("/pli", getAllPLI)
router.get("/pli/employee/:employeeId", getPLIByEmployee)
router.post("/pli/calculate", calculatePLI)
router.post("/pli/:id/approve", approvePLI)
router.delete("/pli/:id", deletePLI)

// VLI routes
router.get("/vli", getAllVLI)
router.get("/vli/employee/:employeeId", getVLIByEmployee)
router.post("/vli/calculate", calculateVLI)
router.post("/vli/:id/approve", approveVLI)
router.delete("/vli/:id", deleteVLI)

module.exports = router
