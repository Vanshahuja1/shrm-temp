'use client'

import React, { useEffect, useState, useRef } from 'react'

import { format } from 'date-fns'
import AttendanceDialog from './AttendanceDialog'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Building, BadgeCheck, Target, HeartPulse, User, DollarSign, Download
} from 'lucide-react'
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
 
} from 'recharts'
import axios from '@/lib/axiosInstance'

type EmployeeReport = {
  id: string
  name: string
  designation: string
  department: string
  email: string

  performance: {
    rating: number
    attendance: number
    projectsCompleted: number
    targetsAchieved: number
    performanceMeasure: number
    consistencyScore: number
    engagementScore: number
  }

  workStats: {
    daysWorked: number
    totalTasksCompleted: number
    coursesCompleted: number
    certificationsEarned: number
    trainingsAttended: number
    avgDailyWorkingHours: number
    overtimeHoursMonthly: number
    avgBreakTimePerDay: string
  }

  growthAndHR: {
    joiningDate: string
    probationStatus: boolean
    lastPromotionDate: string
    nextAppraisalDue: string
    appraisalsReceived: number
    skillLevel: string
  }

  wellbeing: {
    age: number
    lastMedicalCheckup: string
    sickLeavesTaken: number
    wellnessProgramParticipation: boolean
    lastFeedbackSurveyScore: number
    workLifeBalanceScore: number
  }

  finance: {
    currentSalary: string
    bonusReceivedThisYear: string
    referralBonusesEarned: string
  }

  recentActivities: Array<{
    id: number
    type: string
    description: string
    date: string
  }>
}


