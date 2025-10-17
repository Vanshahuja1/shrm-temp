"use client"

import { useState, useEffect } from "react"
import { Edit, Save, History, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/lib/axiosInstance"

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
  status: string
  attendanceData?: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    halfDays: number
    overtimeHours: number
    lateComings: number
  }
  editHistory?: Array<{
    field: string
    oldValue: unknown
    newValue: unknown
    editedBy: string
    editedAt: string
  }>
  remarks?: string
}

interface PayslipEditProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payslip: EmployeePayroll | null
  onPayslipUpdated: () => void
  hrId: string
}

export default function PayslipEditDialog({ open, onOpenChange, payslip, onPayslipUpdated, hrId }: PayslipEditProps) {
  const [editedPayslip, setEditedPayslip] = useState<EmployeePayroll | null>(null)
  const [remarks, setRemarks] = useState("")
  const [saving, setSaving] = useState(false)
  const [editHistory, setEditHistory] = useState<
    Array<{
      field: string
      oldValue: unknown
      newValue: unknown
      editedBy: string
      editedAt: string
    }>
  >([])
  const [activeTab, setActiveTab] = useState("earnings")

  useEffect(() => {
    const fetchEditHistory = async () => {
      if (!payslip?._id) return

      try {
        const response = await axiosInstance.get(`/payroll/history/${payslip._id}`)
        if (response.data.success) {
          setEditHistory(response.data.data.editHistory || [])
        }
      } catch (error) {
        console.error("Error fetching edit history:", error)
      }
    }

    if (open && payslip) {
      setEditedPayslip({ ...payslip })
      setRemarks(payslip.remarks || "")
      fetchEditHistory()
    }
  }, [open, payslip])

  const handleEarningsChange = (field: string, value: string) => {
    if (!editedPayslip) return

    const numValue = Number.parseFloat(value) || 0
    setEditedPayslip((prev) => ({
      ...prev!,
      earnings: {
        ...prev!.earnings,
        [field]: numValue,
      },
    }))
  }

  const handleDeductionsChange = (field: string, value: string) => {
    if (!editedPayslip) return

    const numValue = Number.parseFloat(value) || 0
    setEditedPayslip((prev) => ({
      ...prev!,
      deductions: {
        ...prev!.deductions,
        [field]: numValue,
      },
    }))
  }

  const calculateTotals = () => {
    if (!editedPayslip) return { totalEarnings: 0, totalDeductions: 0, netPay: 0 }

    const totalEarnings = Object.values(editedPayslip.earnings).reduce((sum, val) => sum + (val || 0), 0)
    const totalDeductions = Object.values(editedPayslip.deductions).reduce((sum, val) => sum + (val || 0), 0)
    const netPay = totalEarnings - totalDeductions

    return { totalEarnings, totalDeductions, netPay }
  }

  const handleSave = async () => {
    if (!editedPayslip || !payslip) return

    try {
      setSaving(true)

      // Prepare edited fields
      const editedFields: Record<string, unknown> = {}

      // Check earnings changes
      Object.keys(editedPayslip.earnings).forEach((key) => {
        const earningsKey = key as keyof typeof editedPayslip.earnings
        if (editedPayslip.earnings[earningsKey] !== payslip.earnings[earningsKey]) {
          editedFields[`earnings.${key}`] = editedPayslip.earnings[earningsKey]
        }
      })

      // Check deductions changes
      Object.keys(editedPayslip.deductions).forEach((key) => {
        const deductionsKey = key as keyof typeof editedPayslip.deductions
        if (editedPayslip.deductions[deductionsKey] !== payslip.deductions[deductionsKey]) {
          editedFields[`deductions.${key}`] = editedPayslip.deductions[deductionsKey]
        }
      })

      if (Object.keys(editedFields).length === 0 && remarks === (payslip.remarks || "")) {
        alert("No changes detected")
        return
      }

      const response = await axiosInstance.put(`/payroll/edit/${payslip._id}`, {
        editedFields,
        remarks: remarks !== (payslip.remarks || "") ? remarks : undefined,
        hrUserId: hrId,
      })

      if (response.data.success) {
        onPayslipUpdated()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error saving payslip:", error)
      alert("Error saving payslip. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  if (!editedPayslip) return null

  const { totalEarnings, totalDeductions, netPay } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[65vw] h-[90vh] flex flex-col ">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Edit size={20} />
            Edit Payslip - {editedPayslip.name}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Period: {editedPayslip.payrollPeriod.label}</span>
            <span>Employee ID: {editedPayslip.employeeId}</span>
            <Badge variant="outline">{editedPayslip.status}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="history">Edit History</TabsTrigger>
            </TabsList>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="flex-1 overflow-y-scroll mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="basicSalary">Basic Salary</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        value={editedPayslip.earnings.basicSalary}
                        onChange={(e) => handleEarningsChange("basicSalary", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hra">HRA</Label>
                      <Input
                        id="hra"
                        type="number"
                        value={editedPayslip.earnings.hra}
                        onChange={(e) => handleEarningsChange("hra", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
                      <Input
                        id="conveyanceAllowance"
                        type="number"
                        value={editedPayslip.earnings.conveyanceAllowance}
                        onChange={(e) => handleEarningsChange("conveyanceAllowance", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                      <Input
                        id="medicalAllowance"
                        type="number"
                        value={editedPayslip.earnings.medicalAllowance}
                        onChange={(e) => handleEarningsChange("medicalAllowance", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialAllowance">Special Allowance</Label>
                      <Input
                        id="specialAllowance"
                        type="number"
                        value={editedPayslip.earnings.specialAllowance}
                        onChange={(e) => handleEarningsChange("specialAllowance", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bonus">Bonus</Label>
                      <Input
                        id="bonus"
                        type="number"
                        value={editedPayslip.earnings.bonus}
                        onChange={(e) => handleEarningsChange("bonus", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="overtime">Overtime</Label>
                      <Input
                        id="overtime"
                        type="number"
                        value={editedPayslip.earnings.overtime}
                        onChange={(e) => handleEarningsChange("overtime", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arrears">Arrears</Label>
                      <Input
                        id="arrears"
                        type="number"
                        value={editedPayslip.earnings.arrears}
                        onChange={(e) => handleEarningsChange("arrears", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherEarnings">Other Earnings</Label>
                      <Input
                        id="otherEarnings"
                        type="number"
                        value={editedPayslip.earnings.otherEarnings}
                        onChange={(e) => handleEarningsChange("otherEarnings", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">Total Earnings: {formatCurrency(totalEarnings)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deductions Tab */}
            <TabsContent value="deductions" className="flex-1 overflow-y-auto mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deductions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="pf">Provident Fund (PF)</Label>
                      <Input
                        id="pf"
                        type="number"
                        value={editedPayslip.deductions.pf}
                        onChange={(e) => handleDeductionsChange("pf", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="esi">ESI</Label>
                      <Input
                        id="esi"
                        type="number"
                        value={editedPayslip.deductions.esi}
                        onChange={(e) => handleDeductionsChange("esi", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="professionalTax">Professional Tax</Label>
                      <Input
                        id="professionalTax"
                        type="number"
                        value={editedPayslip.deductions.professionalTax}
                        onChange={(e) => handleDeductionsChange("professionalTax", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tds">TDS</Label>
                      <Input
                        id="tds"
                        type="number"
                        value={editedPayslip.deductions.tds}
                        onChange={(e) => handleDeductionsChange("tds", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loanDeduction">Loan Deduction</Label>
                      <Input
                        id="loanDeduction"
                        type="number"
                        value={editedPayslip.deductions.loanDeduction}
                        onChange={(e) => handleDeductionsChange("loanDeduction", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="leaveDeduction">Leave Deduction</Label>
                      <Input
                        id="leaveDeduction"
                        type="number"
                        value={editedPayslip.deductions.leaveDeduction}
                        onChange={(e) => handleDeductionsChange("leaveDeduction", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attendanceDeduction">Attendance Deduction</Label>
                      <Input
                        id="attendanceDeduction"
                        type="number"
                        value={editedPayslip.deductions.attendanceDeduction}
                        onChange={(e) => handleDeductionsChange("attendanceDeduction", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherDeductions">Other Deductions</Label>
                      <Input
                        id="otherDeductions"
                        type="number"
                        value={editedPayslip.deductions.otherDeductions}
                        onChange={(e) => handleDeductionsChange("otherDeductions", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800">Total Deductions: {formatCurrency(totalDeductions)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="flex-1 overflow-y-auto max-h-[60vh]  mt-4">
              <div className="space-y-4">
                {/* Attendance Info */}
                {editedPayslip.attendanceData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator size={16} />
                        Attendance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Working Days</p>
                          <p className="font-medium">{editedPayslip.attendanceData.totalWorkingDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Present Days</p>
                          <p className="font-medium text-green-600">{editedPayslip.attendanceData.presentDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Absent Days</p>
                          <p className="font-medium text-red-600">{editedPayslip.attendanceData.absentDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Half Days</p>
                          <p className="font-medium text-yellow-600">{editedPayslip.attendanceData.halfDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Overtime Hours</p>
                          <p className="font-medium text-blue-600">{editedPayslip.attendanceData.overtimeHours}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Late Comings</p>
                          <p className="font-medium text-orange-600">{editedPayslip.attendanceData.lateComings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Total Earnings</span>
                        <span className="font-bold text-green-600">{formatCurrency(totalEarnings)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="font-medium">Total Deductions</span>
                        <span className="font-bold text-red-600">{formatCurrency(totalDeductions)}</span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <span className="font-bold text-lg">Net Pay</span>
                        <span className="font-bold text-xl text-blue-600">{formatCurrency(netPay)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Remarks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add any remarks or notes about this payslip..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Edit History Tab */}
            <TabsContent value="history" className="flex-1 overflow-y-auto mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History size={16} />
                    Edit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-gray-500">No edit history available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editHistory.map((edit, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{edit.field}</span>
                            <span className="text-sm text-gray-500">{formatDateTime(edit.editedAt)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-red-600">Old: {String(edit.oldValue)}</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">New: {String(edit.newValue)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Edited by: {edit.editedBy}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
