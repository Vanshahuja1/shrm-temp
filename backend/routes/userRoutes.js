const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getById,
  addEmp,
  updateEmp,
  deleteEmp,
  getNameById,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllUsers);
router.post("/addEmp", addEmp);
router.get("/:id", getById);
router.put("/:id", updateEmp);
router.delete("/:id", deleteEmp);
router.get("/name/:empId" , getNameById);
router.use(authenticateToken);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

module.exports = router;
