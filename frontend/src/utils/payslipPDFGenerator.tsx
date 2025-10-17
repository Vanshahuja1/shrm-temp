import type React from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer"

// Use default fonts to avoid font loading issues

interface EmployeePayroll {
  _id: string
  employeeId: string
  name: string
  employee?: {
    name: string
    email: string
    designation: string
    departmentName: string
  }
  payrollPeriod: {
    label: string
    range: string
    startDate: string
    endDate: string
  }
  payableDays: string
  earnings: {
    basicSalary: number
    hra: number
    conveyanceAllowance: number
    medicalAllowance: number
    specialAllowance: number
    bonus: number
    overtime: number
    arrears: number
    otherEarnings: number
  }
  deductions: {
    pf: number
    esi: number
    professionalTax: number
    tds: number
    loanDeduction: number
    leaveDeduction: number
    attendanceDeduction: number
    otherDeductions: number
  }
  totalEarnings: number
  totalDeductions: number
  netPay: number
  status: "draft" | "in_process" | "pending" | "paid"
  departmentName: string
  designation: string
  attendanceData?: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    halfDays: number
    overtimeHours: number
    lateComings: number
  }
  createdAt: string
  updatedAt: string
}

interface EmployeeDetails {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  role: "intern" | "employee" | "manager" | "hr" | "admin"
  currentAddress: string
  dateOfBirth: { $date: string } | string
  performance: number
  joiningDate: { $date: string } | string
  currentProjects: string[]
  pastProjects: string[]
  attendanceCount30Days: number
  taskCountPerDay: number
  tasks: string[]
  responses: string[]
  managers: string[]
  photo: string
  upperManager: string
  salary: number
  adharCard: string
  panCard: string
  experience: number
  projects: string[]
  organizationName: string
  departmentName: string
  designation: string
  isActive: boolean
  organizationId: { $oid: string }
  departmentId: { $oid: string }
  documents: {
    aadharFront?: string
    aadharBack?: string
    panCard?: string
    resume?: string
    experienceLetter?: string
    passbookPhoto?: string
    tenthMarksheet?: string
    twelfthMarksheet?: string
    degreeMarksheet?: string
    policy?: string
  }
  bankDetails: {
    accountHolder: string
    accountNumber: string
    ifsc: string
    branch: string
    accountType: "CURRENT" | "SAVING"
  }
  workLog: { hoursWorked: number }
  passwordChangedAt: { $date: string }
  createdAt: { $date: string }
  updatedAt: { $date: string }
  lastLogin?: { $date: string }
  managerName?: string
}

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 10,
  },
  header: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: 15,
    textAlign: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginBottom: 3,
  },
  headerPeriod: {
    fontSize: 10,
  },
  statusBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#10b981",
    color: "white",
    padding: "3 8",
    fontSize: 8,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: "#f8fafc",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    borderBottom: "1 solid #e2e8f0",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 9,
    color: "#0f172a",
  },
  earningsDeductionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  earningsSection: {
    flex: 1,
    border: "1 solid #e2e8f0",
  },
  deductionsSection: {
    flex: 1,
    border: "1 solid #e2e8f0",
  },
  earningsHeader: {
    backgroundColor: "#10b981",
    color: "white",
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  deductionsHeader: {
    backgroundColor: "#ef4444",
    color: "white",
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "3 8",
    borderBottom: "0.5 solid #f1f5f9",
  },
  itemLabel: {
    fontSize: 8,
    color: "#374151",
  },
  itemAmount: {
    fontSize: 8,
    color: "#374151",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "6 8",
    backgroundColor: "#f8fafc",
    borderTop: "1 solid #e2e8f0",
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 9,
    fontWeight: "bold",
  },
  netPaySection: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  netPayLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  netPayAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  netPaySubtext: {
    fontSize: 8,
    marginTop: 3,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
    borderTop: "0.5 solid #e2e8f0",
    paddingTop: 8,
  },
})

// Helper functions
const formatCurrency = (amount: number): string => {
  return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
}



