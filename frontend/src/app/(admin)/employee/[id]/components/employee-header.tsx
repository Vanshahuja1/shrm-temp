"use client";

import { useEffect, useState, useCallback } from "react";
// import { Bell, User } from "lucide-react"
import axios from "@/lib/axiosInstance";
import Image from "next/image";

interface EmployeeHeaderProps {
  employeeId: string;
}

export function EmployeeHeader({ employeeId }: EmployeeHeaderProps) {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // const {empId} = useParams()

  const fetchEmployeeData = useCallback(async () => {
    try {
      const response = await axios.get(`/employees/${employeeId}`);

      console.log(response.data.name);
      setEmployeeName(response.data.name);
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b border-blue-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Flex container for logo + text */}
          <div className="flex items-center gap-4">
            <Image
              src="/one_aim.jpg"
              alt="SHRM Logo"
              width={56}
              height={56}
              className="w-14 h-14 object-cover rounded-2xl shadow-lg"
              draggable={false}
              priority
            />
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Dashboard
              </h1>
              <p className="text-blue-600 text-lg">
                Welcome back, {employeeName || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
