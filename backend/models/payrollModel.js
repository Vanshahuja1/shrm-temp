const mongoose = require('mongoose');

// Basic Employee Payroll Record Schema
const employeePayrollSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  payrollPeriod: {
    label: String, // e.g., "Apr 2020"
    range: String, // e.g., "MAR 26 - APR 25"
    startDate: Date,
    endDate: Date
  },
  payableDays: {
    type: String,
    required: true
  },
  earnings: {
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },
    attendanceDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 }
  },
  totalEarnings: {
    type: Number,
    required: true,
    default: 0
  },
  totalDeductions: {
    type: Number,
    required: true,
    default: 0
  },
  netPay: {
    type: Number,
    required: true,
    default: 0
  },
  departmentName: String,
  designation: String,
  dateOfJoining: Date,
  status: {
    type: String,
    enum: ['draft', 'in_process', 'pending', 'paid'],
    default: 'draft'
  },
  processedAt: Date,
  approvedAt: Date,
  paidAt: Date,
  remarks: String,
  
  // Attendance-based calculations
  attendanceData: {
    totalWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    lateComings: { type: Number, default: 0 }
  },
  
  // HR edit tracking
  editHistory: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    editedBy: { type: String, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
  }],
  
  // Approval workflow
  approvalWorkflow: {
    submittedBy: { type: String, ref: 'User' },
    submittedAt: Date,
    approvedBy: { type: String, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: String, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String
  }
}, {
  timestamps: true
});

// Calculate totals before saving
employeePayrollSchema.pre('save', function(next) {
  // Calculate total earnings
  this.totalEarnings = Object.values(this.earnings).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate net pay
  this.netPay = this.totalEarnings - this.totalDeductions;
  
  next();
});

// Payroll Period Schema
const payrollPeriodSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  range: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'current', 'completed'],
    default: 'upcoming'
  },
  active: {
    type: Boolean,
    default: false
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, {
  timestamps: true
});

// Employee Joinees/Exits Schema
const employeeJoineesExitsSchema = new mongoose.Schema({
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
  designation: String,
  joiningDate: Date,
  exitDate: Date,
  status: {
    type: String,
    enum: ['joined', 'exited'],
    required: true
  },
  payrollPeriodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollPeriod',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  finalized: {
    type: Boolean,
    default: false
  },
  finalizedAt: Date,
  remarks: String
}, {
  timestamps: true
});

module.exports = {
  EmployeePayroll: mongoose.model('EmployeePayroll', employeePayrollSchema),
  PayrollPeriod: mongoose.model('PayrollPeriod', payrollPeriodSchema),
  EmployeeJoineesExits: mongoose.model('EmployeeJoineesExits', employeeJoineesExitsSchema)
};
