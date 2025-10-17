const { FullAndFinal, PayrollAdjustment, LeaveAttendanceDeduction } = require('../models/payrollAdjustmentModel');
const User = require('../models/userModel');

// Full and Final Settlement Controllers
const getFullAndFinalRecords = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { status } = req.query;

    let filter = { organizationId };
    if (status) filter.status = status;

    const records = await FullAndFinal.find(filter)
      .populate('processedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Manually populate employee data
    const populatedRecords = await Promise.all(
      records.map(async (record) => {
        const employee = await User.findOne({ id: record.employeeId });
        return {
          ...record.toObject(),
          employee: employee ? {
            name: employee.name,
            email: employee.email,
            designation: employee.designation,
            departmentName: employee.departmentNameName
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedRecords
    });
  } catch (error) {
    console.error('Error fetching full and final records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch full and final records',
      details: error.message
    });
  }
};

const createFullAndFinalRecord = async (req, res) => {
  try {
    const { organizationId, _id: userId } = req.user;
    const recordData = { 
      ...req.body, 
      organizationId,
      processedBy: userId
    };

    const record = new FullAndFinal(recordData);
    await record.save();

    // Get employee data separately
    const employee = await User.findOne({ id: record.employeeId });
    const recordWithEmployee = {
      ...record.toObject(),
      employee: employee ? {
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        departmentName: employee.departmentName
      } : null
    };

    res.status(201).json({
      success: true,
      data: recordWithEmployee
    });
  } catch (error) {
    console.error('Error creating full and final record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create full and final record',
      details: error.message
    });
  }
};

const updateFullAndFinalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { organizationId, _id: userId } = req.user;

    const updateData = { status, remarks };
    
    if (status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (status === 'processing') {
      updateData.processedAt = new Date();
    } else if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const record = await FullAndFinal.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true, runValidators: true }
    ).populate('processedBy', 'name email')
     .populate('approvedBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Full and final record not found'
      });
    }

    // Get employee data separately
    const employee = await User.findOne({ id: record.employeeId });
    const recordWithEmployee = {
      ...record.toObject(),
      employee: employee ? {
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        departmentName: employee.departmentName
      } : null
    };

    res.status(200).json({
      success: true,
      record: recordWithEmployee
    });
  } catch (error) {
    console.error('Error updating full and final status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update full and final status',
      details: error.message
    });
  }
};

// Payroll Adjustments Controllers
const getPayrollAdjustments = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { type, status, periodId } = req.query;

    let filter = { organizationId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (periodId) filter.payrollPeriodId = periodId;

    const adjustments = await PayrollAdjustment.find(filter)
      .populate('payrollPeriodId', 'label range')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Manually populate employee data
    const populatedAdjustments = await Promise.all(
      adjustments.map(async (adjustment) => {
        const employee = await User.findOne({ id: adjustment.employeeId });
        return {
          ...adjustment.toObject(),
          employee: employee ? {
            name: employee.name,
            email: employee.email,
            designation: employee.designation,
            departmentName: employee.departmentName
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedAdjustments
    });
  } catch (error) {
    console.error('Error fetching payroll adjustments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll adjustments',
      details: error.message
    });
  }
};

const createPayrollAdjustment = async (req, res) => {
  try {
    const { organizationId, _id: userId } = req.user;
    const adjustmentData = { 
      ...req.body, 
      organizationId,
      createdBy: userId
    };

    const adjustment = new PayrollAdjustment(adjustmentData);
    await adjustment.save();

    // Get employee data separately
    const employee = await User.findOne({ id: adjustment.employeeId });
    
    await adjustment.populate([
      { path: 'payrollPeriodId', select: 'label range' },
      { path: 'createdBy', select: 'name email' }
    ]);

    const adjustmentWithEmployee = {
      ...adjustment.toObject(),
      employee: employee ? {
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        departmentName: employee.departmentName
      } : null
    };

    res.status(201).json({
      success: true,
      data: adjustmentWithEmployee
    });
  } catch (error) {
    console.error('Error creating payroll adjustment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payroll adjustment',
      details: error.message
    });
  }
};

const updatePayrollAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, _id: userId } = req.user;

    const updateData = { ...req.body };
    
    if (req.body.status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (req.body.status === 'processed') {
      updateData.processedAt = new Date();
    }

    const adjustment = await PayrollAdjustment.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'payrollPeriodId', select: 'label range' },
      { path: 'createdBy', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        error: 'Payroll adjustment not found'
      });
    }

    // Get employee data separately
    const employee = await User.findOne({ id: adjustment.employeeId });
    const adjustmentWithEmployee = {
      ...adjustment.toObject(),
      employee: employee ? {
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        departmentName: employee.departmentName
      } : null
    };

    res.status(200).json({
      success: true,
      data: adjustmentWithEmployee
    });
  } catch (error) {
    console.error('Error updating payroll adjustment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payroll adjustment',
      details: error.message
    });
  }
};

// Leave and Attendance Deductions Controllers
const getLeaveAttendanceDeductions = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { periodId } = req.query;

    let filter = { organizationId };
    if (periodId) filter.payrollPeriodId = periodId;

    const deductions = await LeaveAttendanceDeduction.find(filter)
      .populate('payrollPeriodId', 'label range')
      .sort({ createdAt: -1 });

    // Manually populate employee data
    const populatedDeductions = await Promise.all(
      deductions.map(async (deduction) => {
        const employee = await User.findOne({ id: deduction.employeeId });
        return {
          ...deduction.toObject(),
          employee: employee ? {
            name: employee.name,
            email: employee.email,
            designation: employee.designation,
            departmentName: employee.departmentName
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedDeductions
    });
  } catch (error) {
    console.error('Error fetching leave attendance deductions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave attendance deductions',
      details: error.message
    });
  }
};

const calculateLeaveAttendanceDeductions = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { employeeId, payrollPeriodId, attendanceData } = req.body;

    // Get employee details
    const employee = await User.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const deductionData = {
      employeeId,
      payrollPeriodId,
      organizationId,
      ...attendanceData, // workingDays, presentDays, absentDays, etc.
      basicSalary: employee.basicSalary || 0
    };

    const deduction = new LeaveAttendanceDeduction(deductionData);
    await deduction.save();

    // Get employee data separately and populate payroll period
    const employeeData = await User.findOne({ id: deduction.employeeId });
    await deduction.populate([
      { path: 'payrollPeriodId', select: 'label range' }
    ]);

    const deductionWithEmployee = {
      ...deduction.toObject(),
      employee: employeeData ? {
        name: employeeData.name,
        email: employeeData.email,
        designation: employeeData.designation,
        departmentName: employeeData.departmentName
      } : null
    };

    res.status(201).json({
      success: true,
      data: deductionWithEmployee
    });
  } catch (error) {
    console.error('Error calculating leave attendance deductions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate leave attendance deductions',
      details: error.message
    });
  }
};

module.exports = {
  getFullAndFinalRecords,
  createFullAndFinalRecord,
  updateFullAndFinalStatus,
  getPayrollAdjustments,
  createPayrollAdjustment,
  updatePayrollAdjustment,
  getLeaveAttendanceDeductions,
  calculateLeaveAttendanceDeductions
};
