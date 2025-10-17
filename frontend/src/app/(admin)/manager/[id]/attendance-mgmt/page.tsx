"use client"

import { Clock, LogIn, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import type { AttendanceRecord } from "../types/index"
import { useParams } from "next/navigation"
import { mockAttendanceRecords } from "../data/mockData"
import axiosInstance from "@/lib/axiosInstance";

// Type for manager's attendance data
interface ManagerAttendance {
  isPunchedIn: boolean;
  workStartTime?: string;
  totalWorkHours?: number;
  breakTime?: number;
  overtimeHours?: number;
}

// Type for API response data
interface ApiResponse {
  data?: AttendanceRecord[];
  records?: AttendanceRecord[];
}
export default function AttendanceManagement() {
  // Manager's own attendance state
  const [managerAttendance, setManagerAttendance] = useState<ManagerAttendance | null>(null);
  const [isManagerLoading, setIsManagerLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [employeeMap, setEmployeeMap] = useState<Record<string, { id: string; name: string }>>({});
  const [hasMounted, setHasMounted] = useState(false);

  const { id: managerId } = useParams()

useEffect(() => {
  if (!managerId) return;
  const fetchData = async () => {
    try {
      // Fetch manager info (with employees and interns)
      const managerRes = await axiosInstance.get(`/IT/org-members/${managerId}`);
      const managerData = managerRes.data;
      // Collect all employee and intern IDs and build a map for details
      const employees = Array.isArray(managerData.employees) ? managerData.employees : [];
      const interns = Array.isArray(managerData.interns) ? managerData.interns : [];
      const allIds = [...employees.map((e: { id: string }) => e.id), ...interns.map((i: { id: string }) => i.id)];
      // Build a map of id -> { id, name }
      const map: Record<string, { id: string; name: string }> = {};
      employees.forEach((e: { id: string; name: string }) => { map[e.id] = { id: e.id, name: e.name }; });
      interns.forEach((i: { id: string; name: string }) => { map[i.id] = { id: i.id, name: i.name }; });
      setEmployeeMap(map);
      // Fetch attendance for all
      const attendancePromises = allIds.map((empId: string) =>
        axiosInstance.get(`/employees/${empId}/attendance`).then((res: { data: ApiResponse }) => res.data)
      );
      const attendanceResults = await Promise.all(attendancePromises);
      // Flatten and filter attendance records
      const allRecords = attendanceResults.flatMap((raw: ApiResponse) => {
        if (Array.isArray(raw)) return raw as AttendanceRecord[];
        if (raw.records) return raw.records;
        if (raw.data) return raw.data;
        return [];
      });
      setAttendanceRecords(allRecords);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords(mockAttendanceRecords); // Fallback to mock records
    }
  };
  fetchData();
}, [managerId]);

  // Update current time every second
  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])


  // Fetch manager's own attendance info
  const fetchManagerAttendance = async () => {
    if (!managerId) return;
    setIsManagerLoading(true);
    try {
      const response = await axiosInstance.get(`/employees/${managerId}/attendance`);
      setManagerAttendance(response.data);
    } catch (error) {
      console.error("Failed to fetch manager attendance:", error);
      setManagerAttendance(null);
    } finally {
      setIsManagerLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId]);

  // Handle punch in/out for manager
  const handleManagerPunchToggle = async () => {
    if (!managerId) return;
    try {
      if (!managerAttendance?.isPunchedIn) {
        // Punch in
        await axiosInstance.post(`/employees/${managerId}/attendance`, {
          timestamp: new Date().toISOString(),
        });
      } else {
        // Punch out
        await axiosInstance.post(`/employees/${managerId}/attendance/punch-out`, {
          timestamp: new Date().toISOString(),
        });
      }
      fetchManagerAttendance();
    } catch (error) {
      console.error("Failed to punch in/out:", error);
    }
  };



  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>

      {/* Last 30 Days Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Last 30 Days Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-red-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Employee/Intern</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Punch In</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Punch Out</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords?.map((record: AttendanceRecord, idx: number) => {
                if (!record.employee || !record.date) return null;
                const employeeName = employeeMap[record.employee]?.name || record.employee || "Unknown";
                const rowKey = `${record.employee || "unknown"}-${record.date || idx}`;
                return (
                  <tr key={rowKey} className="border-b border-gray-100 hover:bg-red-50">
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4 font-medium">{employeeName}</td>
                    <td className="py-3 px-4">{record.punchIn}</td>
                    <td className="py-3 px-4">{record.punchOut}</td>
                    <td className="py-3 px-4">{record.totalHours}h</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "late"
                              ? "bg-yellow-100 text-yellow-800"
                              : record.status === "absent"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {record.status.toUpperCase()}
                      </span>
                      {record.regularized && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">(Regularized)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager's Own Attendance Section (Red Themed, Employee UI) */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 text-red-500 mr-2" />
          Punch In/Out System
        </h3>
        <div className="text-center mb-6">
          <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-16 h-16 text-white" />
          </div>
          <h4 className="text-4xl font-bold text-gray-900 mb-2">{hasMounted ? currentTime.toLocaleTimeString() : "--:--:--"}</h4>
          <p className="text-gray-600 text-lg">{hasMounted ? currentTime.toLocaleDateString() : "--/--/----"}</p>
          {managerAttendance?.workStartTime && (
            <p className="text-red-600 font-medium mt-2">Work started at: {managerAttendance.workStartTime}</p>
          )}
        </div>

        <div className="flex justify-center mb-6">
          {!managerAttendance?.isPunchedIn ? (
            <button
              onClick={handleManagerPunchToggle}
              className="bg-green-500 text-white px-12 py-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-3 text-xl font-semibold"
              disabled={isManagerLoading}
            >
              <LogIn className="w-8 h-8" />
              <span>Punch In</span>
            </button>
          ) : (
            <button
              onClick={handleManagerPunchToggle}
              disabled={isManagerLoading || (managerAttendance?.totalWorkHours ?? 0) < 8}
              className={`px-12 py-4 rounded-lg transition-colors flex items-center space-x-3 text-xl font-semibold ${
                (managerAttendance?.totalWorkHours ?? 0) >= 8 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <LogOut className="w-8 h-8" />
              <span>Punch Out</span>
            </button>
          )}
        </div>

        {/* Minimum hours warning */}
        {managerAttendance?.isPunchedIn && (managerAttendance?.totalWorkHours ?? 0) < 8 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <span className="text-yellow-800 font-medium">
                Minimum 8 hours required before punch out. Current: {(managerAttendance?.totalWorkHours ?? 0).toFixed(1)} hours
              </span>
            </div>
          </div>
        )}

        {/* Work Hours Display */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Today&apos;s Hours</p>
            <p className="text-2xl font-bold text-red-600">{(managerAttendance?.totalWorkHours ?? 0).toFixed(1)}h</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Break Time</p>
            <p className="text-2xl font-bold text-green-600">{managerAttendance?.breakTime ?? 0}m</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Overtime</p>
            <p className="text-2xl font-bold text-orange-600">{(managerAttendance?.overtimeHours ?? 0).toFixed(1)}h</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Required</p>
            <p className="text-2xl font-bold text-purple-600">8.0h</p>
          </div>
        </div>

        {/* Break System (with real logic) */}
        {managerAttendance?.isPunchedIn && typeof managerId === 'string' && (
          <ManagerBreakSystem managerId={managerId} />
        )}
      </div>
    </div>
  );
}

// --- ManagerBreakSystem component definition ---
function ManagerBreakSystem({ managerId }: { managerId: string }) {
  const [onBreak, setOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<string | null>(null);
  const [breakEnd, setBreakEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBreakToggle = async () => {
    setLoading(true);
    try {
      if (!onBreak) {
        // Start break
        await axiosInstance.post(`/employees/${managerId}/attendance/breaks`, {
          type: "break1",
          action: "start",
        });
        setBreakStart(new Date().toLocaleTimeString());
        setBreakEnd(null);
        setOnBreak(true);
      } else {
        // End break
        await axiosInstance.post(`/employees/${managerId}/attendance/breaks`, {
          type: "break1",
          action: "end",
        });
        setBreakEnd(new Date().toLocaleTimeString());
        setOnBreak(false);
      }
    } catch (error) {
      console.error("Failed to toggle break:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <button
        onClick={handleBreakToggle}
        className={`px-8 py-3 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-colors shadow-sm border border-red-200 ${
          onBreak
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-white text-red-600 hover:bg-red-50"
        }`}
        disabled={loading}
      >
        {onBreak ? "End Break" : "Start Break"}
      </button>
      <div className="mt-2 text-sm text-gray-500">
        {onBreak && breakStart && (
          <span>Break started at: <span className="text-red-600 font-medium">{breakStart}</span></span>
        )}
        {!onBreak && breakEnd && (
          <span>Break ended at: <span className="text-green-600 font-medium">{breakEnd}</span></span>
        )}
      </div>
    </div>
  );
}

