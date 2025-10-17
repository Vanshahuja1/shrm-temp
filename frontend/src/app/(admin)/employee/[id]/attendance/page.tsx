"use client"

import { useState, useEffect, use, useCallback } from "react"
import { AttendanceSystem } from "../components/attendance-system"
import axios from "@/lib/axiosInstance";

interface AttendanceData {
  isPunchedIn?: boolean;
  workStartTime?: string;
  totalWorkHours?: number;
  breakTime?: number;
  overtimeHours?: number;
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAttendanceData = useCallback(async () => {
    try {
      const response = await axios.get(`/employees/${id}/attendance`)
      setAttendanceData(response.data)
    } catch (error) {
      console.error("Failed to fetch attendance data:", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    fetchAttendanceData()
    return () => clearInterval(timer)
  }, [fetchAttendanceData])

  const handlePunchIn = async () => {
    try {
      await axios.post(`/employees/${id}/attendance`, {
        timestamp: new Date().toISOString(),
      });
      fetchAttendanceData();
    } catch (error) {
      console.error("Failed to punch in:", error);
    }
  }

  const handlePunchOut = async () => {
    try {
      await axios.post(`/employees/${id}/attendance/punch-out`, {
        timestamp: new Date().toISOString(),
      })
      fetchAttendanceData()
    } catch (error) {
      console.error("Failed to punch out:", error)
    }
  }

  const handleBreakStart = async (breakType: "break1" | "break2" | "lunch") => {
    try {
      await axios.post(`/employees/${id}/attendance/breaks`, {
        type: breakType,
        action: "start",
      })
      fetchAttendanceData()
    } catch (error) {
      console.error("Failed to start break:", error)
    }
  }

  const handleBreakEnd = async (breakType: "break1" | "break2" | "lunch") => {
    try {
      await axios.post(`/employees/${id}/attendance/breaks`, {
        type: breakType,
        action: "end",
      })
      fetchAttendanceData()
    } catch (error) {
      console.error("Failed to end break:", error)
    }
  }

// ...existing code...

  if (loading) {
    return <div className="animate-pulse">Loading attendance data...</div>
  }

  return (
    <AttendanceSystem
      onPunchIn={handlePunchIn}
      onPunchOut={handlePunchOut}
      onBreakStart={handleBreakStart}
      onBreakEnd={handleBreakEnd}
      isPunchedIn={attendanceData?.isPunchedIn || false}
      currentTime={currentTime}
      workStartTime={attendanceData?.workStartTime || ""}
      totalWorkHours={attendanceData?.totalWorkHours || 0}
      breakTime={attendanceData?.breakTime || 0}
      overtimeHours={attendanceData?.overtimeHours || 0}
    />
  )
}
