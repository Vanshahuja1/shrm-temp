"use client";

import { useState, useEffect } from "react";
import { Calendar, User, DollarSign, Plus, Minus, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axiosInstance";

interface Employee {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  designation: string;
  salary: number;
  role: string;
}

interface PayslipGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayslipGenerated: () => void;
  hrId: string;
}

export default function PayslipGeneratorDialog({
  open,
  onOpenChange,
  onPayslipGenerated,
  hrId
}: PayslipGeneratorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("employee");

  // Custom adjustments
  const [customAdjustments, setCustomAdjustments] = useState({
    earnings: {
      basicSalary: 0,
      hra: 0,
      conveyanceAllowance: 0,
      medicalAllowance: 0,
      specialAllowance: 0,
      bonus: 0,
      overtime: 0,
      arrears: 0,
      otherEarnings: 0
    },
    deductions: {
      pf: 0,
      esi: 0,
      professionalTax: 0,
      tds: 0,
      loanDeduction: 0,
      leaveDeduction: 0,
      attendanceDeduction: 0,
      otherDeductions: 0
    }
  });

  const [allowanceConfig, setAllowanceConfig] = useState({
    hra: { enabled: false, method: 'percentage' as 'percentage' | 'fixed', value: 0 },
    conveyance: { enabled: false, method: 'fixed' as 'percentage' | 'fixed', value: 0 },
    medical: { enabled: false, method: 'fixed' as 'percentage' | 'fixed', value: 0 },
    special: { enabled: false, method: 'percentage' as 'percentage' | 'fixed', value: 0 }
  });

  const [attendanceConfig, setAttendanceConfig] = useState({
    enabled: true, // Default to enabled for attendance-based deductions
    includeLatePenalty: true // Whether to include late coming penalty
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      // Set default dates: 1st of current month to current date
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentDate = new Date(); // Today's date
      
      setStartDate(startOfMonth.toISOString().split('T')[0]);
      setEndDate(currentDate.toISOString().split('T')[0]);
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/user');
      
      if (response.data.success) {
        setEmployees(response.data.data.filter((user: Employee) => 
          user.role !== 'admin' && user.salary > 0
        ));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee || !startDate || !endDate) {
      alert('Please select an employee and date range');
      return;
    }

    try {
      setGenerating(true);
      
      // Filter out zero values to allow automatic calculations
      const filteredCustomAdjustments = {
        earnings: Object.fromEntries(
          Object.entries(customAdjustments.earnings).filter(([, value]) => value > 0)
        ),
        deductions: Object.fromEntries(
          Object.entries(customAdjustments.deductions).filter(([, value]) => value > 0)
        )
      };
      
      const response = await axiosInstance.post('/payroll/generate-attendance-payslip', {
        employeeId: selectedEmployee.id,
        startDate,
        endDate,
        customAdjustments: filteredCustomAdjustments,
        allowanceConfig,
        attendanceConfig,
        hrUserId: hrId
      });

      if (response.data.success) {
        onPayslipGenerated();
        onOpenChange(false);
        
        // Reset form
        setSelectedEmployee(null);
        setActiveTab("employee");
        setCustomAdjustments({
          earnings: { 
            basicSalary: 0,
            hra: 0,
            conveyanceAllowance: 0,
            medicalAllowance: 0,
            specialAllowance: 0,
            bonus: 0,
            overtime: 0,
            arrears: 0,
            otherEarnings: 0
          },
          deductions: { 
            pf: 0,
            esi: 0,
            professionalTax: 0,
            tds: 0,
            loanDeduction: 0,
            leaveDeduction: 0,
            attendanceDeduction: 0,
            otherDeductions: 0
          }
        });
        setAllowanceConfig({
          hra: { enabled: false, method: 'percentage', value: 0 },
          conveyance: { enabled: false, method: 'fixed', value: 0 },
          medical: { enabled: false, method: 'fixed', value: 0 },
          special: { enabled: false, method: 'percentage', value: 0 }
        });
        setAttendanceConfig({
          enabled: true,
          includeLatePenalty: true
        });
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      alert('Error generating payslip. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const updateCustomAdjustment = (category: 'earnings' | 'deductions', field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAdjustments(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }));
  };

  const formatCurrency = (amount: number) => {
   return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  };

  const getTotalEarnings = () => {
    return Object.values(customAdjustments.earnings).reduce((sum, val) => sum + val, 0);
  };

  const getTotalDeductions = () => {
    return Object.values(customAdjustments.deductions).reduce((sum, val) => sum + val, 0);
  };

  const getActiveAdjustments = () => {
    const activeEarnings = Object.entries(customAdjustments.earnings).filter(([, value]) => value > 0).length;
    const activeDeductions = Object.entries(customAdjustments.deductions).filter(([, value]) => value > 0).length;
    return { activeEarnings, activeDeductions };
  };

  const { activeEarnings, activeDeductions } = getActiveAdjustments();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[80vw] h-[90vh] max-w-6xl overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            Generate Attendance-Based Payslip
          </DialogTitle>
          <p className="text-muted-foreground">
            Create detailed payslips based on actual attendance data and custom adjustments
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-6 flex-shrink-0">
              <TabsTrigger value="employee" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee & Period
                {selectedEmployee && (
                  <Badge variant="secondary" className="ml-1">✓</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Earnings
                {activeEarnings > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeEarnings}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="deductions" className="flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Deductions
                {activeDeductions > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeDeductions}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="allowances" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Allowances
                {Object.values(allowanceConfig).filter(config => config.enabled).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(allowanceConfig).filter(config => config.enabled).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance
                {attendanceConfig.enabled && (
                  <Badge variant="secondary" className="ml-1">✓</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              <TabsContent value="employee" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Employee Selection */}
                  <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Employee Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 ">
                      <div>
                        <Label htmlFor="employee" className="text-sm font-medium">Select Employee</Label>
                        <Select
                          onValueChange={(value) => {
                            const employee = employees.find(emp => emp.id === value);
                            setSelectedEmployee(employee || null);
                          }}
                          value={selectedEmployee?.id || ""}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose an employee..." />
                          </SelectTrigger>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                            ) : (
                              employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">{employee.name}</span>
                                    <span className="text-sm text-gray-500">
                                      {employee.departmentName} • {formatCurrency(employee.salary)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedEmployee && (
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                          <CardContent className="pt-4">
                            <h4 className="font-semibold mb-3 text-blue-900">Employee Details</h4>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="text-sm font-medium">{selectedEmployee.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-medium">{selectedEmployee.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Department:</span>
                                <span className="text-sm font-medium">{selectedEmployee.departmentName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Designation:</span>
                                <span className="text-sm font-medium">{selectedEmployee.designation}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-blue-700">Base Salary:</span>
                                <span className="text-sm font-bold text-blue-800">{formatCurrency(selectedEmployee.salary)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>

                  {/* Date Range */}
                  <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Payroll Period
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          max={ new Date().toISOString().split('T')[0]} 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {startDate && endDate && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  Payslip will be calculated based on actual attendance data for this period
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="earnings" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-green-600" />
                        Custom Earnings Adjustments
                      </CardTitle>
                      {getTotalEarnings() > 0 && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          Total: {formatCurrency(getTotalEarnings())}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add extra earnings that will be included in the payslip calculation
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bonus" className="text-sm font-medium">Performance Bonus</Label>
                        <Input
                          id="bonus"
                          type="number"
                          placeholder="0"
                          value={customAdjustments.earnings.bonus || ""}
                          onChange={(e) => updateCustomAdjustment('earnings', 'bonus', e.target.value)}
                          className="text-right"
                        />
                        <p className="text-xs text-muted-foreground">Monthly performance incentive</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="arrears" className="text-sm font-medium">Salary Arrears</Label>
                        <Input
                          id="arrears"
                          type="number"
                          placeholder="0"
                          value={customAdjustments.earnings.arrears || ""}
                          onChange={(e) => updateCustomAdjustment('earnings', 'arrears', e.target.value)}
                          className="text-right"
                        />
                        <p className="text-xs text-muted-foreground">Previous month adjustments</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otherEarnings" className="text-sm font-medium">Other Earnings</Label>
                        <Input
                          id="otherEarnings"
                          type="number"
                          placeholder="0"
                          value={customAdjustments.earnings.otherEarnings || ""}
                          onChange={(e) => updateCustomAdjustment('earnings', 'otherEarnings', e.target.value)}
                          className="text-right"
                        />
                        <p className="text-xs text-muted-foreground">Special allowances, reimbursements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deductions" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Minus className="h-5 w-5 text-red-600" />
                        Deduction Adjustments
                      </CardTitle>
                      {getTotalDeductions() > 0 && (
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          Total: {formatCurrency(getTotalDeductions())}
                        </Badge>
                      )}
                    </div>
                    {/* <div className="flex items-start gap-2 mt-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground font-semibold">
                        All deduction values must be entered . <br />
                        <span className="text-red-600 font-bold">No automatic calculations are performed for deductions.</span>
                      </p>
                    </div> */}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4 text-orange-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Statutory Deductions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pf" className="text-sm font-medium">PF (Provident Fund)</Label>
                            <Input
                              id="pf"
                              type="number"
                              placeholder="Enter amount "
                              value={customAdjustments.deductions.pf || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'pf', e.target.value)}
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="esi" className="text-sm font-medium">ESI</Label>
                            <Input
                              id="esi"
                              type="number"
                              placeholder="Enter amount "
                              value={customAdjustments.deductions.esi || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'esi', e.target.value)}
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="professionalTax" className="text-sm font-medium">Professional Tax</Label>
                            <Input
                              id="professionalTax"
                              type="number"
                              placeholder="Enter amount "
                              value={customAdjustments.deductions.professionalTax || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'professionalTax', e.target.value)}
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tds" className="text-sm font-medium">TDS</Label>
                            <Input
                              id="tds"
                              type="number"
                              placeholder="Enter amount "
                              value={customAdjustments.deductions.tds || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'tds', e.target.value)}
                              className="text-right"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-4 text-purple-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Other Deductions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="loanDeduction" className="text-sm font-medium">Loan Deduction</Label>
                            <Input
                              id="loanDeduction"
                              type="number"
                              placeholder="Enter amount"
                              value={customAdjustments.deductions.loanDeduction || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'loanDeduction', e.target.value)}
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="leaveDeduction" className="text-sm font-medium">Leave Deduction</Label>
                            <Input
                              id="leaveDeduction"
                              type="number"
                              placeholder="Enter amount"
                              value={customAdjustments.deductions.leaveDeduction || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'leaveDeduction', e.target.value)}
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="otherDeductions" className="text-sm font-medium">Other Deductions</Label>
                            <Input
                              id="otherDeductions"
                              type="number"
                              placeholder="Enter amount"
                              value={customAdjustments.deductions.otherDeductions || ""}
                              onChange={(e) => updateCustomAdjustment('deductions', 'otherDeductions', e.target.value)}
                              className="text-right"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="allowances" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Allowance Configuration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic allowance calculations for the payslip
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* HRA Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">House Rent Allowance (HRA)</Label>
                            <p className="text-xs text-muted-foreground">Commonly 40-50% of basic salary in metro cities</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="hra-enabled" className="text-sm">Enable</Label>
                            <input
                              id="hra-enabled"
                              type="checkbox"
                              checked={allowanceConfig.hra.enabled}
                              onChange={(e) => setAllowanceConfig(prev => ({
                                ...prev,
                                hra: { ...prev.hra, enabled: e.target.checked }
                              }))}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        {allowanceConfig.hra.enabled && (
                          <div className="grid grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <Label className="text-sm">Calculation Method</Label>
                              <Select
                                value={allowanceConfig.hra.method}
                                onValueChange={(value: 'percentage' | 'fixed') => 
                                  setAllowanceConfig(prev => ({
                                    ...prev,
                                    hra: { ...prev.hra, method: value }
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage of Basic Salary</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">
                                {allowanceConfig.hra.method === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                              </Label>
                              <Input
                                type="number"
                                placeholder={allowanceConfig.hra.method === 'percentage' ? '40' : '10000'}
                                value={allowanceConfig.hra.value || ''}
                                onChange={(e) => setAllowanceConfig(prev => ({
                                  ...prev,
                                  hra: { ...prev.hra, value: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Conveyance Allowance Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Conveyance Allowance</Label>
                            <p className="text-xs text-muted-foreground">Transportation allowance, typically ₹1,600-₹2,000 per month</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="conveyance-enabled" className="text-sm">Enable</Label>
                            <input
                              id="conveyance-enabled"
                              type="checkbox"
                              checked={allowanceConfig.conveyance.enabled}
                              onChange={(e) => setAllowanceConfig(prev => ({
                                ...prev,
                                conveyance: { ...prev.conveyance, enabled: e.target.checked }
                              }))}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        {allowanceConfig.conveyance.enabled && (
                          <div className="grid grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <Label className="text-sm">Calculation Method</Label>
                              <Select
                                value={allowanceConfig.conveyance.method}
                                onValueChange={(value: 'percentage' | 'fixed') => 
                                  setAllowanceConfig(prev => ({
                                    ...prev,
                                    conveyance: { ...prev.conveyance, method: value }
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage of Basic Salary</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">
                                {allowanceConfig.conveyance.method === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                              </Label>
                              <Input
                                type="number"
                                placeholder={allowanceConfig.conveyance.method === 'percentage' ? '5' : '1600'}
                                value={allowanceConfig.conveyance.value || ''}
                                onChange={(e) => setAllowanceConfig(prev => ({
                                  ...prev,
                                  conveyance: { ...prev.conveyance, value: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Medical Allowance Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Medical Allowance</Label>
                            <p className="text-xs text-muted-foreground">Healthcare allowance, typically ₹1,000-₹1,500 per month</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="medical-enabled" className="text-sm">Enable</Label>
                            <input
                              id="medical-enabled"
                              type="checkbox"
                              checked={allowanceConfig.medical.enabled}
                              onChange={(e) => setAllowanceConfig(prev => ({
                                ...prev,
                                medical: { ...prev.medical, enabled: e.target.checked }
                              }))}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        {allowanceConfig.medical.enabled && (
                          <div className="grid grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <Label className="text-sm">Calculation Method</Label>
                              <Select
                                value={allowanceConfig.medical.method}
                                onValueChange={(value: 'percentage' | 'fixed') => 
                                  setAllowanceConfig(prev => ({
                                    ...prev,
                                    medical: { ...prev.medical, method: value }
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage of Basic Salary</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">
                                {allowanceConfig.medical.method === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                              </Label>
                              <Input
                                type="number"
                                placeholder={allowanceConfig.medical.method === 'percentage' ? '3' : '1250'}
                                value={allowanceConfig.medical.value || ''}
                                onChange={(e) => setAllowanceConfig(prev => ({
                                  ...prev,
                                  medical: { ...prev.medical, value: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Special Allowance Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Special Allowance</Label>
                            <p className="text-xs text-muted-foreground">Additional allowance, varies by company policy</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="special-enabled" className="text-sm">Enable</Label>
                            <input
                              id="special-enabled"
                              type="checkbox"
                              checked={allowanceConfig.special.enabled}
                              onChange={(e) => setAllowanceConfig(prev => ({
                                ...prev,
                                special: { ...prev.special, enabled: e.target.checked }
                              }))}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        {allowanceConfig.special.enabled && (
                          <div className="grid grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <Label className="text-sm">Calculation Method</Label>
                              <Select
                                value={allowanceConfig.special.method}
                                onValueChange={(value: 'percentage' | 'fixed') => 
                                  setAllowanceConfig(prev => ({
                                    ...prev,
                                    special: { ...prev.special, method: value }
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage of Basic Salary</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">
                                {allowanceConfig.special.method === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                              </Label>
                              <Input
                                type="number"
                                placeholder={allowanceConfig.special.method === 'percentage' ? '10' : '5000'}
                                value={allowanceConfig.special.value || ''}
                                onChange={(e) => setAllowanceConfig(prev => ({
                                  ...prev,
                                  special: { ...prev.special, value: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary of configured allowances */}
                      {Object.values(allowanceConfig).some(config => config.enabled) && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Configured Allowances Summary</h4>
                          <div className="space-y-1 text-sm text-blue-800">
                            {allowanceConfig.hra.enabled && (
                              <div>• HRA: {allowanceConfig.hra.method === 'percentage' ? `${allowanceConfig.hra.value}% of basic salary` : `₹${allowanceConfig.hra.value} fixed`}</div>
                            )}
                            {allowanceConfig.conveyance.enabled && (
                              <div>• Conveyance: {allowanceConfig.conveyance.method === 'percentage' ? `${allowanceConfig.conveyance.value}% of basic salary` : `₹${allowanceConfig.conveyance.value} fixed`}</div>
                            )}
                            {allowanceConfig.medical.enabled && (
                              <div>• Medical: {allowanceConfig.medical.method === 'percentage' ? `${allowanceConfig.medical.value}% of basic salary` : `₹${allowanceConfig.medical.value} fixed`}</div>
                            )}
                            {allowanceConfig.special.enabled && (
                              <div>• Special: {allowanceConfig.special.method === 'percentage' ? `${allowanceConfig.special.value}% of basic salary` : `₹${allowanceConfig.special.value} fixed`}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Attendance-Based Deduction Settings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure whether to apply deductions based on employee attendance
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      {/* Attendance Deduction Toggle */}
                      <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={attendanceConfig.enabled}
                              onChange={(e) => setAttendanceConfig(prev => ({
                                ...prev,
                                enabled: e.target.checked
                              }))}
                              className="h-4 w-4"
                            />
                            <div>
                              <Label className="text-base font-medium">Enable Attendance-Based Deductions</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {attendanceConfig.enabled 
                                  ? "Deductions will be calculated based on absent days and late arrivals" 
                                  : "No attendance-based deductions will be applied regardless of attendance records"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Late Penalty Toggle (only when attendance deduction is enabled) */}
                      {attendanceConfig.enabled && (
                        <div className="space-y-4 ml-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={attendanceConfig.includeLatePenalty}
                              onChange={(e) => setAttendanceConfig(prev => ({
                                ...prev,
                                includeLatePenalty: e.target.checked
                              }))}
                              className="h-4 w-4"
                            />
                            <div>
                              <Label className="text-sm font-medium">Include Late Coming Penalty</Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Apply ₹100 penalty for each late coming instance
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Information Section */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-2">How Attendance Deductions Work</h4>
                            <div className="space-y-2 text-sm text-blue-800">
                              {attendanceConfig.enabled ? (
                                <>
                                  <div>• <strong>Absent Days:</strong> Per-day salary will be deducted for each absent day</div>
                                  <div>• <strong>Half Days:</strong> Half of per-day salary deducted for days with less than 4 hours</div>
                                  {attendanceConfig.includeLatePenalty && (
                                    <div>• <strong>Late Coming:</strong> ₹100 penalty for each late arrival</div>
                                  )}
                                  <div>• <strong>Calculation:</strong> Per-day salary = Monthly Salary ÷ 26 working days</div>
                                </>
                              ) : (
                                <>
                                  <div>• No automatic deductions based on attendance</div>
                                  <div>• You can still manually set attendance deduction in the Deductions tab</div>
                                  <div>• Useful for employees with flexible work arrangements</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configuration Status */}
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Current Configuration</h4>
                        <div className="space-y-1 text-sm text-slate-700">
                          <div className="flex justify-between">
                            <span>Attendance-Based Deductions:</span>
                            <span className={attendanceConfig.enabled ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {attendanceConfig.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                          {attendanceConfig.enabled && (
                            <div className="flex justify-between">
                              <span>Late Coming Penalty:</span>
                              <span className={attendanceConfig.includeLatePenalty ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                {attendanceConfig.includeLatePenalty ? "Included" : "Excluded"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Summary Section */}
        {(selectedEmployee || getTotalEarnings() > 0 || getTotalDeductions() > 0) && (
          <Card className="bg-gradient-to-r py-1 from-slate-50 to-gray-50 border-t-2 border-slate-200 flex-shrink-0">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-bold text-slate-700">
                    {selectedEmployee ? formatCurrency(selectedEmployee.salary) : '₹0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custom Earnings</p>
                  <p className="text-lg font-bold text-green-600">
                    +{formatCurrency(getTotalEarnings())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custom Deductions</p>
                  <p className="text-lg font-bold text-red-600">
                    -{formatCurrency(getTotalDeductions())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Net*</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(
                      (selectedEmployee?.salary || 0) + getTotalEarnings() - getTotalDeductions()
                    )}
                  </p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                *Actual amount may vary based on attendance and automatic calculations
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Automatic Calculations Include:</p>
            <p className="text-xs">HRA, Conveyance, Medical allowances • Attendance-based deductions • Standard statutory deductions</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generating}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePayslip}
              disabled={!selectedEmployee || !startDate || !endDate || generating}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8"
            >
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Generate Payslip
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}