export default function EmployeeReportDetails() {
  const router = useRouter()
  const { hrId } = useParams();
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<EmployeeReport | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Attendance modal state and logic
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [attendanceStart, setAttendanceStart] = useState<string>(() => format(new Date(), 'yyyy-MM-01'))
  const [attendanceEnd, setAttendanceEnd] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))
  const [attendanceData, setAttendanceData] = useState<Array<{
    date: string, 
    status: string, 
    punchIn: string | null,
    punchOut: string | null,
    totalHours: number,
    breakTime: number
  }>>([])

  const { id } = useParams<{id: string, hrId: string}>()

  // Generate mock attendance data as fallback
  const generateMockAttendanceData = React.useCallback(() => {
    const start = new Date(attendanceStart)
    const end = new Date(attendanceEnd)
    const days = []
    
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      
      // Only include working days (Monday to Saturday: 1-6)
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        const isPresent = Math.random() > 0.1
        days.push({
          date: format(new Date(currentDate), 'yyyy-MM-dd'),
          status: isPresent ? 'Present' : 'Absent',
          punchIn: isPresent ? '09:00' : null,
          punchOut: isPresent ? '18:00' : null,
          totalHours: isPresent ? 8 + Math.random() * 2 : 0,
          breakTime: isPresent ? 30 + Math.random() * 30 : 0
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Sort by date (most recent first)
    days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setAttendanceData(days)
  }, [attendanceStart, attendanceEnd])

  // Fetch real attendance data from backend
  const fetchAttendanceData = React.useCallback(async (employeeId: string, startDate?: string, endDate?: string) => {
    try {
      let url = `/attendance/hr/employee/${employeeId}`
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }
      
      const response = await axios.get(url)
      const data = response.data
      
      // Get the date range
      const start = new Date(startDate || attendanceStart)
      const end = new Date(endDate || attendanceEnd)
      
      // Create a map of existing attendance records
      const existingRecords = new Map()
      if (data.attendanceRecords) {
        data.attendanceRecords.forEach((record: {
          date: string;
          punchIn: string | null;
          punchOut: string | null;
          totalHours: number;
          status: string;
          breakTime: number;
        }) => {
          existingRecords.set(record.date, {
            date: record.date,
            status: record.status === 'present' ? 'Present' : 
                    record.status === 'late' ? 'Late' :
                    record.status === 'absent' ? 'Absent' : 'Holiday',
            punchIn: record.punchIn,
            punchOut: record.punchOut,
            totalHours: record.totalHours || 0,
            breakTime: record.breakTime || 0
          })
        })
      }
      
      // Generate complete attendance data for all working days in range
      const completeAttendanceData = []
      const currentDate = new Date(start)
      
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd')
        const dayOfWeek = currentDate.getDay()
        
        // Only include working days (Monday to Saturday: 1-6)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          if (existingRecords.has(dateStr)) {
            // Use existing record
            completeAttendanceData.push(existingRecords.get(dateStr))
          } else {
            // Mark as absent for missing working days
            completeAttendanceData.push({
              date: dateStr,
              status: 'Absent',
              punchIn: null,
              punchOut: null,
              totalHours: 0,
              breakTime: 0
            })
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Sort by date (most recent first)
      completeAttendanceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setAttendanceData(completeAttendanceData)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      // Fallback to mock data if API fails
      generateMockAttendanceData()
    }
  }, [generateMockAttendanceData, attendanceStart, attendanceEnd])

  // Fetch attendance data when modal opens or date range changes
  useEffect(() => {
    if (!attendanceModalOpen || !id) return
    fetchAttendanceData(id, attendanceStart, attendanceEnd)
  }, [attendanceStart, attendanceEnd, attendanceModalOpen, id, fetchAttendanceData])

  // Export attendance as CSV
  const exportAttendanceCSV = () => {
    const csvRows = [
      ['Date', 'Day', 'Status', 'Punch In', 'Punch Out', 'Total Hours', 'Break Time (mins)', 'Notes'],
      ...attendanceData.map(row => {
        const date = new Date(row.date)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        const notes = row.status === 'Absent' && !row.punchIn ? 'No record found - marked absent' : ''
        return [
          row.date, 
          dayName,
          row.status, 
          row.punchIn || 'N/A',
          row.punchOut || 'N/A',
          row.totalHours.toString(),
          row.breakTime.toString(),
          notes
        ]
      })
    ]
    const csvContent = csvRows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report?.name || 'employee'}_attendance_complete.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Export attendance as PDF
  const exportAttendancePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.text(`${report?.name || 'Employee'} - Complete Attendance Report`, 10, 10)
    doc.text(`From: ${attendanceStart} To: ${attendanceEnd}`, 10, 18)
    doc.text(`Working Days Only (Mon-Sat) | Missing records marked as Absent`, 10, 26)
    
    let y = 36
    doc.text('Date', 10, y)
    doc.text('Day', 40, y)
    doc.text('Status', 70, y)
    doc.text('Hours', 110, y)
    doc.text('Notes', 140, y)
    y += 8
    
    attendanceData.forEach(row => {
      const date = new Date(row.date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const notes = row.status === 'Absent' && !row.punchIn ? 'No record' : ''
      
      doc.text(row.date, 10, y)
      doc.text(dayName, 40, y)
      doc.text(row.status, 70, y)
      doc.text(row.totalHours.toString(), 110, y)
      doc.text(notes, 140, y)
      y += 6
      if (y > 280) { 
        doc.addPage()
        y = 20
        // Add headers on new page
        doc.text('Date', 10, y-6)
        doc.text('Day', 40, y-6)
        doc.text('Status', 70, y-6)
        doc.text('Hours', 110, y-6)
        doc.text('Notes', 140, y-6)
      }
    })
    doc.save(`${report?.name || 'employee'}_attendance_complete.pdf`)
  }

  const [weeklyWorkData, setWeeklyWorkData] = useState([
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 }
  ])

  const printReport = () => {
    window.print()
  }

  
  useEffect(() => {
    
    const fetchReport = async () => {
      const response = await axios.get(`reports/employee/${id}`)
      const data = await response.data.data
      setReport(data)
      
      // After setting the report, fetch attendance stats
      await fetchAttendanceStats()
    }

    // Fetch actual attendance percentage for the employee
    const fetchAttendanceStats = async () => {
      try {
        const response = await axios.get(`/attendance/hr/employee/${id}`)
        const attendanceData = response.data.attendanceRecords
        
        // Get current month start and end dates
        const currentDate = new Date()
        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        // Create a map of existing attendance records for current month
        const existingRecordsMap = new Map()
        let presentDays = 0
        let lateDays = 0
        
        if (attendanceData && attendanceData.length > 0) {
          attendanceData.forEach((record: {status: string, date: string, totalHours: number}) => {
            const recordDate = new Date(record.date)
            // Only count records from current month
            if (recordDate >= currentMonthStart && recordDate <= currentMonthEnd) {
              existingRecordsMap.set(record.date, record)
              if (record.status === 'present') presentDays++
              if (record.status === 'late') lateDays++
            }
          })
          
          // Calculate weekly work hours from last 7 working days
          const last7WorkingDays = []
          const tempDateForWeekly = new Date(currentDate)
          
          // Get last 7 working days
          while (last7WorkingDays.length < 7) {
            const dayOfWeek = tempDateForWeekly.getDay()
            if (dayOfWeek >= 1 && dayOfWeek <= 6) { // Working days Monday to Saturday
              const dateStr = format(tempDateForWeekly, 'yyyy-MM-dd')
              const existingRecord = existingRecordsMap.get(dateStr)
              last7WorkingDays.push({
                date: dateStr,
                totalHours: existingRecord?.totalHours || 0,
                dayOfWeek: dayOfWeek
              })
            }
            tempDateForWeekly.setDate(tempDateForWeekly.getDate() - 1)
          }
          
          // Create weekly hours chart data (including weekends for chart completeness)
          const weeklyHours = [
            { day: 'Sat', hours: 0 },
            { day: 'Sun', hours: 0 },
            { day: 'Mon', hours: 0 },
            { day: 'Tue', hours: 0 },
            { day: 'Wed', hours: 0 },
            { day: 'Thu', hours: 0 },
            { day: 'Fri', hours: 0 }
          ]
          
          // Fill in the working day hours
          last7WorkingDays.reverse().forEach((record) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dayName = dayNames[record.dayOfWeek]
            const dayIndex = weeklyHours.findIndex(d => d.day === dayName)
            if (dayIndex !== -1) {
              weeklyHours[dayIndex].hours = record.totalHours
            }
          })
          
          setWeeklyWorkData(weeklyHours)
        }
        
        // Calculate current month attendance
        const actualAttendedDays = presentDays + lateDays
        
        // Count total working days in current month (from 1st to today only)
        let totalWorkingDaysCurrentMonth = 0
        const checkDate = new Date(currentMonthStart)
        
        while (checkDate <= currentDate) { // Only count up to today, not future days
          const dayOfWeek = checkDate.getDay()
          if (dayOfWeek >= 1 && dayOfWeek <= 6) { // Monday to Saturday (6-day working week)
            totalWorkingDaysCurrentMonth++
          }
          checkDate.setDate(checkDate.getDate() + 1)
        }
        
        // Calculate attendance percentage for current month only
        const attendancePercentage = totalWorkingDaysCurrentMonth > 0 
          ? Math.round((actualAttendedDays / totalWorkingDaysCurrentMonth) * 100) 
          : 0
        
        console.log('Current Month Attendance Calculation:', {
          presentDays,
          lateDays,
          actualAttendedDays,
          totalWorkingDaysCurrentMonth,
          attendancePercentage,
          currentMonthStart: currentMonthStart.toDateString(),
          currentDate: currentDate.toDateString(),
          totalRecordsInDB: attendanceData?.length || 0,
          calculationMethod: 'Current month working days (1st to today only) - 6 day work week'
        })
        
        // Update the report with real attendance data
        setReport(prev => prev ? {
          ...prev,
          performance: {
            ...prev.performance,
            attendance: Math.min(100, Math.max(0, attendancePercentage)) // Ensure it's between 0-100
          }
        } : null)
      } catch (error) {
        console.error('Error fetching attendance stats:', error)
      }
    }

    fetchReport()
    setLoading(false)
  }, [id])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center">Loading...</div>
  }

  if (!report) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center">Report not found</div>
  }

  // Create visualization data from existing fields
  // const performanceData = [
  //   { name: 'Attendance', value: report.performance.attendance, maxValue: 100, percentage: report.performance.attendance, color: '#10b981' },
  //   { name: 'Performance', value: report.performance.performanceMeasure, maxValue: 100, percentage: report.performance.performanceMeasure, color: '#f59e0b' },
  // ]

  // const workStatsData = [
  //   { name: 'Tasks', value: report.workStats.totalTasksCompleted },
  //   { name: 'Courses', value: report.workStats.coursesCompleted },
  //   { name: 'Certifications', value: report.workStats.certificationsEarned },
  //   { name: 'Trainings', value: report.workStats.trainingsAttended }
  // ]

  // const wellbeingData = [
  //     { name: 'Health Score', value: Math.max(0, 100 - (report.wellbeing.sickLeavesTaken * 10)), fill: '#ef4444' }
  // ]

  const CustomTooltip = ({ active, payload, label }: {active: boolean, payload: {color: string, value: number}[], label: string}) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          
          {payload.map((entry: {color: string, value: number}, index: number) => {
            // Handle different data sources
              if (label === 'Health Score') {
              const sickDays = report?.wellbeing.sickLeavesTaken || 0
              return (
                <div key={index} style={{ color: entry.color }} className="text-sm">
                  <p>Sick Days: {sickDays}</p>
                  <p>Health Score: {entry.value?.toFixed(1)}%</p>
                </div>
              )
            } else {
              // For performance data
              // const data = performanceData.find(d => d.name === label)
              return (
                <div key={index} style={{ color: entry.color }} className="text-sm">
                  {/* <p>Value: {data?.value}{data?.name === 'Rating' ? '/5' : data?.name === 'Attendance' ? '%' : data?.maxValue === 100 ? '%' : ''}</p>
                  <p>Percentage: {entry.value?.toFixed(1)}%</p> */}
                </div>
              )
            }
          })}
        </div>
      )
    }
    return null
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push(`/hr/${hrId}/reports`)} className="flex items-center text-gray-600 hover:text-red-600">
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Employee Dashboard</h1>
          </div>
          
          <div className="relative export-menu">
            <button 
              onClick={() => printReport()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
            
            
          </div>
        </div>
      </div>

      <div ref={reportRef} className="max-w-7xl mx-auto px-6 py-8 space-y-8 print:px-4 print:py-4">
        {/* Info */}
        <div className="bg-white rounded-xl border shadow-sm p-6 flex items-center space-x-4 print:break-inside-avoid print:shadow-none print:border-gray-300">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-red-700">{report.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.name}</h2>
            <p className="text-gray-600">{report.designation} • {report.department}</p>
          </div>
        </div>

        {/* Performance Overview Chart */}
        <Section title="Performance Overview">
          {/* Individual Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
           
            <MetricCard 
              icon={<BadgeCheck size={20} className="text-green-500" />} 
              title="Attendance" 
              value={`${report.performance.attendance}%`}
              sub="Current month working days"
              // Open modal on click
              onClick={() => setAttendanceModalOpen(true)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
      {/* Attendance Dialog */}
      <AttendanceDialog
        open={attendanceModalOpen}
        onOpenChange={setAttendanceModalOpen}
        attendanceStart={attendanceStart}
        attendanceEnd={attendanceEnd}
        attendanceData={attendanceData}
        setAttendanceStart={setAttendanceStart}
        setAttendanceEnd={setAttendanceEnd}
        exportAttendanceCSV={exportAttendanceCSV}
        exportAttendancePDF={exportAttendancePDF}
        employeeName={report.name}
      />
            
            <MetricCard 
              icon={<Target size={20} className="text-red-500" />} 
              title="Performance Measure" 
              value={`${report.performance.performanceMeasure}/100`} 
            />
            
          </div>
         
        </Section>
        
        {/* Chart */}
        <Section title="Weekly Work Hours">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyWorkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
                <Line type="monotone" dataKey="hours" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Work & Learning Visualization */}
        <Section title="Work">
          <div className="grid grid-cols-1  gap-6">
            
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Statistics</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Daily Working Hours</span>
                  <span className="text-2xl font-bold text-gray-900">{report.workStats.avgDailyWorkingHours}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(report.workStats.avgDailyWorkingHours / 12) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overtime Hours/Month</span>
                  <span className="text-2xl font-bold text-gray-900">{report.workStats.overtimeHoursMonthly}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(report.workStats.overtimeHoursMonthly / 40) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Break Time/Day</span>
                  <span className="text-2xl font-bold text-gray-900">{report.workStats.avgBreakTimePerDay}</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Personal & Wellbeing */}
        <Section title="Personal & Wellbeing">
          {/* Individual Wellbeing Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard 
              icon={<HeartPulse size={20} className="text-pink-500" />} 
              title="Age" 
              value={report.wellbeing.age} 
              sub="years" 
            />
            <MetricCard 
              title="Leave Report" 
              value={report.wellbeing.sickLeavesTaken} 
              sub="days this year" 
            />
          </div>
          
          <div className="grid  lg:grid-cols-1 gap-6">
            
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Building size={20} className="text-red-500" /> Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Years at Company */}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Years at Company</div>
                    <div className="text-lg font-bold text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(report.growthAndHR.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                    </div>
                  </div>
                </div>
                {/* Joining Date */}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-blue-400" />
                  <div>
                    <div className="text-xs text-gray-500">Joining Date</div>
                    <div className="text-base font-semibold text-gray-900">
                      {new Date(report.growthAndHR.joiningDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Appraisals Received */}
                <div className="flex items-center gap-3">
                  <BadgeCheck size={18} className="text-green-400" />
                  <div>
                    <div className="text-xs text-gray-500">Appraisals Received</div>
                    <div className="text-lg font-bold text-gray-900">{report.growthAndHR.appraisalsReceived}</div>
                  </div>
                </div>
                {/* Skill Level */}
                <div className="flex items-center gap-3">
                  <User size={18} className="text-blue-400" />
                  <div>
                    <div className="text-xs text-gray-500">Skill Level</div>
                    <div className="text-base font-semibold text-blue-600">{report.growthAndHR.skillLevel}</div>
                  </div>
                </div>
       
                
              </div>
            </div>
          </div>
        </Section>

        


        {/* Financial Overview */}
        <Section title="Financial Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard icon={<DollarSign size={20} />} title="Salary" value={`LKR ${report.finance.currentSalary}`} />
            <MetricCard title="Bonus" value={`LKR ${report.finance.bonusReceivedThisYear}`} />
          </div>
        </Section>

        {/* Recent Activities */}
        <Section title="Recent Activities">
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            {report.recentActivities.map(a => (
              <div key={a.id} className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-red-700">{a.type[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{a.description}</p>
                  <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
    </>
  )
}

// Small reusable components
function MetricCard({
  title,
  value,
  sub,
  icon,
  onClick,
  className
}: {
  title: string,
  value: React.ReactNode,
  sub?: string,
  icon?: React.ReactNode,
  onClick?: () => void,
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col space-y-2${className ? ` ${className}` : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  )
}