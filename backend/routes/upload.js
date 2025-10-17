const express = require("express")
const { upload, uploadSingle, uploadMultiple, deleteFile } = require("../controllers/uploadController")

const router = express.Router()

// Single file upload
router.post("/single", upload.single("file"), uploadSingle)

// Multiple files upload
router.post("/multiple", upload.array("files", 10), uploadMultiple)

// Delete file
router.delete("/", deleteFile)

module.exports = router
