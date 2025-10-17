'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Building, Phone, Mail, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Mock axios for demo - replace with your actual axios instance
import axios from '@/lib/axiosInstance'
import { useParams } from 'next/navigation'

interface EmployeeInfo {
  id: string
  email: string
  phone: string
  name: string
  role: string
  department: string
  organization: string
  salary: number
  contactInfo: {
    email: string
    phone: string
    address: string
  }
}

interface AttendanceInfo {
  date: string
  punchIn: string
  punchOut: string | null
  totalHours: number
  status: string
}

interface EmployeeAttendanceRecord {
  employeeInfo: EmployeeInfo
  attendance: AttendanceInfo | null
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'present':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'absent':
      return <XCircle className="w-5 h-5 text-red-500" />
    default:
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'present':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'absent':
      return 'bg-red-50 border-red-200 text-red-800'
    default:
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }
}

function getToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(time: string | null): string {
  if (!time) return '--:--'
  return time
}

function formatHours(hours: number): string {
  if (hours === 0) return '--'
  return `${hours.toFixed(1)}h`
}

export default function DailyAttendance() {
  const [data, setData] = useState<EmployeeAttendanceRecord[] | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock hrId - replace with actual useParams
  const hrId = useParams().hrId || 'HRM101'

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/attendance/hr/${hrId}`)
        setData(res.data.attendanceRecords || [])
      } catch (error) {
        console.error('Failed to fetch attendance data:', error)
      } finally {
        setLoading(false)
      }
      // console.log('Fetched attendance data:', data);
    }
    fetchAttendance()
  }, [hrId])

  // Calculate summary statistics
  const summary = data ? {
    total: data.length,
    present: data.filter(record => record.attendance?.status === 'present').length,
    absent: data.filter(record => !record.attendance || record.attendance.status === 'absent').length,
    onLeave: data.filter(record => record.attendance?.status === 'leave').length
  } : null

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6 shadow-sm text-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border rounded-xl p-6 shadow-sm text-gray-800"
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Daily Attendance</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Overview for <span className="font-medium">{getToday()}</span>
      </p>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{summary.present}</div>
            <div className="text-xs text-green-700">Present</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
            <div className="text-xs text-red-700">Absent</div>
          </div>
         
        </motion.div>
      )}

      {/* Employee Records */}
      <div className="space-y-4">
        {data?.map((record, index) => {
          const status = record.attendance?.status || 'absent'
          
          return (
            <motion.div
              key={record.employeeInfo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
              className={`border rounded-lg p-4 transition-all ${getStatusColor(status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(status)}
                    <div>
                      <h3 className="font-semibold text-lg">{record.employeeInfo.name}</h3>
                      <p className="text-sm opacity-75">
                        {record.employeeInfo.role} • {record.employeeInfo.department}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{record.employeeInfo.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{record.employeeInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{record.employeeInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{record.employeeInfo.organization}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {record.attendance ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>In: {formatTime(record.attendance.punchIn)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Out: {formatTime(record.attendance.punchOut)}</span>
                      </div>
                      <div className="text-sm font-medium">
                        Hours: {formatHours(record.attendance.totalHours)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-red-600">
                      Marked Absent
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No attendance records found for today</p>
        </div>
      ) : null}
    </motion.div>
  )
}