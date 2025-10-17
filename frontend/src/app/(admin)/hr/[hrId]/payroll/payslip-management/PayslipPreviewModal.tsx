"use client";

import { useState } from "react";
import { X, Download, Calendar, User, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateCustomPayslipPDF } from "@/src/utils/payslipPDFGenerator";

interface EmployeePayroll {
  _id: string;
  employeeId: string;
  name: string;
  employee?: {
    name: string;
    email: string;
    designation: string;
    departmentName: string;
  };
  payrollPeriod: {
    label: string;
    range: string;
    startDate: string;
    endDate: string;
  };
  payableDays: string;
  earnings: {
    basicSalary: number;
    hra: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    specialAllowance: number;
    bonus: number;
    overtime: number;
    arrears: number;
    otherEarnings: number;
  };
  deductions: {
    pf: number;
    esi: number;
    professionalTax: number;
    tds: number;
    loanDeduction: number;
    leaveDeduction: number;
    attendanceDeduction: number;
    otherDeductions: number;
  };
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'in_process' | 'pending' | 'paid';
  departmentName: string;
  designation: string;
  attendanceData?: {
    totalWorkingDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    overtimeHours: number;
    lateComings: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface EmployeeDetails {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "intern" | "employee" | "manager" | "hr" | "admin";
  currentAddress: string;
  dateOfBirth: { $date: string } | string;
  performance: number;
  joiningDate: { $date: string } | string;
  currentProjects: string[];
  pastProjects: string[];
  attendanceCount30Days: number;
  taskCountPerDay: number;
  tasks: string[];
  responses: string[];
  managers: string[];
  photo: string;
  upperManager: string;
  salary: number;
  adharCard: string;
  panCard: string;
  experience: number;
  projects: string[];
  organizationName: string;
  departmentName: string;
  designation: string;
  isActive: boolean;
  organizationId: { $oid: string };
  departmentId: { $oid: string };
  documents: {
    aadharFront?: string;
    aadharBack?: string;
    panCard?: string;
    resume?: string;
    experienceLetter?: string;
    passbookPhoto?: string;
    tenthMarksheet?: string;
    twelfthMarksheet?: string;
    degreeMarksheet?: string;
    policy?: string;
  };
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    accountType: "CURRENT" | "SAVING";
  };
  workLog: { hoursWorked: number };
  passwordChangedAt: { $date: string };
  createdAt: { $date: string };
  updatedAt: { $date: string };
  lastLogin?: { $date: string };
  managerName?: string;
}

interface PayslipPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: EmployeePayroll | null;
  employeeDetails: EmployeeDetails | null | unknown;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  in_process: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800"
};

