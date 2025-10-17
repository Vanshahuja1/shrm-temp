const express = require("express")
const { getUserFiles, getSpecificDocument, getAllUsersWithFiles } = require("../controllers/fileController")

const router = express.Router()

// Get all files for a specific user
router.get("/user/:userId", getUserFiles)

// Get specific document for a user
router.get("/user/:userId/document/:documentType", getSpecificDocument)

// Get all users with their file upload status
router.get("/users/status", getAllUsersWithFiles)

module.exports = router
