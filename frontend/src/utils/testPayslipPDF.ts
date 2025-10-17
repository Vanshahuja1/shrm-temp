import { generatePayslipPDF } from './generatePayslipPDF';

// Sample data for testing the PDF generation
export const testPayslipData = {
  _id: "test123",
  employeeId: "EMP001",
  name: "John Doe",
  employee: {
    name: "John Doe",
    email: "john.doe@example.com",
    designation: "Software Engineer",
    departmentName: "IT Department"
  },
  payrollPeriod: {
    label: "January 2025",
    range: "01/01/2025 - 31/01/2025",
    startDate: "2025-01-01",
    endDate: "2025-01-31"
  },
  payableDays: "31",
  earnings: {
    basicSalary: 50000,
    hra: 20000,
    conveyanceAllowance: 2000,
    medicalAllowance: 1500,
    specialAllowance: 5000,
    bonus: 3000,
    overtime: 2500,
    arrears: 0,
    otherEarnings: 1000
  },
  deductions: {
    pf: 6000,
    esi: 850,
    professionalTax: 2500,
    tds: 5000,
    loanDeduction: 0,
    leaveDeduction: 0,
    attendanceDeduction: 0,
    otherDeductions: 500
  },
  totalEarnings: 85000,
  totalDeductions: 14850,
  netPay: 70150,
  departmentName: "IT Department",
  designation: "Software Engineer",
  dateOfJoining: "2023-06-15",
  status: "processed",
  organizationName: "OneAim IT Solutions",
  organizationDetails: {
    name: "OneAim IT Solutions",
    address: "123 Business Park, Tech City, Mumbai - 400001",
    contactEmail: "hr@oneaimit.com",
    contactPhone: "+91-98765-43210",
    website: "www.oneaimit.com",
    logo: ""
  }
};

export const testGeneratePayslip = () => {
  generatePayslipPDF(testPayslipData);
  console.log('Test payslip PDF generated!');
};
