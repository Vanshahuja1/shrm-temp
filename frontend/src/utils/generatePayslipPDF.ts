import jsPDF from 'jspdf';

interface PayslipData {
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
  departmentName: string;
  designation: string;
  dateOfJoining: string;
  status: string;
  organizationName?: string;
  organizationDetails?: {
    name: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
    logo: string;
  };
}

export const generatePayslipPDF = (payslipData: PayslipData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [51, 51, 153]; // Dark blue
  const textColor = [51, 51, 51]; // Dark gray
  const lightGrayColor = [245, 245, 245]; // Light gray

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
   return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  };

  // Helper function to add text with proper positioning
  const addText = (text: string, x: number, y: number, fontSize: number = 10, color: number[] = textColor, align: 'left' | 'center' | 'right' = 'left'): void => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    
    if (align === 'center') {
      pdf.text(text, x, y, { align: 'center' });
    } else if (align === 'right') {
      pdf.text(text, x, y, { align: 'right' });
    } else {
      pdf.text(text, x, y);
    }
  };

  // Header Section
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  // Company Logo Area (placeholder)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(10, 5, 15, 15, 'F');
  addText('LOGO', 17.5, 14, 8, textColor, 'center');
  
  // Company Details
  const companyName = payslipData.organizationDetails?.name || payslipData.organizationName || 'OneAim IT Solutions';
  const companyAddress = payslipData.organizationDetails?.address || '';
  
  addText(companyName, 30, 12, 14, [255, 255, 255]);
  addText(companyAddress || 'Human Resource Management System', 30, 18, 8, [255, 255, 255]);

  // Payslip Title
  addText('PAYSLIP', pageWidth - 15, 12, 16, [255, 255, 255], 'right');
  addText(`Period: ${payslipData.payrollPeriod.label}`, pageWidth - 15, 18, 8, [255, 255, 255], 'right');

  // Employee Information Section
  let currentY = 35;
  
  // Employee Details Header
  pdf.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
  pdf.rect(10, currentY, pageWidth - 20, 8, 'F');
  addText('EMPLOYEE INFORMATION', 12, currentY + 5, 10, primaryColor);
  
  currentY += 12;
  
  // Employee details in two columns
  const leftColumnX = 12;
  const rightColumnX = pageWidth / 2 + 5;
  
  addText('Employee ID:', leftColumnX, currentY, 9, textColor);
  addText(payslipData.employeeId, leftColumnX + 25, currentY, 9, textColor);
  
  addText('Department:', rightColumnX, currentY, 9, textColor);
  addText(payslipData.employee?.departmentName ||  'N/A', rightColumnX + 25, currentY, 9, textColor);
  
  currentY += 6;
  
  addText('Employee Name:', leftColumnX, currentY, 9, textColor);
  addText(payslipData.employee?.name || payslipData.name, leftColumnX + 25, currentY, 9, textColor);
  
  addText('Designation:', rightColumnX, currentY, 9, textColor);
  addText(payslipData.employee?.designation || payslipData.designation || 'N/A', rightColumnX + 25, currentY, 9, textColor);
  
  currentY += 6;
  
  addText('Email:', leftColumnX, currentY, 9, textColor);
  addText(payslipData.employee?.email || 'N/A', leftColumnX + 25, currentY, 9, textColor);
  
  addText('Payable Days:', rightColumnX, currentY, 9, textColor);
  addText(payslipData.payableDays, rightColumnX + 25, currentY, 9, textColor);
  
  currentY += 6;
  
  addText('Date of Joining:', leftColumnX, currentY, 9, textColor);
  addText(new Date(payslipData.dateOfJoining).toLocaleDateString('en-GB'), leftColumnX + 25, currentY, 9, textColor);
  
  addText('Pay Period:', rightColumnX, currentY, 9, textColor);
  addText(payslipData.payrollPeriod.range, rightColumnX + 25, currentY, 9, textColor);
  
  currentY += 15;

  // Earnings Section
  pdf.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
  pdf.rect(10, currentY, (pageWidth - 30) / 2, 8, 'F');
  addText('EARNINGS', 12, currentY + 5, 10, primaryColor);
  
  // Deductions Section Header
  pdf.rect(pageWidth / 2 + 5, currentY, (pageWidth - 30) / 2, 8, 'F');
  addText('DEDUCTIONS', pageWidth / 2 + 7, currentY + 5, 10, primaryColor);
  
  currentY += 12;
  
  // Earnings Details
  const earningsItems = [
    { label: 'Basic Salary', amount: payslipData.earnings.basicSalary },
    { label: 'HRA', amount: payslipData.earnings.hra },
    { label: 'Conveyance Allowance', amount: payslipData.earnings.conveyanceAllowance },
    { label: 'Medical Allowance', amount: payslipData.earnings.medicalAllowance },
    { label: 'Special Allowance', amount: payslipData.earnings.specialAllowance },
    { label: 'Bonus', amount: payslipData.earnings.bonus },
    { label: 'Overtime', amount: payslipData.earnings.overtime },
    { label: 'Arrears', amount: payslipData.earnings.arrears },
    { label: 'Other Earnings', amount: payslipData.earnings.otherEarnings },
  ];
  
  // Deductions Details
  const deductionsItems = [
    { label: 'Provident Fund', amount: payslipData.deductions.pf },
    { label: 'ESI', amount: payslipData.deductions.esi },
    { label: 'Professional Tax', amount: payslipData.deductions.professionalTax },
    { label: 'TDS', amount: payslipData.deductions.tds },
    { label: 'Loan Deduction', amount: payslipData.deductions.loanDeduction },
    { label: 'Leave Deduction', amount: payslipData.deductions.leaveDeduction },
    { label: 'Attendance Deduction', amount: payslipData.deductions.attendanceDeduction },
    { label: 'Other Deductions', amount: payslipData.deductions.otherDeductions },
  ];
  
  // Display earnings and deductions side by side
  const maxItems = Math.max(earningsItems.length, deductionsItems.length);
  
  for (let i = 0; i < maxItems; i++) {
    // Earnings
    if (i < earningsItems.length && earningsItems[i].amount > 0) {
      addText(earningsItems[i].label, leftColumnX, currentY, 9, textColor);
      addText(formatCurrency(earningsItems[i].amount), leftColumnX + 70, currentY, 9, textColor, 'right');
    }
    
    // Deductions
    if (i < deductionsItems.length && deductionsItems[i].amount > 0) {
      addText(deductionsItems[i].label, rightColumnX, currentY, 9, textColor);
      addText(formatCurrency(deductionsItems[i].amount), rightColumnX + 70, currentY, 9, textColor, 'right');
    }
    
    if ((i < earningsItems.length && earningsItems[i].amount > 0) || 
        (i < deductionsItems.length && deductionsItems[i].amount > 0)) {
      currentY += 5;
    }
  }
  
  currentY += 5;
  
  // Total Earnings and Deductions
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(leftColumnX, currentY, leftColumnX + 70, currentY);
  pdf.line(rightColumnX, currentY, rightColumnX + 70, currentY);
  
  currentY += 3;
  
  addText('TOTAL EARNINGS', leftColumnX, currentY, 10, primaryColor);
  addText(formatCurrency(payslipData.totalEarnings), leftColumnX + 70, currentY, 10, primaryColor, 'right');
  
  addText('TOTAL DEDUCTIONS', rightColumnX, currentY, 10, primaryColor);
  addText(formatCurrency(payslipData.totalDeductions), rightColumnX + 70, currentY, 10, primaryColor, 'right');
  
  currentY += 15;
  
  // Net Pay Section
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(10, currentY, pageWidth - 20, 12, 'F');
  
  addText('NET PAY', 12, currentY + 5, 12, [255, 255, 255]);
  addText(formatCurrency(payslipData.netPay), pageWidth - 12, currentY + 5, 12, [255, 255, 255], 'right');
  
  // Net pay in words
  currentY += 8;
  const netPayInWords = convertNumberToWords(payslipData.netPay);
  addText(`Amount in Words: ${netPayInWords} Rupees Only`, 12, currentY, 8, [255, 255, 255]);
  
  currentY += 20;
  
  // Footer Section
  addText('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, currentY, 8, textColor, 'center');
  
  currentY += 5;
  addText(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, pageWidth / 2, currentY, 8, textColor, 'center');
  
  currentY += 10;
  const contactInfo = payslipData.organizationDetails?.contactEmail || payslipData.organizationDetails?.contactPhone;
  if (contactInfo) {
    addText(`For any queries, please contact HR Department: ${contactInfo}`, pageWidth / 2, currentY, 8, textColor, 'center');
  } else {
    addText('For any queries, please contact HR Department', pageWidth / 2, currentY, 8, textColor, 'center');
  }
  
  // Add border to the entire document
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(1);
  pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
  
  // Generate filename and save
  const fileName = `Payslip_${payslipData.employeeId}_${payslipData.payrollPeriod.label.replace(' ', '_')}.pdf`;
  pdf.save(fileName);
};

