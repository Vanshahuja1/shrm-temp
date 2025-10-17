const express = require('express');
const router = express.Router();

// Import controllers
const {
  getEmployeePayrollRecords,
  createEmployeePayroll,
  updateEmployeePayroll,
  generatePayslip,
  getPayrollPeriods,
  createPayrollPeriod,
  setActivePayrollPeriod,
  getJoineesExits,
  finalizeJoineesExits,
  processPayroll,
  // New HR management functions
  generateAttendanceBasedPayslip,
  editPayslip,
  updatePayslipStatus,
  bulkUpdatePayslipStatus,
  getPayslipEditHistory,
  getPayslipsByStatus,
  deletePayslip
} = require('../controllers/payrollController');

const {
  getFullAndFinalRecords,
  createFullAndFinalRecord,
  updateFullAndFinalStatus,
  getPayrollAdjustments,
  createPayrollAdjustment,
  updatePayrollAdjustment,
  getLeaveAttendanceDeductions,
  calculateLeaveAttendanceDeductions
} = require('../controllers/payrollAdjustmentController');

// Employee Payroll Routes
router.get('/employees',  getEmployeePayrollRecords);
router.post('/employees',  createEmployeePayroll);
router.put('/employees/:id',  updateEmployeePayroll);
router.post('/generate-payslip', generatePayslip);

// New HR Payslip Management Routes
router.post('/generate-attendance-payslip', generateAttendanceBasedPayslip);
router.put('/edit/:id', editPayslip);
router.put('/status/:id', updatePayslipStatus);
router.put('/bulk-status', bulkUpdatePayslipStatus);
router.get('/history/:id', getPayslipEditHistory);
router.get('/by-status', getPayslipsByStatus);
router.delete('/delete/:id', deletePayslip);

// Payroll Period Routes
router.get('/periods', getPayrollPeriods);
router.post('/periods', createPayrollPeriod);
router.put('/periods/:id/activate', setActivePayrollPeriod);

// Joinees & Exits Routes
router.get('/joinees-exits', getJoineesExits);
router.post('/finalize-joinee-exit', finalizeJoineesExits);

// Payroll Processing Routes
router.post('/process', processPayroll);

// Full and Final Settlement Routes
router.get('/full-and-final', getFullAndFinalRecords);
router.post('/full-and-final', createFullAndFinalRecord);
router.put('/full-and-final/:id/status', updateFullAndFinalStatus);

// Payroll Adjustments Routes (Bonuses, Revisions, Adhoc, Arrears, etc.)
router.get('/adjustments', getPayrollAdjustments);
router.post('/adjustments', createPayrollAdjustment);
router.put('/adjustments/:id', updatePayrollAdjustment);

// Leave and Attendance Deductions Routes
router.get('/leave-deductions', getLeaveAttendanceDeductions);
router.post('/leave-deductions/calculate', calculateLeaveAttendanceDeductions);

// Specific Module Routes (as per PayrollSchema.md)

// 1. Leave & Attendance Deductions
router.get('/modules/leave-deductions', (req, res) => {
  // This would render or return data for the leave deductions module
  res.json({ 
    module: 'Leave & Attendance Deductions',
    path: '/hr/payroll/leave-deductions'
  });
});

// 2. New Joinees & Exits
router.get('/modules/joinees-exit', (req, res) => {
  res.json({ 
    module: 'New Joinees & Exits',
    path: '/hr/payroll/joinees-exit'
  });
});

// 3. Bonuses & Salary Revisions
router.get('/modules/bonuses-revisions', (req, res) => {
  res.json({ 
    module: 'Bonuses & Salary Revisions',
    path: '/hr/payroll/bonuses-revisions'
  });
});

// 4. Adhoc Expenses & Deductions
router.get('/modules/adhoc-expenses', (req, res) => {
  res.json({ 
    module: 'Adhoc Expenses & Deductions',
    path: '/hr/payroll/adhoc-expenses'
  });
});

// 5. Arrears & Dues
router.get('/modules/arrears-dues', (req, res) => {
  res.json({ 
    module: 'Arrears & Dues',
    path: '/hr/payroll/arrears-dues'
  });
});

// 6. Review All Employees
router.get('/modules/review-all-employees', (req, res) => {
  res.json({ 
    module: 'Review All Employees',
    path: '/hr/payroll/review-all-employees'
  });
});

// Bulk operations
router.post('/bulk/process-adjustments', async (req, res) => {
  try {
    const { adjustmentIds, action } = req.body;
    const { organizationId } = req.user;

    let updateData = {};
    if (action === 'approve') {
      updateData = { 
        status: 'approved', 
        approvedBy: req.user._id, 
        approvedAt: new Date() 
      };
    } else if (action === 'process') {
      updateData = { 
        status: 'processed', 
        processedAt: new Date() 
      };
    }

    const result = await PayrollAdjustment.updateMany(
      { 
        _id: { $in: adjustmentIds },
        organizationId 
      },
      updateData
    );

    res.json({
      success: true,
      message: `${action} completed for ${result.modifiedCount} adjustments`,
      processedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to ${action} adjustments`,
      details: error.message
    });
  }
});

// Analytics and Reports
router.get('/analytics/summary', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { periodId } = req.query;

    // This would contain analytics logic
    const summary = {
      totalEmployees: 0,
      totalPayroll: 0,
      totalDeductions: 0,
      netPayroll: 0,
      pendingApprovals: 0,
      processedPayrolls: 0
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll analytics',
      details: error.message
    });
  }
});

module.exports = router;
