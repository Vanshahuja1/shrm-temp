"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart4 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Arrear {
  id: number;
  name: string;
  department: string;
  type: "Arrear" | "Due";
  reason: string;
  period: string;
  amount: number;
  status: "Unpaid" | "Paid";
}

export default function ArrearsDuesPage() {
  const [data, setData] = useState<Arrear[]>([]);
  const router = useRouter();
  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Name", "Department", "Type", "Reason", "Period", "Amount", "Status"],
      ],
      body: data.map((d) => [
        d.name,
        d.department,
        d.type,
        d.reason,
        d.period,
        `₹${d.amount}`,
        d.status,
      ]),
    });
    doc.save("arrears_dues.pdf");
  };
  useEffect(() => {
    const fetchArrears = async () => {
      try {
        const res = await fetch("/api/payroll/arrears-dues");
        const json = await res.json();
        setData(json);
      } catch {
        setData([
          {
            id: 1,
            name: "Ayesha Khan",
            department: "Engineering",
            type: "Arrear",
            reason: "Unpaid Overtime",
            period: "May 2025",
            amount: 2200,
            status: "Unpaid",
          },
          {
            id: 2,
            name: "Rohan Mehta",
            department: "Sales",
            type: "Due",
            reason: "Missed Salary Adjustment",
            period: "April 2025",
            amount: 1500,
            status: "Paid",
          },
          {
            id: 3,
            name: "Neha Reddy",
            department: "HR",
            type: "Arrear",
            reason: "Bonus Recalculation",
            period: "March 2025",
            amount: 800,
            status: "Unpaid",
          },
        ]);
      }
    };

    fetchArrears();
  }, []);

  const totalUnpaid = data
    .filter((d) => d.status === "Unpaid")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = data
    .filter((d) => d.status === "Paid")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/hr/payroll")}>
          <ArrowLeft size={18} className="mr-2" /> Back to Payroll
        </Button>
        <h1 className="text-xl font-bold text-red-600">📌 Arrears & Dues</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 size={18} /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Paid</span>
              <span className="text-green-600 font-semibold">
                ₹{totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Unpaid</span>
              <span className="text-yellow-600 font-semibold">
                ₹{totalUnpaid.toLocaleString()}
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Unpaid", value: totalUnpaid },
                    { name: "Paid", value: totalPaid },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Arrear & Due Records
          </CardTitle>
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => {
                const headers = [
                  "Name",
                  "Department",
                  "Type",
                  "Reason",
                  "Period",
                  "Amount",
                  "Status",
                ];
                const rows = data.map((d) => [
                  d.name,
                  d.department,
                  d.type,
                  d.reason,
                  d.period,
                  `₹${d.amount}`,
                  d.status,
                ]);
                const csv = [headers, ...rows]
                  .map((r) => r.join(","))
                  .join("\n");
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "arrears_dues.csv");
                link.click();
              }}
            >
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>₹{row.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.status === "Paid"
                          ? "text-green-600 border-green-300"
                          : "text-yellow-600 border-yellow-300"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
