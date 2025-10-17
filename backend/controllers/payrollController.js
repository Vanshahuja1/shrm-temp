const { EmployeePayroll, PayrollPeriod, EmployeeJoineesExits } = require('../models/payrollModel');
const { FullAndFinal, PayrollAdjustment, LeaveAttendanceDeduction } = require('../models/payrollAdjustmentModel');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const payrollCalculationService = require('../services/payrollCalculationService');

// Employee Payroll Controllers
const getEmployeePayrollRecords = async (req, res) => {
  try {
    // Get organizationId from query params instead of middleware
    const { organizationId, periodId, status, departmentName } = req.query;

    let filter = {};
    
    // Only add organizationId to filter if provided
    if (organizationId && organizationId !== 'default-org') {
      filter.organizationId = organizationId;
    }
    
    if (periodId) filter['payrollPeriod._id'] = periodId;
    if (status) filter.status = status;
    if (departmentName) filter.departmentName = departmentName;

    let payrollRecords = await EmployeePayroll.find(filter)
      .sort({ createdAt: -1 });

    // If no records exist, create some sample data
    if (payrollRecords.length === 0) {
      console.log('No payroll records found, creating sample data...');
      
      // Get some users from the database
      const users = await User.find({}).limit(5);
      
      if (users.length > 0) {
        const samplePayrollRecords = users.map((user, index) => ({
          employeeId: user.id,
          name: user.name,
          payrollPeriod: {
            label: "Aug 2025",
            range: "JUL 26 - AUG 25",
            startDate: new Date(2025, 6, 26),
            endDate: new Date(2025, 7, 25)
          },
          payableDays: `${24 + index}/26`,
          earnings: {
            basicSalary: 50000 + (index * 10000),
            hra: 15000 + (index * 3000),
            conveyanceAllowance: 2000,
            medicalAllowance: 1500,
            specialAllowance: 5000 + (index * 1000),
            bonus: 5000,
            overtime: 2000,
            arrears: 0,
            otherEarnings: 1000
          },
          deductions: {
            pf: 6000 + (index * 1200),
            esi: 750 + (index * 150),
            professionalTax: 200,
            tds: 8000 + (index * 1600),
            loanDeduction: 0,
            leaveDeduction: 0,
            attendanceDeduction: 1000,
            otherDeductions: 500
          },
          departmentName: user.departmentName || 'Engineering',
          designation: user.designation || 'Software Engineer',
          dateOfJoining: user.createdAt || new Date(),
          status: 'draft'
        }));

        // Create the sample records
        payrollRecords = await EmployeePayroll.create(samplePayrollRecords);
        console.log(`Created ${payrollRecords.length} sample payroll records`);
      }
    }

    // Manually populate employee data if needed
    const populatedRecords = await Promise.all(
      payrollRecords.map(async (record) => {
        const employee = await User.findOne({ id: record.employeeId });
        return {
          ...record.toObject(),
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
      data: populatedRecords
    });
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll records',
      details: error.message
    });
  }
};

const createEmployeePayroll = async (req, res) => {
  try {
    const payrollData = req.body;

    const payroll = new EmployeePayroll(payrollData);
    await payroll.save();

    res.status(201).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Error creating payroll record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payroll record',
      details: error.message
    });
  }
};

const updateEmployeePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payroll = await EmployeePayroll.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        error: 'Payroll record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Error updating payroll record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payroll record',
      details: error.message
    });
  }
};

