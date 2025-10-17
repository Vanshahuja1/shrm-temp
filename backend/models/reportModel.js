const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    performance: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      projectsCompleted: {
        type: Number,
        default: 0,
      },
      targetsAchieved: {
        type: Number,
        default: 0,
      },
      performanceMeasure: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      consistencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      engagementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    workStats: {
      daysWorked: {
        type: Number,
        default: 0,
      },
      totalTasksCompleted: {
        type: Number,
        default: 0,
      },
      coursesCompleted: {
        type: Number,
        default: 0,
      },
      certificationsEarned: {
        type: Number,
        default: 0,
      },
      trainingsAttended: {
        type: Number,
        default: 0,
      },
      avgDailyWorkingHours: {
        type: Number,
        min: 0,
        max: 24,
        default: 0,
      },
      overtimeHoursMonthly: {
        type: Number,
        default: 0,
      },
      avgBreakTimePerDay: {
        type: String,
        default: "00:00",
      },
    },
    growthAndHR: {
      joiningDate: {
        type: Date,
        required: true,
      },
      probationStatus: {
        type: Boolean,
        default: true,
      },
      lastPromotionDate: {
        type: Date,
      },
      nextAppraisalDue: {
        type: Date,
      },
      appraisalsReceived: {
        type: Number,
        default: 0,
      },
      skillLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        default: "Beginner",
      },
    },
    wellbeing: {
      age: {
        type: Number,
        min: 0,
      },
      lastMedicalCheckup: {
        type: Date,
      },
      sickLeavesTaken: {
        type: Number,
        default: 0,
      },
      wellnessProgramParticipation: {
        type: Boolean,
        default: false,
      },
      lastFeedbackSurveyScore: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      workLifeBalanceScore: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
    },
    finance: {
      currentSalary: {
        type: String,
        required: true,
      },
      bonusReceivedThisYear: {
        type: String,
        default: "0",
      },
      referralBonusesEarned: {
        type: String,
        default: "0",
      },
    },
    recentActivities: [
      {
        type: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
reportSchema.index({ id: 1 });
reportSchema.index({ departmentName: 1 });
reportSchema.index({ "performance.rating": -1 });
reportSchema.index({ "workStats.daysWorked": -1 });
reportSchema.index({ createdAt: -1 });

// Virtual to get employee details from User model
reportSchema.virtual("employeeDetails", {
  ref: "User",
  localField: "id",
  foreignField: "id",
  justOne: true,
  options: {
    select: 'id name email phone gender role designation dateOfBirth address joiningDate currentProjects pastProjects documents attendance workLog upperManager salary adharCard panCard experience projects organizationName departmentName '
  }
});

// Static method to create or update report
reportSchema.statics.createOrUpdateReport = async function (employeeId, reportData) {
  return this.findOneAndUpdate(
    { employeeId },
    { ...reportData },
    { new: true, upsert: true, runValidators: true }
  );
};

// Static method to get report with employee details
reportSchema.statics.getDetailedReport = async function (employeeId) {
  return this.findOne({ id: employeeId });
};

// Static method to get reports by department
reportSchema.statics.getReportsByDepartment = async function (department) {
  return this.find({ departmentName: department }).populate("employeeDetails");
};

// Pre-save middleware to ensure required employee exists
reportSchema.pre("save", async function (next) {
  const User = mongoose.model("User");
  const employee = await User.findOne({ id: this.id });
  if (!employee) {
    throw new Error("Employee not found with the given ID");
  }
  next();
});

module.exports = mongoose.model("Report", reportSchema);
