const mongoose = require("mongoose")

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
      default: "",
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Statistics
    totalEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDepartments: {
      type: Number,
      default: 0,
      min: 0,
    },
    url: {
      type: String,
      trim: true,
      default: "",
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
)

// Index for better query performance
organizationSchema.index({ name: 1 })
organizationSchema.index({ isActive: 1 })

// Instance method to get organization summary
organizationSchema.methods.getSummary = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    totalEmployees: this.totalEmployees,
    totalDepartments: this.totalDepartments,
    isActive: this.isActive,
  }
}

// Static method to find active organizations
organizationSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 })
}

const Organization = mongoose.model("Organization", organizationSchema)

module.exports = Organization