const generatePayslip = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Fetch employee details with organization information
    const employee = await User.findOne({ id: employeeId })
      .populate('organizationId', 'name address contactEmail contactPhone website logo')
      .populate('departmentId', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Look for existing payroll record
    let payroll = await EmployeePayroll.findOne({
      employeeId,
      'payrollPeriod.label': `${month} ${year}`
    });

    let payrollData;

    if (!payroll) {
      // Create sample payroll data if none exists
      payrollData = {
        _id: new Date().getTime().toString(),
        employeeId: employee.id,
        name: employee.name,
        employee: {
          name: employee.name,
          email: employee.email,
          designation: employee.designation || 'NA',
          departmentName: employee.departmentId?.name || 'General'
        },
        payrollPeriod: {
          label: `${month || 'August'} ${year || '2025'}`,
          range: `${month || 'AUG'} 01 - ${month || 'AUG'} 31`,
          startDate: new Date(year || 2025, (month === 'January' ? 0 : 7), 1),
          endDate: new Date(year || 2025, (month === 'January' ? 0 : 7), 31)
        },
        payableDays: '30',
        earnings: {
          basicSalary: employee.salary?.basic || 50000,
          hra: employee.salary?.hra || 15000,
          conveyanceAllowance: 2000,
          medicalAllowance: 1500,
          specialAllowance: 5000,
          bonus: 3000,
          overtime: 2000,
          arrears: 0,
          otherEarnings: 1000
        },
        deductions: {
          pf: 6000,
          esi: 750,
          professionalTax: 2500,
          tds: 4000,
          loanDeduction: 0,
          leaveDeduction: 0,
          attendanceDeduction: 0,
          otherDeductions: 500
        },
        totalEarnings: 79500,
        totalDeductions: 13750,
        netPay: 65750,
        departmentName: employee.departmentId?.name || 'General',
        designation: employee.designation || 'NA',
        dateOfJoining: employee.dateOfJoining || new Date(),
        status: 'processed'
      };
    } else {
      payrollData = {
        ...payroll.toObject(),
        employee: {
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          departmentName: employee.departmentId?.name
        }
      };
    }

    // Add organization information
    payrollData.organizationName = employee.organizationId?.name || 'Company Name';
    payrollData.organizationDetails = {
      name: employee.organizationId?.name || 'Company Name',
      address: employee.organizationId?.address || '',
      contactEmail: employee.organizationId?.contactEmail || '',
      contactPhone: employee.organizationId?.contactPhone || '',
      website: employee.organizationId?.website || '',
      logo: employee.organizationId?.logo || ''
    };

    res.status(200).json({
      success: true,
      data: payrollData,
      payslipUrl: `/api/payroll/payslip/${payroll?._id || 'sample'}.pdf`
    });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate payslip',
      details: error.message
    });
  }
};

// Payroll Period Controllers
const getPayrollPeriods = async (req, res) => {
  try {
    // For now, return all periods without organizationId filter
    // or create some sample periods if none exist
    let periods = await PayrollPeriod.find({})
      .sort({ startDate: -1 });

    // If no periods exist, create some sample ones
    if (periods.length === 0) {
      const samplePeriods = [
        {
          label: "Aug 2025",
          range: "JUL 26 - AUG 25",
          startDate: new Date(2025, 6, 26), // July 26, 2025
          endDate: new Date(2025, 7, 25),   // August 25, 2025
          status: "current",
          active: true
        },
        {
          label: "Jul 2025",
          range: "JUN 26 - JUL 25",
          startDate: new Date(2025, 5, 26), // June 26, 2025
          endDate: new Date(2025, 6, 25),   // July 25, 2025
          status: "completed",
          active: false
        },
        {
          label: "Sep 2025",
          range: "AUG 26 - SEP 25",
          startDate: new Date(2025, 7, 26), // August 26, 2025
          endDate: new Date(2025, 8, 25),   // September 25, 2025
          status: "upcoming",
          active: false
        }
      ];

      // Create a default organization first
      const Organization = require('../models/organizationModel');
      let defaultOrg = await Organization.findOne({ name: 'Default Organization' });
      
      if (!defaultOrg) {
        defaultOrg = new Organization({
          name: 'Default Organization',
          description: 'Default organization for testing'
        });
        await defaultOrg.save();
      }

      // Create sample periods with the default organization
      for (const periodData of samplePeriods) {
        const period = new PayrollPeriod({
          ...periodData,
          organizationId: defaultOrg._id
        });
        await period.save();
        periods.push(period);
      }
    }

    res.status(200).json({
      success: true,
      data: periods
    });
  } catch (error) {
    console.error('Error fetching payroll periods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll periods',
      details: error.message
    });
  }
};

const createPayrollPeriod = async (req, res) => {
  try {
    // Get organizationId from request body instead of middleware
    const { organizationId, ...periodData } = req.body;
    const orgId = organizationId || 'default-org';
    
    const finalPeriodData = { ...periodData, organizationId: orgId };

    const period = new PayrollPeriod(finalPeriodData);
    await period.save();

    res.status(201).json({
      success: true,
      data: period
    });
  } catch (error) {
    console.error('Error creating payroll period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payroll period',
      details: error.message
    });
  }
};

const setActivePayrollPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    // Get organizationId from request body instead of middleware
    const { organizationId } = req.body;
    const orgId = organizationId || 'default-org';

    // Deactivate all periods
    await PayrollPeriod.updateMany(
      { organizationId: orgId },
      { isActive: false }
    );

    // Activate the selected period
    const period = await PayrollPeriod.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      { isActive: true, status: 'current' },
      { new: true }
    );

    if (!period) {
      return res.status(404).json({
        success: false,
        error: 'Payroll period not found'
      });
    }

    res.status(200).json({
      success: true,
      data: period
    });
  } catch (error) {
    console.error('Error setting active payroll period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set active payroll period',
      details: error.message
    });
  }
};