// PDF Document Component
const PayslipDocument: React.FC<{ payslipData: EmployeePayroll; employeeDetails: EmployeeDetails }> = ({
  payslipData,
  employeeDetails,
}) => {
  const statusColors = {
    draft: "#6b7280",
    in_process: "#f59e0b",
    pending: "#2563eb",
    paid: "#10b981",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PAYSLIP</Text>
          <Text style={styles.headerSubtitle}>{employeeDetails?.organizationName || "SHRM Organization"}</Text>
          <Text style={styles.headerPeriod}>For the period of {payslipData?.payrollPeriod?.label || "N/A"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[payslipData?.status || "draft"] }]}>
            <Text>{(payslipData?.status || "draft").replace("_", " ").toUpperCase()}</Text>
          </View>
        </View>

        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Employee Information</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{employeeDetails?.name || "N/A"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Employee ID:</Text>
              <Text style={styles.value}>{employeeDetails?.id || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Department:</Text>
              <Text style={styles.value}>{employeeDetails?.departmentName || "N/A"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Designation:</Text>
              <Text style={styles.value}>{employeeDetails?.designation || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{employeeDetails?.email || "N/A"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{employeeDetails?.phone || "N/A"}</Text>
            </View>
          </View>
          {employeeDetails?.bankDetails && (
            <> <Text style={styles.sectionHeader}>Bank Details:</Text>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Account Number:</Text>
                  <Text style={styles.value}>{employeeDetails.bankDetails.accountNumber || "N/A"}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>IFSC Code:</Text>
                  <Text style={styles.value}>{employeeDetails.bankDetails.ifsc || "N/A"}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Account Holder:</Text>
                  <Text style={styles.value}>{employeeDetails.bankDetails.accountHolder || "N/A"}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Account Type:</Text>
                  <Text style={styles.value}>{employeeDetails.bankDetails.accountType || "N/A"}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Payroll Period */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Payroll Period</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Period:</Text>
              <Text style={styles.value}>{payslipData?.payrollPeriod?.label || "N/A"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Payable Days:</Text>
              <Text style={styles.value}>{payslipData?.payableDays || "N/A"}</Text>
            </View>
          </View>
          {payslipData?.attendanceData && (
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Present Days:</Text>
                <Text style={styles.value}>{payslipData.attendanceData.presentDays || 0}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Absent Days:</Text>
                <Text style={styles.value}>{payslipData.attendanceData.absentDays || 0}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Earnings and Deductions */}
        <View style={styles.earningsDeductionsContainer}>
          {/* Earnings */}
          <View style={styles.earningsSection}>
            <Text style={styles.earningsHeader}>EARNINGS</Text>
            {Object.entries(payslipData?.earnings || {})
              .filter(([, amount]) => amount > 0)
              .map(([key, amount]) => (
                <View key={key} style={styles.itemRow}>
                  <Text style={styles.itemLabel}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Text>
                  <Text style={styles.itemAmount}>{formatCurrency(amount)}</Text>
                </View>
              ))}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#10b981" }]}>TOTAL EARNINGS</Text>
              <Text style={[styles.totalAmount, { color: "#10b981" }]}>
                {formatCurrency(payslipData?.totalEarnings || 0)}
              </Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.deductionsSection}>
            <Text style={styles.deductionsHeader}>DEDUCTIONS</Text>
            {Object.entries(payslipData?.deductions || {})
              .filter(([, amount]) => amount > 0)
              .map(([key, amount]) => (
                <View key={key} style={styles.itemRow}>
                  <Text style={styles.itemLabel}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Text>
                  <Text style={styles.itemAmount}>{formatCurrency(amount)}</Text>
                </View>
              ))}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#ef4444" }]}>TOTAL DEDUCTIONS</Text>
              <Text style={[styles.totalAmount, { color: "#ef4444" }]}>
                {formatCurrency(payslipData?.totalDeductions || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPaySection}>
          <View>
            <Text style={styles.netPayLabel}>NET PAY</Text>
            <Text style={styles.netPaySubtext}>
              Earnings: {formatCurrency(payslipData?.totalEarnings || 0)} - Deductions:{" "}
              {formatCurrency(payslipData?.totalDeductions || 0)}
            </Text>
          </View>
          <Text style={styles.netPayAmount}>{formatCurrency(payslipData?.netPay || 0)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated payslip and does not require a signature.</Text>
          <Text>
            Generated on: {new Date().toLocaleDateString("en-IN")} | Employee ID: {employeeDetails?.id || "N/A"}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Main Component
const ReactPDFPayslip: React.FC<{ payslipData: EmployeePayroll; employeeDetails: EmployeeDetails }> = ({
  payslipData,
  employeeDetails,
}) => {
  const fileName = `Payslip_${(employeeDetails?.name || "Employee").replace(/\s+/g, "_")}_${(payslipData?.payrollPeriod?.label || "Period").replace(/\s+/g, "_")}.pdf`

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">React-PDF Payslip Generator</h2>
      <PDFDownloadLink
        document={<PayslipDocument payslipData={payslipData} employeeDetails={employeeDetails} />}
        fileName={fileName}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {({  loading }) => (loading ? "Loading document..." : "Download Payslip PDF")}
      </PDFDownloadLink>
    </div>
  )
}

// Function to generate and download PDF
export const generateCustomPayslipPDF = async (payslipData: EmployeePayroll, employeeDetails: EmployeeDetails) => {
  try {
    console.log('Starting PDF generation...');
    
    // Create PDF document
    const doc = <PayslipDocument payslipData={payslipData} employeeDetails={employeeDetails} />;
    
    console.log('Creating PDF blob...');
    const blob = await pdf(doc).toBlob();
    
    console.log('PDF blob created successfully, size:', blob.size);
    
    // Create download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${(employeeDetails?.name || "Employee").replace(/\s+/g, "_")}_${(payslipData?.payrollPeriod?.label || "Period").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('PDF download completed successfully');
  } catch (error) {
    console.error('Detailed PDF generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default ReactPDFPayslip
