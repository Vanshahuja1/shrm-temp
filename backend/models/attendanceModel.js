const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "User",
    },
    date: {
      type: String,
      required: true,
      // Format: YYYY-MM-DD
    },
    punchIn: {
      type: Date,
      default: null,
    },
    punchOut: {
      type: Date,
      default: null,
    },
    breaks: [
      {
        type: {
          type: String,
          enum: ["break1", "break2", "lunch"],
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          default: null,
        },
        duration: {
          type: Number, // in minutes
          default: 0,
        },
      },
    ],
    totalHours: {
      type: Number,
      default: 0,
    },
    breakTime: {
      type: Number, // in minutes
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "holiday"],
      default: "absent",
    },
    isActive: {
      type: Boolean,
      default: false, // true when punched in
    },
  },
  {
    timestamps: true,
  },
)


// Pre-save hook to calculate totalHours
attendanceSchema.pre('save', function(next) {
  if (this.punchIn) {
    const endTime = this.punchOut || new Date();
    const workingMilliseconds = endTime - this.punchIn;
    const workingHours = workingMilliseconds / (1000 * 60 * 60);
    
    this.totalHours = Math.max(0, parseFloat(workingHours.toFixed(2)));
  }
  next(); 
});

// Compound index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })
attendanceSchema.index({ date: 1 })

// Calculate total hours when punch out
attendanceSchema.methods.calculateHours = function () {
  if (this.punchIn && this.punchOut) {
    const totalMs = this.punchOut.getTime() - this.punchIn.getTime()
    const totalHours = totalMs / (1000 * 60 * 60)

    // Subtract break time
    const breakHours = this.breakTime / 60
    this.totalHours = Math.max(0, totalHours - breakHours)

    // Calculate overtime (assuming 8 hours is standard)
    this.overtimeHours = Math.max(0, this.totalHours - 8)

    // Determine status
    if (this.totalHours >= 8) {
      this.status = "present"
    } else if (this.totalHours > 0) {
      // Check if late (punched in after 9:30 AM)
      const punchInHour = this.punchIn.getHours()
      const punchInMinute = this.punchIn.getMinutes()
      if (punchInHour > 9 || (punchInHour === 9 && punchInMinute > 30)) {
        this.status = "late"
      } else {
        this.status = "present"
      }
    }
  }
}

module.exports = mongoose.model("Attendance", attendanceSchema)
