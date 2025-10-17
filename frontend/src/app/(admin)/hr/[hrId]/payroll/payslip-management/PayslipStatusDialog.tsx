"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, Clock, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/lib/axiosInstance";

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
  };
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'in_process' | 'pending' | 'paid';
  remarks?: string;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
}

interface PayslipStatusProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: EmployeePayroll | null;
  onStatusUpdated: () => void;
  hrId: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    icon: <Edit size={16} />,
    color: "bg-gray-100 text-gray-800",
    description: "Payslip is in draft mode and can be edited"
  },
  in_process: {
    label: "In Process", 
    icon: <Clock size={16} />,
    color: "bg-yellow-100 text-yellow-800",
    description: "Payslip is being processed"
  },
  pending: {
    label: "Pending Approval",
    icon: <RefreshCw size={16} />,
    color: "bg-blue-100 text-blue-800", 
    description: "Payslip is waiting for final approval"
  },
  paid: {
    label: "Paid",
    icon: <CheckCircle size={16} />,
    color: "bg-green-100 text-green-800",
    description: "Payment has been completed"
  }
};

const statusTransitions = {
  draft: ['in_process'],
  in_process: ['pending', 'draft'],
  pending: ['paid', 'in_process'], 
  paid: [] // Cannot change from paid
};

export default function PayslipStatusDialog({
  open,
  onOpenChange,
  payslip,
  onStatusUpdated,
  hrId
}: PayslipStatusProps) {
  const [newStatus, setNewStatus] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!payslip) return null;

  const currentStatus = payslip.status;
  const allowedTransitions = statusTransitions[currentStatus] || [];

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert('Please select a new status');
      return;
    }

    try {
      setUpdating(true);
      
      const response = await axiosInstance.put(`/payroll/status/${payslip._id}`, {
        status: newStatus,
        remarks: remarks || undefined,
        hrUserId: hrId
      });

      if (response.data.success) {
        onStatusUpdated();
        onOpenChange(false);
        setNewStatus("");
        setRemarks("");
      }
    } catch (error) {
      console.error('Error updating payslip status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
  return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(amount)}`
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[65vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw size={20} />
            Update Payslip Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{payslip.name}</p>
                  <p className="text-sm text-gray-600">{payslip.employee?.email}</p>
                  <p className="text-sm text-gray-600">{payslip.employee?.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period: {payslip.payrollPeriod.label}</p>
                  <p className="text-sm text-gray-600">Range: {payslip.payrollPeriod.range}</p>
                  <p className="text-sm text-gray-600">Employee ID: {payslip.employeeId}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Gross Pay</p>
                    <p className="font-bold text-green-600">{formatCurrency(payslip.totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deductions</p>
                    <p className="font-bold text-red-600">{formatCurrency(payslip.totalDeductions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Pay</p>
                    <p className="font-bold text-blue-600">{formatCurrency(payslip.netPay)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={statusConfig[currentStatus].color}>
                  <span className="flex items-center gap-1">
                    {statusConfig[currentStatus].icon}
                    {statusConfig[currentStatus].label}
                  </span>
                </Badge>
                <span className="text-sm text-gray-600">
                  {statusConfig[currentStatus].description}
                </span>
              </div>

              {/* Status Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Processed At:</p>
                  <p className="font-medium">{formatDateTime(payslip.processedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Approved At:</p>
                  <p className="font-medium">{formatDateTime(payslip.approvedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Paid At:</p>
                  <p className="font-medium">{formatDateTime(payslip.paidAt)}</p>
                </div>
              </div>

              {payslip.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Current Remarks:</p>
                  <p className="text-sm mt-1">{payslip.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allowedTransitions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {currentStatus === 'paid' 
                      ? "This payslip is marked as paid and cannot be changed."
                      : "No status transitions are available for the current status."}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div>
                    <Label htmlFor="newStatus">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              {statusConfig[status as keyof typeof statusConfig].icon}
                              {statusConfig[status as keyof typeof statusConfig].label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Status Change:</strong> {statusConfig[currentStatus].label} → {statusConfig[newStatus as keyof typeof statusConfig].label}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {statusConfig[newStatus as keyof typeof statusConfig].description}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Add any remarks about this status change..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Flow Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                <span>→</span>
                <Badge className="bg-yellow-100 text-yellow-800">In Process</Badge>
                <span>→</span>
                <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
                <span>→</span>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                Payslips follow this workflow. You can move backward except from Paid status.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          {allowedTransitions.length > 0 && (
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              {updating ? "Updating..." : "Update Status"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
