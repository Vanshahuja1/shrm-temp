const mongoose = require("mongoose")

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },

    head: {
      type: String,
      required: [true, "Department head is required"],
      trim: true,
      maxlength: [100, "Department head name cannot exceed 100 characters"],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    managers: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],

    employees: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],

    interns: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],

    members: {
      type: Array,
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Indexes for better query performance
departmentSchema.index({ name: 1, organizationId: 1 })
departmentSchema.index({ organizationId: 1 })
departmentSchema.index({ isActive: 1 })

// Instance method to get department summary
departmentSchema.methods.getSummary = function () {
  return {
    id: this._id,
    departmentName: this.name,
    organizationId: this.organizationId,
    head: this.head,
    budget: this.budget,
    breakdown: {
      employees: Array.isArray(this.employees) ? this.employees.length : 0,
      managers: Array.isArray(this.managers) ? this.managers.length : 0,
      interns: Array.isArray(this.interns) ? this.interns.length : 0,
      total:
        (Array.isArray(this.employees) ? this.employees.length : 0) +
        (Array.isArray(this.managers) ? this.managers.length : 0) +
        (Array.isArray(this.interns) ? this.interns.length : 0),
    },
    isActive: this.isActive,
  }
}

// Static method to find departments by organization
departmentSchema.statics.findByOrganization = function (organizationId) {
  const objectId = new mongoose.Types.ObjectId(organizationId);
  return this.find({ organizationId:objectId }).sort({ name: 1 })
}

// Static method to find active departments
departmentSchema.statics.findActive = function () {
  
  return this.find({ isActive: true }).populate("organizationId", "name").sort({ name: 1 })
}

const Department = mongoose.model("Department", departmentSchema)

module.exports = Department