// Joinees & Exits Controllers
const getJoineesExits = async (req, res) => {
  try {
    // Get organizationId from query params instead of middleware
    const { organizationId, periodId, status } = req.query;
    const orgId = organizationId || 'default-org';

    let filter = { organizationId: orgId };
    if (periodId) filter.payrollPeriodId = periodId;
    if (status) filter.status = status;

    const joineesExits = await EmployeeJoineesExits.find(filter)
      .sort({ createdAt: -1 });

    // Manually populate employee data
    const populatedJoineesExits = await Promise.all(
      joineesExits.map(async (record) => {
        const employee = await User.findOne({ id: record.employeeId });
        return {
          ...record.toObject(),
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
      data: populatedJoineesExits
    });
  } catch (error) {
    console.error('Error fetching joinees/exits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch joinees/exits',
      details: error.message
    });
  }
};

const finalizeJoineesExits = async (req, res) => {
  try {
    // Get organizationId from request body instead of middleware
    const { employees, organizationId } = req.body; // Array of employee IDs
    const orgId = organizationId || 'default-org';

    const result = await EmployeeJoineesExits.updateMany(
      { 
        employeeId: { $in: employees },
        organizationId: orgId 
      },
      { 
        finalized: true,
        finalizedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Finalized ${result.modifiedCount} employee records`,
      processedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error finalizing joinees/exits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to finalize joinees/exits',
      details: error.message
    });
  }
};

// Process Payroll
const processPayroll = async (req, res) => {
  try {
    const { periodId, employees } = req.body;

    // Get payroll period first
    const period = await PayrollPeriod.findById(periodId);
    if (!period) {
      return res.status(404).json({
        success: false,
        error: 'Payroll period not found'
      });
    }

    // If no employees provided, get all employees
    let employeeList = employees;
    if (!employeeList || employeeList.length === 0) {
      const allEmployees = await User.find({});
      employeeList = allEmployees.map(emp => emp.id);
    }

    const errors = [];
    let processedCount = 0;

    for (const employeeId of employeeList) {
      try {
        // Get employee details
        const employee = await User.findOne({ id: employeeId });
        if (!employee) {
          errors.push(`Employee ${employeeId} not found`);
          continue;
        }

        // Check if payroll already exists
        const existingPayroll = await EmployeePayroll.findOne({
          employeeId,
          'payrollPeriod.label': period.label
        });

        if (existingPayroll) {
          errors.push(`Payroll already exists for ${employee.name}`);
          continue;
        }

        // Create new payroll record with mock data
        const payrollData = {
          employeeId,
          name: employee.name,
          departmentName: employee.departmentName,
          designation: employee.designation,
          dateOfJoining: employee.joiningDate,
          payrollPeriod: {
            label: period.label,
            range: period.range,
            startDate: period.startDate,
            endDate: period.endDate
          },
          payableDays: "26/30",
          earnings: {
            basicSalary: 50000,
            hra: 10000,
            conveyanceAllowance: 2000,
            medicalAllowance: 3000,
            specialAllowance: 1000,
            overtime: 0,
            bonus: 0
          },
          deductions: {
            pf: 6000,
            esi: 500,
            tds: 2000,
            loanDeduction: 0,
            otherDeductions: 0
          },
          status: 'processed',
          processedAt: new Date()
        };

        const payroll = new EmployeePayroll(payrollData);
        await payroll.save();
        processedCount++;

      } catch (error) {
        errors.push(`Error processing ${employeeId}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      processedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${processedCount} payroll records`
    });

  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payroll',
      details: error.message
    });
  }
};

// New HR Payslip Management Functions

/**
 * Generate attendance-based payslip for an employee
 */
const generateAttendanceBasedPayslip = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, customAdjustments, allowanceConfig, attendanceConfig } = req.body;
    const hrUserId = req.user?.id || req.body.hrUserId; // Get HR user ID from auth middleware or request

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID, start date, and end date are required'
      });
    }

    // Convert dates
    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);

    // Calculate payslip using attendance and salary data
    const payslipData = await payrollCalculationService.calculatePayslip(
      employeeId, 
      periodStart, 
      periodEnd, 
      customAdjustments,
      allowanceConfig,
      attendanceConfig
    );

    // Save the payslip
    const savedPayslip = await payrollCalculationService.savePayslip(payslipData, hrUserId);

    res.status(201).json({
      success: true,
      message: 'Attendance-based payslip generated successfully',
      data: savedPayslip
    });

  } catch (error) {
    console.error('Error generating attendance-based payslip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate attendance-based payslip',
      details: error.message
    });
  }
};

/**
 * Edit payslip with HR adjustments and track changes
 */
const editPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const { editedFields, remarks } = req.body;
    const hrUserId = req.user?.id || req.body.hrUserId;

    if (!editedFields || Object.keys(editedFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to edit provided'
      });
    }

    const payslip = await EmployeePayroll.findById(id);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        error: 'Payslip not found'
      });
    }

    // Track changes for edit history
    const editHistory = [];

    // Process each edited field
    for (const [fieldPath, newValue] of Object.entries(editedFields)) {
      const oldValue = getNestedValue(payslip, fieldPath);
      
      if (oldValue !== newValue) {
        editHistory.push({
          field: fieldPath,
          oldValue,
          newValue,
          editedBy: hrUserId,
          editedAt: new Date()
        });

        // Update the field
        setNestedValue(payslip, fieldPath, newValue);
      }
    }

    // Add edit history
    payslip.editHistory.push(...editHistory);

    // Update remarks if provided
    if (remarks) {
      payslip.remarks = remarks;
    }

    // Update status if it was in draft
    if (payslip.status === 'draft') {
      payslip.status = 'in_process';
    }

    await payslip.save();

    res.status(200).json({
      success: true,
      message: 'Payslip updated successfully',
      data: payslip,
      editHistory: editHistory
    });

  } catch (error) {
    console.error('Error editing payslip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to edit payslip',
      details: error.message
    });
  }
};

/**
 * Update payslip status (draft -> in_process -> pending -> paid)
 */
const updatePayslipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const hrUserId = req.user?.id || req.body.hrUserId;

    const validStatuses = ['draft', 'in_process', 'pending', 'paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const payslip = await EmployeePayroll.findById(id);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        error: 'Payslip not found'
      });
    }

    const oldStatus = payslip.status;
    payslip.status = status;

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case 'in_process':
        payslip.processedAt = now;
        break;
      case 'pending':
        payslip.approvalWorkflow.submittedBy = hrUserId;
        payslip.approvalWorkflow.submittedAt = now;
        break;
      case 'paid':
        payslip.paidAt = now;
        if (!payslip.approvalWorkflow.approvedBy) {
          payslip.approvalWorkflow.approvedBy = hrUserId;
          payslip.approvalWorkflow.approvedAt = now;
        }
        break;
    }

    // Add to edit history
    payslip.editHistory.push({
      field: 'status',
      oldValue: oldStatus,
      newValue: status,
      editedBy: hrUserId,
      editedAt: now
    });

    if (remarks) {
      payslip.remarks = remarks;
    }

    await payslip.save();

    res.status(200).json({
      success: true,
      message: `Payslip status updated to ${status}`,
      data: payslip
    });

  } catch (error) {
    console.error('Error updating payslip status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payslip status',
      details: error.message
    });
  }
};

/**
 * Bulk update payslip statuses
 */
const bulkUpdatePayslipStatus = async (req, res) => {
  try {
    const { payslipIds, status, remarks } = req.body;
    const hrUserId = req.user?.id || req.body.hrUserId;

    if (!payslipIds || !Array.isArray(payslipIds) || payslipIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Payslip IDs array is required'
      });
    }

    const validStatuses = ['draft', 'in_process', 'pending', 'paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const updateResults = [];
    const now = new Date();

    for (const payslipId of payslipIds) {
      try {
        const payslip = await EmployeePayroll.findById(payslipId);
        if (!payslip) {
          updateResults.push({
            payslipId,
            success: false,
            error: 'Payslip not found'
          });
          continue;
        }

        const oldStatus = payslip.status;
        payslip.status = status;

        // Update timestamps based on status
        switch (status) {
          case 'in_process':
            payslip.processedAt = now;
            break;
          case 'pending':
            payslip.approvalWorkflow.submittedBy = hrUserId;
            payslip.approvalWorkflow.submittedAt = now;
            break;
          case 'paid':
            payslip.paidAt = now;
            if (!payslip.approvalWorkflow.approvedBy) {
              payslip.approvalWorkflow.approvedBy = hrUserId;
              payslip.approvalWorkflow.approvedAt = now;
            }
            break;
        }

        // Add to edit history
        payslip.editHistory.push({
          field: 'status',
          oldValue: oldStatus,
          newValue: status,
          editedBy: hrUserId,
          editedAt: now
        });

        if (remarks) {
          payslip.remarks = remarks;
        }

        await payslip.save();

        updateResults.push({
          payslipId,
          success: true,
          oldStatus,
          newStatus: status
        });

      } catch (error) {
        updateResults.push({
          payslipId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = updateResults.filter(result => result.success).length;

    res.status(200).json({
      success: true,
      message: `${successCount} out of ${payslipIds.length} payslips updated successfully`,
      results: updateResults
    });

  } catch (error) {
    console.error('Error bulk updating payslip statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update payslip statuses',
      details: error.message
    });
  }
};

/**
 * Get payslip edit history
 */
const getPayslipEditHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await EmployeePayroll.findById(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        error: 'Payslip not found'
      });
    }

    // Manually populate user data for edit history
    let populatedEditHistory = [];
    if (payslip.editHistory && payslip.editHistory.length > 0) {
      populatedEditHistory = await Promise.all(
        payslip.editHistory.map(async (edit) => {
          const user = await User.findOne({ id: edit.editedBy });
          return {
            ...edit.toObject(),
            editedByUser: user ? {
              name: user.name,
              email: user.email
            } : null
          };
        })
      );
    }

    // Manually populate approval workflow users
    let populatedApprovalWorkflow = { ...payslip.approvalWorkflow };
    if (payslip.approvalWorkflow) {
      if (payslip.approvalWorkflow.submittedBy) {
        const submittedByUser = await User.findOne({ id: payslip.approvalWorkflow.submittedBy });
        populatedApprovalWorkflow.submittedByUser = submittedByUser ? {
          name: submittedByUser.name,
          email: submittedByUser.email
        } : null;
      }
      
      if (payslip.approvalWorkflow.approvedBy) {
        const approvedByUser = await User.findOne({ id: payslip.approvalWorkflow.approvedBy });
        populatedApprovalWorkflow.approvedByUser = approvedByUser ? {
          name: approvedByUser.name,
          email: approvedByUser.email
        } : null;
      }
      
      if (payslip.approvalWorkflow.rejectedBy) {
        const rejectedByUser = await User.findOne({ id: payslip.approvalWorkflow.rejectedBy });
        populatedApprovalWorkflow.rejectedByUser = rejectedByUser ? {
          name: rejectedByUser.name,
          email: rejectedByUser.email
        } : null;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        editHistory: populatedEditHistory,
        approvalWorkflow: populatedApprovalWorkflow,
        currentStatus: payslip.status,
        createdAt: payslip.createdAt,
        updatedAt: payslip.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching payslip edit history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payslip edit history',
      details: error.message
    });
  }
};

/**
 * Get payslips by status with filtering
 */
const getPayslipsByStatus = async (req, res) => {
  try {
    const { status, departmentName, employeeId, startDate, endDate } = req.query;

    let filter = { };

    if (status) filter.status = status;
    if (departmentName) filter.departmentName = departmentName;
    if (employeeId) filter.employeeId = employeeId;

    // Date range filter
    if (startDate || endDate) {
      filter['payrollPeriod.startDate'] = {};
      if (startDate) filter['payrollPeriod.startDate'].$gte = new Date(startDate);
      if (endDate) filter['payrollPeriod.endDate'] = { $lte: new Date(endDate) };
    }

    const payslips = await EmployeePayroll.find(filter)
      .sort({ updatedAt: -1 });

    // Group by status for dashboard view
    const groupedByStatus = {
      draft: [],
      in_process: [],
      pending: [],
      paid: []
    };

    payslips.forEach(payslip => {
      if (groupedByStatus[payslip.status]) {
        groupedByStatus[payslip.status].push(payslip);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        all: payslips,
        grouped: groupedByStatus,
        counts: {
          total: payslips.length,
          draft: groupedByStatus.draft.length,
          in_process: groupedByStatus.in_process.length,
          pending: groupedByStatus.pending.length,
          paid: groupedByStatus.paid.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching payslips by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payslips by status',
      details: error.message
    });
  }
};

// Helper functions for nested object operations
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Delete a payslip
 */
const deletePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.user?.id || req.body.hrUserId;

    const payslip = await EmployeePayroll.findById(id);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        error: 'Payslip not found'
      });
    }

    // Only allow deletion of draft payslips for safety
    if (payslip.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Only draft payslips can be deleted. Please set status to draft first.'
      });
    }

    await EmployeePayroll.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Payslip deleted successfully',
      deletedPayslip: {
        id: payslip._id,
        employeeId: payslip.employeeId,
        name: payslip.name,
        period: payslip.payrollPeriod.label
      }
    });

  } catch (error) {
    console.error('Error deleting payslip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payslip',
      details: error.message
    });
  }
};

module.exports = {
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
};
