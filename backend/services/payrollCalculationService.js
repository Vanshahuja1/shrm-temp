const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const { EmployeePayroll } = require('../models/payrollModel');

class PayrollCalculationService {
  
  /**
   * Calculate payslip based on attendance and user salary data
   */
  async calculatePayslip(
    employeeId,
    startDate,
    endDate,
    customAdjustments = {},
    allowanceConfig = {},
    attendanceConfig = {}
  ) {
    try {
      // Get employee data with salary information
      const employee = await User.findOne({ id: employeeId })
        .populate('organizationId', 'name')
        .populate('departmentId', 'name');

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get attendance data for the period
      const attendanceData = await this.getAttendanceData(employeeId, startDate, endDate);
      
      // Calculate working days in the period
      const totalWorkingDays = this.calculateWorkingDays(startDate, endDate);
      
      console.log('Payslip calculation started:', {
        employeeId,
        employeeName: employee.name,
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalWorkingDays,
        attendanceData
      });
      
      // Calculate earnings based on attendance and salary
      const earnings = this.calculateEarnings(
        employee,
        attendanceData,
        totalWorkingDays,
        customAdjustments.earnings || {},
        allowanceConfig,
        attendanceConfig
      );
      
      // Calculate deductions
      const deductions = this.calculateDeductions(
        employee,
        earnings,
        attendanceData,
        customAdjustments.deductions || {},
        attendanceConfig
      );
      
      // Calculate totals
      const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
      const netPay = totalEarnings - totalDeductions;

      return {
        employeeId: employee.id,
        name: employee.name,
        employee: {
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          departmentName: employee.departmentId?.name || 'N/A'
        },
        payrollPeriod: {
          startDate,
          endDate,
          label: this.formatPeriodLabel(startDate, endDate),
          range: this.formatPeriodRange(startDate, endDate)
        },
        payableDays: `${attendanceData.presentDays}/${totalWorkingDays}`,
        earnings,
        deductions,
        totalEarnings,
        totalDeductions,
        netPay,
        attendanceData: {
          totalWorkingDays,
          presentDays: attendanceData.presentDays,
          absentDays: attendanceData.absentDays,
          halfDays: attendanceData.halfDays,
          overtimeHours: attendanceData.overtimeHours,
          lateComings: attendanceData.lateComings
        },
        departmentName: employee.departmentId?.name || 'N/A',
        designation: employee.designation || 'Employee',
        dateOfJoining: employee.joiningDate
      };
    } catch (error) {
      console.error('Error calculating payslip:', error);
      throw error;
    }
  }

  /**
   * Calculate working days between two dates (excluding only Sundays)
   */
  calculateWorkingDays(startDate, endDate) {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Calculate earnings
   */
  calculateEarnings(employee, attendanceData, totalWorkingDays, customEarnings = {}, allowanceConfig = {}, attendanceConfig = {}) {
    const baseSalary = employee.salary || 0;
    const isAttendanceBasedCalculationEnabled = attendanceConfig.enabled !== false;
    
    let basicSalary;
    if (customEarnings.basicSalary !== undefined) {
      basicSalary = customEarnings.basicSalary;
    } else if (isAttendanceBasedCalculationEnabled) {
      const perDaySalary = baseSalary / totalWorkingDays;
      basicSalary = Math.round(perDaySalary * (attendanceData.presentDays + (attendanceData.halfDays * 0.5)));
    } else {
      basicSalary = baseSalary;
    }

    let hra = customEarnings.hra ?? Math.round(basicSalary * 0.30);
    let conveyanceAllowance = customEarnings.conveyanceAllowance ?? 2000;
    let medicalAllowance = customEarnings.medicalAllowance ?? 1500;
    let specialAllowance = customEarnings.specialAllowance ?? Math.round(basicSalary * 0.10);

    const overtimeRate = (baseSalary / totalWorkingDays) / 8;
    const overtime = customEarnings.overtime !== undefined 
      ? customEarnings.overtime 
      : Math.round(overtimeRate * attendanceData.overtimeHours);

    return {
      basicSalary,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      bonus: customEarnings.bonus || 0,
      overtime,
      arrears: customEarnings.arrears || 0,
      otherEarnings: customEarnings.otherEarnings || 0
    };
  }

  /**
   * Calculate deductions
   */
  calculateDeductions(employee, earnings, attendanceData, customDeductions = {}, attendanceConfig = {}) {
    const basicSalary = earnings.basicSalary;
    const pf = customDeductions.pf ?? Math.round(basicSalary * 0.12);
    const grossSalary = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);
    const esi = customDeductions.esi ?? (grossSalary <= 25000 ? Math.round(grossSalary * 0.0075) : 0);
    const professionalTax = customDeductions.professionalTax ?? 200;
    const tds = customDeductions.tds ?? (grossSalary > 50000 ? Math.round(grossSalary * 0.05) : 0);

    const isAttendanceDeductionEnabled = attendanceConfig.enabled !== false;
    let attendanceDeduction = 0;

    if (isAttendanceDeductionEnabled) {
      const perDaySalary = employee.salary / 26;
      const baseAttendanceDeduction = Math.round(perDaySalary * attendanceData.absentDays);
      const lateComingPenalty = (attendanceConfig.includeLatePenalty !== false) ? (attendanceData.lateComings * 100) : 0;
      attendanceDeduction = customDeductions.attendanceDeduction ?? (baseAttendanceDeduction + lateComingPenalty);
    } else {
      attendanceDeduction = customDeductions.attendanceDeduction || 0;
    }

    return {
      pf,
      esi,
      professionalTax,
      tds,
      loanDeduction: customDeductions.loanDeduction || 0,
      leaveDeduction: customDeductions.leaveDeduction || 0,
      attendanceDeduction,
      otherDeductions: customDeductions.otherDeductions || 0
    };
  }

  /**
   * Format period label
   */
  formatPeriodLabel(startDate, endDate) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
  }

  /**
   * Format period range
   */
  formatPeriodRange(startDate, endDate) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const startDay = startDate.getDate().toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    return `${months[startDate.getMonth()]} ${startDay} - ${months[endDate.getMonth()]} ${endDay}`;
  }

  /**
   * Save or update payslip in DB
   */
  async savePayslip(payslipData, hrUserId) {
    try {
      const existingPayslip = await EmployeePayroll.findOne({
        employeeId: payslipData.employeeId,
        'payrollPeriod.startDate': payslipData.payrollPeriod.startDate,
        'payrollPeriod.endDate': payslipData.payrollPeriod.endDate
      });

      if (existingPayslip) {
        Object.assign(existingPayslip, payslipData);
        existingPayslip.editHistory.push({
          field: 'full_payslip',
          oldValue: 'previous_calculation',
          newValue: 'recalculated',
          editedBy: hrUserId,
          editedAt: new Date()
        });
        await existingPayslip.save();
        return existingPayslip;
      } else {
        const newPayslip = new EmployeePayroll(payslipData);
        await newPayslip.save();
        return newPayslip;
      }
    } catch (error) {
      console.error('Error saving payslip:', error);
      throw error;
    }
  }

  /**
   * Dummy attendance data fetcher (implement properly)
   */
  async getAttendanceData(employeeId, startDate, endDate) {
    // Implement real logic, this is just a placeholder
    return {
      presentDays: 20,
      absentDays: 2,
      halfDays: 1,
      overtimeHours: 5,
      lateComings: 3
    };
  }
}

module.exports = new PayrollCalculationService();
