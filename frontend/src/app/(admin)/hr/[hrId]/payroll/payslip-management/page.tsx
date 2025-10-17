"use client";
import axios from '@/lib/axiosInstance';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Edit, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Search,
  Plus,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axiosInstance";
import PayslipGeneratorDialog from "./PayslipGeneratorDialog";
import PayslipEditDialog from "./PayslipEditDialog";
import PayslipStatusDialog from "./PayslipStatusDialog";
import PayslipPreviewModal from "./PayslipPreviewModal";

interface Department {
  _id: string
  name: string
  organizationId: string
  head?: string
}
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
  editHistory?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
    editedBy: string;
    editedAt: string;
  }>;
  remarks?: string;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PayslipCounts {
  total: number;
  draft: number;
  in_process: number;
  pending: number;
  paid: number;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  in_process: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800"
};

const statusIcons = {
  draft: <Edit size={14} />,
  in_process: <Clock size={14} />,
  pending: <RefreshCw size={14} />,
  paid: <CheckCircle size={14} />
};

export default function HRPayslipManagement() {
  const params = useParams();
  const [payslips, setPayslips] = useState<EmployeePayroll[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<EmployeePayroll[]>([]);
  const [counts, setCounts] = useState<PayslipCounts>({
    total: 0, draft: 0, in_process: 0, pending: 0, paid: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  
  // Dialogs
  const [showGenerator, setShowGenerator] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayroll | null>(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<unknown>(null);

  const fetchDepartmentsByOrganization = async () => {
    

    try {
      const response = await axiosInstance.get(`/departments?organizationId=6889a9394f263f6b1e23a7e2`)

      if (response.data.success) {
        setDepartments(response.data.data)

      } else {
        setDepartments([])
      }
    } catch (error: unknown) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    } 
  }
  useEffect(() => {
      fetchPayslips();
      fetchDepartmentsByOrganization();
  }, []);

  useEffect(() => {
    const filterPayslips = () => {
      let filtered = [...payslips];

      // Status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(payslip => payslip.status === statusFilter);
      }

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(payslip =>
          payslip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payslip.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payslip.employee?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Department filter
      if (departmentFilter !== "all") {
        filtered = filtered.filter(payslip => payslip.departmentName === departmentFilter);
      }

      setFilteredPayslips(filtered);
    };

    filterPayslips();
  }, [payslips, statusFilter, searchQuery, departmentFilter]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/payroll/by-status');
      
      if (response.data.success) {
        setPayslips(response.data.data.all);
        setCounts(response.data.data.counts);
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedPayslips.length === 0) return;

    try {
      const response = await axiosInstance.put('/payroll/bulk-status', {
        payslipIds: selectedPayslips,
        status,
        hrUserId: params.hrId
      });

      if (response.data.success) {
        await fetchPayslips();
        setSelectedPayslips([]);
      }
    } catch (error) {
      console.error('Error updating payslip statuses:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedPayslips.length === filteredPayslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(filteredPayslips.map(p => p._id));
    }
  };

  const handleSelectPayslip = (payslipId: string) => {
    setSelectedPayslips(prev =>
      prev.includes(payslipId)
        ? prev.filter(id => id !== payslipId)
        : [...prev, payslipId]
    );
  };

  const handlePreviewPayslip = async (payslip: EmployeePayroll) => {
    try {
      setGeneratingPDF(payslip._id);
      
      // Fetch employee details for preview
      const response = await axios.get(`/user/${payslip.employeeId}`);
      const employee = response.data.data;
      
      // Set data for preview modal
      setSelectedPayslip(payslip);
      setSelectedEmployeeDetails(employee);
      setShowPreview(true);
      
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Error fetching employee details. Please try again.');
    } finally {
      setGeneratingPDF(null);
    }
  };

  
  const formatCurrency = (amount: number) => {
    return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin" size={24} />
        <span className="ml-2">Loading payslips...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HR Payslip Management</h1>
          <p className="text-gray-600">Manage employee payslips and attendance-based calculations</p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Generate Payslip
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payslips</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
              <DollarSign className="text-gray-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{counts.draft}</p>
              </div>
              <Edit className="text-gray-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Process</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.in_process}</p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{counts.pending}</p>
              </div>
              <RefreshCw className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{counts.paid}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_process">In Process</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.name} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchPayslips}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPayslips.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedPayslips.length} payslip(s) selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('in_process')}
                >
                  Mark In Process
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('pending')}
                >
                  Mark Pending
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('paid')}
                  className="text-green-600"
                >
                  Mark Paid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payslips ({filteredPayslips.length})</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPayslips.includes(payslip._id)}
                      onChange={() => handleSelectPayslip(payslip._id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payslip.name}</div>
                      <div className="text-sm text-gray-500">{payslip.employeeId}</div>
                      <div className="text-sm text-gray-500">{payslip.employee?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payslip.departmentName}</div>
                      
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payslip.payrollPeriod.label}</div>
                      <div className="text-sm text-gray-500">{payslip.payrollPeriod.range}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payslip.attendanceData ? (
                      <div>
                        <div className="font-medium">{payslip.payableDays}</div>
                        <div className="text-sm text-gray-500">
                          {payslip.attendanceData.overtimeHours > 0 && 
                            `OT: ${payslip.attendanceData.overtimeHours}h`
                          }
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payslip.totalEarnings)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(payslip.totalDeductions)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(payslip.netPay)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[payslip.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[payslip.status]}
                        {payslip.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPayslip(payslip);
                          setShowEditor(true);
                        }}
                        title="Edit Payslip"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPayslip(payslip);
                          setShowStatusDialog(true);
                        }}
                        title="Update Status"
                      >
                        <RefreshCw size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewPayslip(payslip)}
                        disabled={generatingPDF === payslip._id}
                        title="Preview & Export Payslip"
                      >
                        {generatingPDF === payslip._id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <FileText size={14} />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayslips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payslips found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PayslipGeneratorDialog
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onPayslipGenerated={fetchPayslips}
        hrId={params.hrId as string}
      />

      <PayslipEditDialog
        open={showEditor}
        onOpenChange={setShowEditor}
        payslip={selectedPayslip}
        onPayslipUpdated={fetchPayslips}
        hrId={params.hrId as string}
      />

      <PayslipStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        payslip={selectedPayslip}
        onStatusUpdated={fetchPayslips}
        hrId={params.hrId as string}
      />

      <PayslipPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        payslip={selectedPayslip}
        employeeDetails={selectedEmployeeDetails}
      />
    </div>
  );
}