export default function PayslipPreviewModal({
  open,
  onOpenChange,
  payslip,
  employeeDetails
}: PayslipPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const formatCurrency = (amount: number) => {
    return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  };

  const formatDate = (dateValue: string | { $date: string }) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString('en-IN');
    }
    if (dateValue.$date) {
      return new Date(dateValue.$date).toLocaleDateString('en-IN');
    }
    return '';
  };

  const handleDownloadPDF = async () => {
    if (!payslip || !employeeDetails) return;
    
    try {
      setDownloading(true);
      await generateCustomPayslipPDF(payslip, employeeDetails as EmployeeDetails);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!payslip || !employeeDetails) return null;

  // Type cast for better handling
  const empDetails = employeeDetails as EmployeeDetails;

  // Filter earnings and deductions with values > 0
  const earningsItems = [
    { label: 'Basic Salary', amount: payslip.earnings.basicSalary },
    { label: 'HRA', amount: payslip.earnings.hra },
    { label: 'Conveyance Allowance', amount: payslip.earnings.conveyanceAllowance },
    { label: 'Medical Allowance', amount: payslip.earnings.medicalAllowance },
    { label: 'Special Allowance', amount: payslip.earnings.specialAllowance },
    { label: 'Bonus', amount: payslip.earnings.bonus },
    { label: 'Overtime', amount: payslip.earnings.overtime },
    { label: 'Arrears', amount: payslip.earnings.arrears },
    { label: 'Other Earnings', amount: payslip.earnings.otherEarnings },
  ].filter(item => item.amount > 0);

  const deductionItems = [
    { label: 'Provident Fund (PF)', amount: payslip.deductions.pf, isAttendance: false },
    { label: 'ESI', amount: payslip.deductions.esi, isAttendance: false },
    { label: 'Professional Tax', amount: payslip.deductions.professionalTax, isAttendance: false },
    { label: 'TDS', amount: payslip.deductions.tds, isAttendance: false },
    { label: 'Loan Deduction', amount: payslip.deductions.loanDeduction, isAttendance: false },
    { label: 'Leave Deduction', amount: payslip.deductions.leaveDeduction, isAttendance: false },
    { 
      label: `Attendance Deduction (${payslip.attendanceData?.absentDays || 0} absent${(payslip.attendanceData?.lateComings || 0) > 0 ? `, ${payslip.attendanceData?.lateComings} late` : ''})`, 
      amount: payslip.deductions.attendanceDeduction, 
      isAttendance: true 
    },
    { label: 'Other Deductions', amount: payslip.deductions.otherDeductions, isAttendance: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText size={20} />
            Payslip Preview - {payslip.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {empDetails.organizationName || 'SHRM Organization'}
                </h2>
                <p className="text-blue-700">Payslip for {payslip.payrollPeriod.label}</p>
              </div>
              <Badge className={statusColors[payslip.status]}>
                {payslip.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={16} />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><strong>Name:</strong> {empDetails.name}</div>
                  <div><strong>Employee ID:</strong> {empDetails.id}</div>
                  <div><strong>Department:</strong> {empDetails.departmentName}</div>
                  <div><strong>Designation:</strong> {empDetails.designation}</div>
                  <div><strong>Email:</strong> {empDetails.email}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Phone:</strong> {empDetails.phone}</div>
                  <div><strong>Joining Date:</strong> {formatDate(empDetails.joiningDate)}</div>
                  <div><strong>Base Salary:</strong> {formatCurrency(empDetails.salary)}</div>
                  <div><strong>PAN:</strong> {empDetails.panCard}</div>
                  <div><strong>Bank A/C:</strong> {empDetails.bankDetails?.accountNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={16} />
                Payroll Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><strong>Period:</strong> {payslip.payrollPeriod.label}</div>
                  <div><strong>Date Range:</strong> {payslip.payrollPeriod.range}</div>
                  <div><strong>Payable Days:</strong> {payslip.payableDays}</div>
                </div>
                {payslip.attendanceData && (
                  <div className="space-y-2">
                    <div><strong>Working Days:</strong> {payslip.attendanceData.totalWorkingDays}</div>
                    <div><strong>Present Days:</strong> {payslip.attendanceData.presentDays}</div>
                    <div className="text-red-600"><strong>Absent Days:</strong> {payslip.attendanceData.absentDays}</div>
                    {payslip.attendanceData.overtimeHours > 0 && (
                      <div><strong>Overtime Hours:</strong> {payslip.attendanceData.overtimeHours}</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Deduction Breakdown */}
          {payslip.attendanceData && payslip.attendanceData.absentDays > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Calendar size={16} />
                  Attendance Impact & Deduction Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Salary Calculation:</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Monthly Salary:</strong> {formatCurrency(empDetails.salary || 0)}</div>
                      <div><strong>Working Days:</strong> {payslip.attendanceData.totalWorkingDays}</div>
                      <div><strong>Per Day Salary:</strong> {formatCurrency(Math.round((empDetails.salary || 0) / payslip.attendanceData.totalWorkingDays))}</div>
                      <div><strong>Present Days:</strong> {payslip.attendanceData.presentDays}</div>
                      <div className="text-green-600"><strong>Salary Paid:</strong> {formatCurrency(payslip.earnings.basicSalary)}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-700">Attendance Deduction:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-red-600"><strong>Absent Days:</strong> {payslip.attendanceData.absentDays}</div>
                      {payslip.attendanceData.lateComings > 0 && (
                        <div className="text-red-600"><strong>Late Comings:</strong> {payslip.attendanceData.lateComings}</div>
                      )}
                      <div className="text-red-600"><strong>Total Deduction:</strong> {formatCurrency(payslip.deductions.attendanceDeduction)}</div>
                      <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                        <strong>Calculation:</strong><br/>
                        Absent Days: {formatCurrency(Math.round((empDetails.salary || 0) / 26))} × {payslip.attendanceData.absentDays} = {formatCurrency(Math.round((empDetails.salary || 0) / 26) * payslip.attendanceData.absentDays)}
                        {payslip.attendanceData.lateComings > 0 && (
                          <><br/>Late Penalty: ₹100 × {payslip.attendanceData.lateComings} = {formatCurrency(payslip.attendanceData.lateComings * 100)}</>
                        )}
                        <br/><strong>Total: {formatCurrency(Math.round((empDetails.salary || 0) / 26) * payslip.attendanceData.absentDays + (payslip.attendanceData.lateComings * 100))}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {payslip.deductions.attendanceDeduction === 0 && payslip.attendanceData.absentDays > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    <strong>📝 HR Override:</strong> Attendance deduction has been waived (set to ₹0) despite {payslip.attendanceData.absentDays} absent days.
                  </div>
                )}
                {payslip.attendanceData.absentDays === 0 && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                    <strong>✅ Perfect Attendance:</strong> No absent days, no attendance deduction applied.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <DollarSign size={16} />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earningsItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.label}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-green-700">
                    <span>Total Earnings</span>
                    <span>{formatCurrency(payslip.totalEarnings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <DollarSign size={16} />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deductionItems.length > 0 ? (
                    <>
                      {deductionItems.map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between ${
                            item.isAttendance && item.amount > 0 ? 'bg-red-50 p-2 rounded border-l-4 border-red-400' : 
                            item.isAttendance && item.amount === 0 ? 'bg-yellow-50 p-2 rounded border-l-4 border-yellow-400' : ''
                          }`}
                        >
                          <span className={item.isAttendance ? 'font-medium' : ''}>{item.label}</span>
                          <span className={`font-medium ${item.isAttendance && item.amount > 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                      {/* Show attendance deduction even if 0 to make it clear */}
                      {!deductionItems.some(item => item.isAttendance) && payslip.attendanceData && (
                        <div className="flex justify-between bg-green-50 p-2 rounded border-l-4 border-green-400">
                          <span className="font-medium">Attendance Deduction (0 absent days)</span>
                          <span className="font-medium text-green-600">{formatCurrency(0)}</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-red-700">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(payslip.totalDeductions)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center text-gray-500 py-2">
                        No statutory deductions for this period
                      </div>
                      {/* Always show attendance deduction status */}
                      {payslip.attendanceData && (
                        <div className={`flex justify-between p-2 rounded border-l-4 ${
                          payslip.attendanceData.absentDays > 0 ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'
                        }`}>
                          <span className="font-medium">
                            Attendance Deduction ({payslip.attendanceData.absentDays} absent days)
                          </span>
                          <span className={`font-medium ${
                            payslip.attendanceData.absentDays > 0 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(payslip.deductions.attendanceDeduction)}
                          </span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-red-700">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(payslip.totalDeductions)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Pay */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-900">Net Pay</span>
                <span className="text-2xl font-bold text-blue-900">
                  {formatCurrency(payslip.netPay)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X size={16} className="mr-2" />
              Close
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {downloading ? (
                <>
                  <Download size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>This is a computer-generated payslip preview.</p>
            <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
