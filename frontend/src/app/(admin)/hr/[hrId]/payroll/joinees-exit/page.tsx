"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Tooltip,
} from "@mui/material";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, UserMinus2 } from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
  id: number;
  name: string;
  joiningDate?: string;
  exitDate?: string;
  status: "joined" | "exited";
  department: string;
}

export default function JoineesExitsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalized, setFinalized] = useState(false);
  const router = useRouter();
  const handleFinalize = async () => {
    try {
      await fetch("/api/payroll/finalize-joinee-exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employees),
      });

      toast.success("Joinee/Exit list finalized!");
      setFinalized(true);
    } catch {
      toast.error("❌ Finalization failed");
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/payroll/joinees-exits");
        const data = await res.json();
        setEmployees(data);
      } catch {
        setEmployees([
          {
            id: 1,
            name: "Ayesha Khan",
            joiningDate: "2025-07-01",
            status: "joined",
            department: "Engineering",
          },
          {
            id: 2,
            name: "Rohan Mehta",
            exitDate: "2025-07-03",
            status: "exited",
            department: "HR",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto p-6"
    >
      <button
        onClick={() => router.push("/hr/payroll")}
        className="flex items-center gap-1 text-sm text-red-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Payroll
      </button>
      <Typography variant="h5" className="font-bold text-gray-900 mb-6">
        🧾 New Joinees & Exits
      </Typography>

      <Card variant="outlined">
        <CardHeader title="Monthly Changes" />
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between border-b py-3"
                >
                  <div>
                    <Typography variant="subtitle1" className="font-medium">
                      {emp.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-sm text-muted-foreground"
                    >
                      {emp.department}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-sm text-gray-500"
                    >
                      {emp.status === "joined"
                        ? `Joined on ${emp.joiningDate}`
                        : `Exited on ${emp.exitDate}`}
                    </Typography>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Tooltip
                      title={emp.status === "joined" ? "New Join" : "Exit"}
                    >
                      <Badge
                        variant="outline"
                        className={`border px-2 ${
                          emp.status === "joined"
                            ? "text-green-700 border-green-300"
                            : "text-red-700 border-red-300"
                        }`}
                      >
                        {emp.status === "joined" ? (
                          <CalendarCheck2 className="w-4 h-4 mr-1" />
                        ) : (
                          <UserMinus2 className="w-4 h-4 mr-1" />
                        )}
                        {emp.status}
                      </Badge>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button
          disabled={finalized}
          onClick={handleFinalize}
          className={`${
            finalized
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          } px-6 py-2 text-sm rounded`}
        >
          {finalized ? "✔ Finalized" : "Finalize Joinee/Exit List"}
        </Button>
      </div>
    </motion.div>
  );
}
