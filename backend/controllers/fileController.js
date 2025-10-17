const User = require("../models/userModel")

// Get all files for a specific user
const getUserFiles = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findOne({ id: userId }).select("photo documents name id")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Organize files by category
    const userFiles = {
      userId: user.id,
      userName: user.name,
      profilePhoto: user.photo || null,
      documents: {
        identity: {
          aadharFront: user.documents.aadharFront || null,
          aadharBack: user.documents.aadharBack || null,
          panCard: user.documents.panCard || null,
        },
        professional: {
          resume: user.documents.resume || null,
          experienceLetter: user.documents.experienceLetter || null,
        },
        educational: {
          tenthMarksheet: user.documents.tenthMarksheet || null,
          twelfthMarksheet: user.documents.twelfthMarksheet || null,
          degreeMarksheet: user.documents.degreeMarksheet || null,
        },
        financial: {
          passbookPhoto: user.documents.passbookPhoto || null,
        },
        policy: {
          policy: user.documents.policy || null,
        },
      },
    }

    // Filter out null values and add metadata
    const processedFiles = {}

    if (userFiles.profilePhoto) {
      processedFiles.profilePhoto = {
        url: userFiles.profilePhoto,
        type: "image",
        category: "profile",
      }
    }

    Object.keys(userFiles.documents).forEach((category) => {
      Object.keys(userFiles.documents[category]).forEach((docType) => {
        const url = userFiles.documents[category][docType]
        if (url) {
          if (!processedFiles.documents) processedFiles.documents = {}
          if (!processedFiles.documents[category]) processedFiles.documents[category] = {}

          processedFiles.documents[category][docType] = {
            url: url,
            type: url.includes(".pdf") ? "pdf" : "image",
            category: category,
            documentType: docType,
          }
        }
      })
    })

    res.json({
      success: true,
      data: {
        userId: user.id,
        userName: user.name,
        files: processedFiles,
      },
    })
  } catch (error) {
    console.error("Get user files error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user files",
      error: error.message,
    })
  }
}

// Get specific document
const getSpecificDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.params

    const user = await User.findOne({ id: userId })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    let documentUrl = null

    // Check if it's profile photo
    if (documentType === "photo") {
      documentUrl = user.photo
    } else {
      // Check in documents object
      documentUrl = user.documents[documentType]
    }

    if (!documentUrl) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        documentType: documentType,
        url: documentUrl,
        type: documentUrl.includes(".pdf") ? "pdf" : "image",
      },
    })
  } catch (error) {
    console.error("Get specific document error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    })
  }
}

// Get all users with their file counts
const getAllUsersWithFiles = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select("id name photo documents organizationName departmentName")
      .populate("organizationId", "name")
      .populate("departmentId", "name")

    const usersWithFileInfo = users.map((user) => {
      // Count uploaded documents
      const documentCount = Object.values(user.documents).filter((url) => url && url.trim() !== "").length
      const hasProfilePhoto = user.photo && user.photo.trim() !== ""

      return {
        userId: user.id,
        name: user.name,
        organization: user.organizationId?.name || user.organizationName,
        department: user.departmentId?.name || user.departmentName,
        fileStats: {
          profilePhoto: hasProfilePhoto,
          documentsUploaded: documentCount,
          totalDocuments: 10, // Total expected documents
          completionPercentage: Math.round((documentCount / 10) * 100),
        },
      }
    })

    res.json({
      success: true,
      data: usersWithFileInfo,
      count: usersWithFileInfo.length,
    })
  } catch (error) {
    console.error("Get all users with files error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users with file information",
      error: error.message,
    })
  }
}

module.exports = {
  getUserFiles,
  getSpecificDocument,
  getAllUsersWithFiles,
}
