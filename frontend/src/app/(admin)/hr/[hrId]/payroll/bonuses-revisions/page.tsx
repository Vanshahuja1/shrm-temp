"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface RevisionEntry {
  id: number;
  name: string;
  department: string;
  type: "Bonus" | "Salary Revision";
  amount: number;
  reason: string;
}

export default function BonusesRevisionsPage() {
  const [data, setData] = useState<RevisionEntry[]>([]);
  const [filter, setFilter] = useState<"All" | "Bonus" | "Salary Revision">(
    "All"
  );
  const filteredData =
    filter === "All" ? data : data.filter((d) => d.type === filter);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payroll/bonuses-revisions");
        const json = await res.json();
        setData(json);
      } catch {
        setData([
          {
            id: 1,
            name: "Ayesha Khan",
            department: "Engineering",
            type: "Bonus",
            amount: 10000,
            reason: "Quarterly Performance",
          },
          {
            id: 2,
            name: "Rohan Mehta",
            department: "HR",
            type: "Salary Revision",
            amount: 5000,
            reason: "Annual Hike",
          },
          {
            id: 3,
            name: "Neha Reddy",
            department: "Sales",
            type: "Bonus",
            amount: 7000,
            reason: "Target Achievement",
          },
        ]);
      }
    };

    fetchData();
  }, []);

  const barData = [
    {
      name: "Bonus",
      value: data
        .filter((d) => d.type === "Bonus")
        .reduce((acc, cur) => acc + cur.amount, 0),
    },
    {
      name: "Salary Revision",
      value: data
        .filter((d) => d.type === "Salary Revision")
        .reduce((acc, cur) => acc + cur.amount, 0),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      <button
        onClick={() => router.push("/hr/payroll")}
        className="flex items-center gap-1 text-sm text-red-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Payroll
      </button>

      <Typography variant="h5" className="font-bold text-red-600">
        🎁 Bonus & Salary Revisions
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Total Amount Distribution" />
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Employee Bonus & Revisions Table" />
          <CardContent>
            <div className="flex gap-3 mb-4">
              {["All", "Bonus", "Salary Revision"].map((t) => (
                <Button
                  key={t}
                  variant={filter === t ? "contained" : "outlined"}
                  color="error"
                  size="small"
                  onClick={() => setFilter(t as typeof filter)}
                >
                  {t}
                </Button>
              ))}
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((d) => (
                    <TableRow
                      key={d.id}
                      onClick={() =>
                        toast.success(
                          `${d.type} record of ₹${d.amount.toLocaleString()} for ${d.name}`,
                          {
                            position: "top-right",
                          }
                        )
                      }
                      className="cursor-pointer"
                    >
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.department}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.reason}</TableCell>
                      <TableCell>₹{d.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
