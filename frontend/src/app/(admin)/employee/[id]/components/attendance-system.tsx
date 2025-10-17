"use client"

import { useState, useEffect } from "react"
import { Clock, Play, Pause, Square, Coffee, LogIn, LogOut, AlertCircle } from "lucide-react"
import type { BreakSession } from "../../types/employees";

interface AttendanceSystemProps {
  onPunchIn: () => void
  onPunchOut: () => void
  onBreakStart: (breakType: "break1" | "break2" | "lunch") => void
  onBreakEnd: (breakType: "break1" | "break2" | "lunch") => void
  isPunchedIn: boolean
  currentTime: Date
  workStartTime?: string
  totalWorkHours: number
  breakTime: number
  overtimeHours: number
}

export function AttendanceSystem({
  onPunchIn,
  onPunchOut,
  onBreakStart,
  onBreakEnd,
  isPunchedIn,
  currentTime,
  workStartTime,
  totalWorkHours,
  breakTime,
  overtimeHours,
}: AttendanceSystemProps) {
  const [breaks, setBreaks] = useState<BreakSession[]>([
    { id: 1, type: "break1", duration: 15, status: "available" },
    { id: 2, type: "break2", duration: 15, status: "available" },
    { id: 3, type: "lunch", duration: 30, status: "available" },
  ])

  const [activeBreak, setActiveBreak] = useState<string | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [breakElapsed, setBreakElapsed] = useState(0)

  // Update break timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeBreak && breakStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - breakStartTime.getTime()) / 1000)
        setBreakElapsed(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeBreak, breakStartTime])

  const handleBreakStart = (breakType: "break1" | "break2" | "lunch") => {
    setActiveBreak(breakType)
    setBreakStartTime(new Date())
    setBreaks(
      breaks.map((b) =>
        b.type === breakType ? { ...b, status: "active", startTime: new Date().toLocaleTimeString() } : b,
      ),
    )
    onBreakStart(breakType)
  }

  const handleBreakEnd = () => {
    if (activeBreak) {
      setBreaks(
        breaks.map((b) =>
          b.type === activeBreak ? { ...b, status: "completed", endTime: new Date().toLocaleTimeString() } : b,
        ),
      )
      onBreakEnd(activeBreak as "break1" | "break2" | "lunch")
      setActiveBreak(null)
      setBreakStartTime(null)
      setBreakElapsed(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getBreakLabel = (type: string) => {
    switch (type) {
      case "break1":
        return "Break 1 (15 min)"
      case "break2":
        return "Break 2 (15 min)"
      case "lunch":
        return "Lunch Break (30 min)"
      default:
        return ""
    }
  }

  const isOvertimeRequired = totalWorkHours > 8.5
  const canPunchOut = totalWorkHours >= 8 || isOvertimeRequired

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Attendance System</h2>

      {/* Punch In/Out Section */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 text-blue-500 mr-2" />
          Punch In/Out System
        </h3>

        <div className="text-center mb-6">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-16 h-16 text-white" />
          </div>
          <h4 className="text-4xl font-bold text-gray-900 mb-2">{currentTime.toLocaleTimeString()}</h4>
          <p className="text-gray-600 text-lg">{currentTime.toLocaleDateString()}</p>

          {workStartTime && <p className="text-blue-600 font-medium mt-2">Work started at: {workStartTime}</p>}
        </div>

        <div className="flex justify-center mb-6">
          {!isPunchedIn ? (
            <button
              onClick={onPunchIn}
              className="bg-green-500 text-white px-12 py-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-3 text-xl font-semibold"
            >
              <LogIn className="w-8 h-8" />
              <span>Punch In</span>
            </button>
          ) : (
            <button
              onClick={onPunchOut}
              disabled={!canPunchOut}
              className={`px-12 py-4 rounded-lg transition-colors flex items-center space-x-3 text-xl font-semibold ${
                canPunchOut ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <LogOut className="w-8 h-8" />
              <span>Punch Out</span>
            </button>
          )}
        </div>

        {!canPunchOut && isPunchedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                Minimum 8 hours required before punch out. Current: {totalWorkHours.toFixed(1)} hours
              </span>
            </div>
          </div>
        )}

        {/* Work Hours Display */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Today&apos;s Hours</p>
            <p className="text-2xl font-bold text-blue-600">{totalWorkHours.toFixed(1)}h</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Break Time</p>
            <p className="text-2xl font-bold text-green-600">{breakTime}m</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Overtime</p>
            <p className="text-2xl font-bold text-orange-600">{overtimeHours.toFixed(1)}h</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Required</p>
            <p className="text-2xl font-bold text-purple-600">8.0h</p>
          </div>
        </div>
      </div>

      {/* Break System */}
      {isPunchedIn && (
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Coffee className="w-6 h-6 text-blue-500 mr-2" />
            Break System
          </h3>

          {activeBreak && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-orange-900">{getBreakLabel(activeBreak)} - Active</h4>
                  <p className="text-orange-700">Started at: {breakStartTime?.toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{formatTime(breakElapsed)}</p>
                  <button
                    onClick={handleBreakEnd}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors mt-2"
                  >
                    <Square className="w-4 h-4 inline mr-1" />
                    End Break
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {breaks.map((breakSession) => (
              <div
                key={breakSession.id}
                className={`border rounded-lg p-4 text-center ${
                  breakSession.status === "completed"
                    ? "bg-green-50 border-green-200"
                    : breakSession.status === "active"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-2">{getBreakLabel(breakSession.type)}</h4>

                {breakSession.status === "available" && !activeBreak && (
                  <button
                    onClick={() => handleBreakStart(breakSession.type)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Play className="w-4 h-4 inline mr-1" />
                    Start Break
                  </button>
                )}

                {breakSession.status === "active" && (
                  <div className="text-orange-600 font-medium">
                    <Pause className="w-4 h-4 inline mr-1" />
                    In Progress
                  </div>
                )}

                {breakSession.status === "completed" && (
                  <div className="text-green-600 font-medium">
                    <Square className="w-4 h-4 inline mr-1" />
                    Completed
                    {breakSession.startTime && breakSession.endTime && (
                      <p className="text-xs text-gray-600 mt-1">
                        {breakSession.startTime} - {breakSession.endTime}
                      </p>
                    )}
                  </div>
                )}

                {breakSession.status === "available" && activeBreak && (
                  <div className="text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overtime Alert */}
      {isOvertimeRequired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h4 className="font-medium text-red-900">Overtime Detected</h4>
              <p className="text-red-700 text-sm">
                You have worked {overtimeHours.toFixed(1)} hours overtime. Justification may be required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