// Helper function to convert number to words (basic implementation)
const convertNumberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + convertNumberToWords(Math.abs(num));
  
  const integerPart = Math.floor(num);
  
  if (integerPart < 10) return ones[integerPart];
  if (integerPart < 20) return teens[integerPart - 10];
  if (integerPart < 100) return tens[Math.floor(integerPart / 10)] + (integerPart % 10 ? ' ' + ones[integerPart % 10] : '');
  if (integerPart < 1000) return ones[Math.floor(integerPart / 100)] + ' Hundred' + (integerPart % 100 ? ' ' + convertNumberToWords(integerPart % 100) : '');
  if (integerPart < 100000) return convertNumberToWords(Math.floor(integerPart / 1000)) + ' Thousand' + (integerPart % 1000 ? ' ' + convertNumberToWords(integerPart % 1000) : '');
  if (integerPart < 10000000) return convertNumberToWords(Math.floor(integerPart / 100000)) + ' Lakh' + (integerPart % 100000 ? ' ' + convertNumberToWords(integerPart % 100000) : '');
  
  return convertNumberToWords(Math.floor(integerPart / 10000000)) + ' Crore' + (integerPart % 10000000 ? ' ' + convertNumberToWords(integerPart % 10000000) : '');
};

export default generatePayslipPDF;
