const cloudinary = require("../config/cloudinary")
const multer = require("multer")

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new Error("Only images and PDF files are allowed"), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Single file upload
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "shrm_uploads",
          resource_type: "auto", // Automatically detect file type
          quality: "auto:good", // Optimize quality
          fetch_format: "auto", // Optimize format
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        },
      )
      uploadStream.end(req.file.buffer)
    })

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    })
  }
}

// Multiple files upload
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "shrm_uploads",
            resource_type: "auto",
            quality: "auto:good",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve({
                originalName: file.originalname,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
              })
            }
          },
        )
        uploadStream.end(file.buffer)
      })
    })

    const results = await Promise.all(uploadPromises)

    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: results,
    })
  } catch (error) {
    console.error("Multiple upload error:", error)
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    })
  }
}

// Delete file from Cloudinary
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      })
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "File deleted successfully",
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete file",
      })
    }
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    })
  }
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
}
