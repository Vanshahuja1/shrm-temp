const mongoose = require('mongoose');

// Full and Final Settlement Schema
const fullAndFinalSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  departmentName: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  exitDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'paid'],
    default: 'pending'
  },
  settlements: {
    salary: { type: Number, default: 0 },
    gratuity: { type: Number, default: 0 },
    leaveEncashment: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    noticePeriodRecovery: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'received', 'verified'],
      default: 'pending'
    },
    uploadedAt: Date,
    verifiedAt: Date,
    filePath: String
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: String,
  approvedAt: Date,
  processedAt: Date,
  paidAt: Date
}, {
  timestamps: true
});

// Calculate total settlement before saving
fullAndFinalSchema.pre('save', function(next) {
  const { salary, gratuity, leaveEncashment, bonus, otherAllowances, deductions, noticePeriodRecovery } = this.settlements;
  
  this.settlements.total = (salary || 0) + (gratuity || 0) + (leaveEncashment || 0) + 
                          (bonus || 0) + (otherAllowances || 0) - (deductions || 0) - (noticePeriodRecovery || 0);
  
  next();
});

// Payroll Adjustments Schema (for bonuses, revisions, adhoc expenses, etc.)
const payrollAdjustmentSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  payrollPeriodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollPeriod',
    required: true
  },
  type: {
    type: String,
    enum: ['bonus', 'salary_revision', 'adhoc_earning', 'adhoc_deduction', 'arrears', 'dues'],
    required: true
  },
  category: {
    type: String,
    required: true // e.g., 'Performance Bonus', 'Travel Allowance', 'Laptop Recovery', etc.
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  effectiveFrom: Date,
  effectiveTo: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringMonths: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'processed'],
    default: 'pending'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  processedAt: Date,
  remarks: String
}, {
  timestamps: true
});

// Leave and Attendance Deductions Schema
const leaveAttendanceDeductionSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  payrollPeriodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollPeriod',
    required: true
  },
  workingDays: {
    type: Number,
    required: true
  },
  presentDays: {
    type: Number,
    required: true
  },
  absentDays: {
    type: Number,
    required: true
  },
  leavesTaken: {
    type: Number,
    default: 0
  },
  leavesWithoutPay: {
    type: Number,
    default: 0
  },
  payableDays: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  perDayAmount: {
    type: Number,
    required: true
  },
  leaveDeduction: {
    type: Number,
    default: 0
  },
  attendanceDeduction: {
    type: Number,
    default: 0
  },
  totalDeduction: {
    type: Number,
    default: 0
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate deductions before saving
leaveAttendanceDeductionSchema.pre('save', function(next) {
  this.payableDays = this.workingDays - this.absentDays - this.leavesWithoutPay;
  this.perDayAmount = this.basicSalary / this.workingDays;
  this.leaveDeduction = this.leavesWithoutPay * this.perDayAmount;
  this.attendanceDeduction = this.absentDays * this.perDayAmount;
  this.totalDeduction = this.leaveDeduction + this.attendanceDeduction;
  
  next();
});

module.exports = {
  FullAndFinal: mongoose.model('FullAndFinal', fullAndFinalSchema),
  PayrollAdjustment: mongoose.model('PayrollAdjustment', payrollAdjustmentSchema),
  LeaveAttendanceDeduction: mongoose.model('LeaveAttendanceDeduction', leaveAttendanceDeductionSchema)
};
