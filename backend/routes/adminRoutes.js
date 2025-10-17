const express = require("express")
const { getAllUsers } = require("../controllers/adminController")
const { authenticateToken, restrictTo } = require("../middleware/auth")

const router = express.Router()

router.use(authenticateToken)
router.get("/users", restrictTo("admin"), getAllUsers)

module.exports = router
