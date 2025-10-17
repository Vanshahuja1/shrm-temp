"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tooltip as MuiTooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Download } from "lucide-react";
import { toast } from "react-hot-toast";

type Deduction = {
  id: number;
  name: string;
  organization: string;
  department: string;
  role: string;
  leaveType: string;
  leavePeriod: string;
  daysDeducted: number;
  amount: number;
  manager: string;
  reason: string;
};

const COLORS = [
  "#EF4444",
  "#F59E0B",
  "#3B82F6",
  "#10B981",
  "#6366F1",
  "#8B5CF6",
];

export default function LeaveDeductionsPage() {
  const router = useRouter();
  const [data, setData] = useState<Deduction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payroll/leave-deductions");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to fetch leave deduction data");
        setData([
          {
            id: 1,
            name: "Ayesha Khan",
            organization: "IT Solutions",
            department: "Engineering",
            role: "Frontend Developer",
            leaveType: "Leave Without Pay",
            leavePeriod: "June 10 - June 12",
            daysDeducted: 3,
            amount: 3600,
            manager: "Rajiv Kumar",
            reason: "Exhausted annual paid leave quota",
          },
          {
            id: 2,
            name: "Rohan Mehta",
            organization: "IT Solutions",
            department: "HR",
            role: "HR Manager",
            leaveType: "Medical Leave",
            leavePeriod: "June 5",
            daysDeducted: 1,
            amount: 1200,
            manager: "Anita Shah",
            reason: "Medical certificate submitted late",
          },
          {
            id: 3,
            name: "Neha Reddy",
            organization: "IT Solutions",
            department: "Sales",
            role: "Account Executive",
            leaveType: "Leave Without Pay",
            leavePeriod: "June 18 - June 19",
            daysDeducted: 2,
            amount: 2400,
            manager: "Rajat Verma",
            reason: "Uninformed leave",
          },
        ]);
      }
    };

    fetchData();
  }, []);

  const pieData = Object.values(
    data.reduce(
      (acc, cur) => {
        if (!acc[cur.leaveType])
          acc[cur.leaveType] = { name: cur.leaveType, value: 0 };
        acc[cur.leaveType].value += cur.amount;
        return acc;
      },
      {} as Record<string, { name: string; value: number }>
    )
  );
  const exportCSV = () => {
    const header = [
      "Name",
      "Organization",
      "Department",
      "Role",
      "Leave Type",
      "Period",
      "Days",
      "Amount (₹)",
      "Manager",
      "Reason",
    ];
    const rows = data.map((d) => [
      d.name,
      d.organization,
      d.department,
      d.role,
      d.leaveType,
      d.leavePeriod,
      d.daysDeducted,
      d.amount,
      d.manager,
      d.reason,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_deductions.csv";
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <button
        onClick={() => router.push("/hr/payroll")}
        className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Payroll
      </button>
      <div className="flex items-center justify-between">
        <Typography variant="h5" className="font-bold text-red-600">
          💸 Leave Deductions & Adjustments
        </Typography>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Deduction Breakdown by Leave Type" />
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Leave Deduction Summary Table" />
          <CardContent className="overflow-x-auto">
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Org/Dept</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Amount (₹)</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((d) => (
                    <TableRow key={d.id} className="hover:bg-yellow-50">
                      <TableCell>{d.name}</TableCell>
                      <TableCell>
                        <div>{d.organization}</div>
                        <div className="text-xs text-gray-500">
                          {d.department}
                        </div>
                      </TableCell>
                      <TableCell>{d.role}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={
                            d.leaveType === "Leave Without Pay"
                              ? "error"
                              : "primary"
                          }
                          label={d.leaveType}
                        />
                      </TableCell>
                      <TableCell>{d.leavePeriod}</TableCell>
                      <TableCell>{d.daysDeducted}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        ₹{d.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{d.manager}</TableCell>
                      <TableCell>
                        <MuiTooltip title={d.reason}>
                          <span className="line-clamp-1 text-xs text-gray-700">
                            {d.reason}
                          </span>
                        </MuiTooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
