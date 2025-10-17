'use client'

import React, {  useMemo } from 'react'
import { BadgeCheck, FileSpreadsheet, FileText, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendanceStart: string
  attendanceEnd: string
  attendanceData: Array<{
    date: string, 
    status: string,
    punchIn: string | null,
    punchOut: string | null,
    totalHours: number,
    breakTime: number
  }>
  setAttendanceStart: (date: string) => void
  setAttendanceEnd: (date: string) => void
  exportAttendanceCSV: () => void
  exportAttendancePDF: () => void
  employeeName?: string
}

const AttendanceDialog: React.FC<AttendanceDialogProps> = ({
  open,
  onOpenChange,
  attendanceStart,
  attendanceEnd,
  attendanceData,
  setAttendanceStart,
  setAttendanceEnd,
  exportAttendanceCSV,
  exportAttendancePDF,
  employeeName
}) => {
  // Function to mark Sundays as off days
  const markSundaysAsOff = (data: Array<{
    date: string, 
    status: string,
    punchIn: string | null,
    punchOut: string | null,
    totalHours: number,
    breakTime: number
  }>) => {
    return data.map(item => {
      const date = new Date(item.date)
      const dayOfWeek = date.getDay() // 0 = Sunday
      
      if (dayOfWeek === 0) {
        return { ...item, status: 'Off' }
      }
      return item
    })
  }

  // Apply Sunday marking to attendance data
  const processedAttendanceData = useMemo(() => {
    return markSundaysAsOff(attendanceData)
  }, [attendanceData])
  // Calculate statistics and prepare chart data
  const statistics = useMemo(() => {
    const total = processedAttendanceData.length
    const present = processedAttendanceData.filter(d => d.status.toLowerCase() === 'present').length
    const absent = processedAttendanceData.filter(d => d.status.toLowerCase() === 'absent').length
    const late = processedAttendanceData.filter(d => d.status.toLowerCase() === 'late').length
    const leave = processedAttendanceData.filter(d => d.status.toLowerCase() === 'leave').length
    const off = processedAttendanceData.filter(d => d.status.toLowerCase() === 'off').length
    
    const attendanceRate = total > 0 ? (present / total) * 100 : 0
    
    return {
      total,
      present,
      absent,
      late,
      leave,
      off,
      attendanceRate
    }
  }, [processedAttendanceData])

  // Prepare pie chart data
  const pieChartData = useMemo(() => [
    { name: 'Present', value: statistics.present, color: '#10B981' },
    { name: 'Absent', value: statistics.absent, color: '#EF4444' },
    { name: 'Late', value: statistics.late, color: '#F59E0B' },
    { name: 'Leave', value: statistics.leave, color: '#6B7280' },
    { name: 'Off', value: statistics.off, color: '#8B5CF6' }
  ].filter(item => item.value > 0), [statistics])

  // Prepare monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthlyData: { [key: string]: { present: number, absent: number, total: number } } = {}
    
    processedAttendanceData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, absent: 0, total: 0 }
      }
      // Only count working days (exclude off days) for attendance rate calculation
      if (item.status.toLowerCase() !== 'off') {
        monthlyData[month].total++
        if (item.status.toLowerCase() === 'present') {
          monthlyData[month].present++
        } else {
          monthlyData[month].absent++
        }
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      attendanceRate: (data.present / data.total) * 100,
      present: data.present,
      absent: data.absent,
      total: data.total
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [processedAttendanceData])

  // Prepare weekly pattern data
  const weeklyPattern = useMemo(() => {
    const weeklyData: { [key: string]: { present: number, total: number } } = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    processedAttendanceData.forEach(item => {
      const dayOfWeek = days[new Date(item.date).getDay()]
      if (!weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek] = { present: 0, total: 0 }
      }
      // Only count working days (exclude off days) for attendance rate calculation
      if (item.status.toLowerCase() !== 'off') {
        weeklyData[dayOfWeek].total++
        if (item.status.toLowerCase() === 'present') {
          weeklyData[dayOfWeek].present++
        }
      }
    })

    return days.map(day => ({
      day,
      attendanceRate: weeklyData[day] ? (weeklyData[day].present / weeklyData[day].total) * 100 : 0,
      present: weeklyData[day]?.present || 0,
      total: weeklyData[day]?.total || 0
    })).filter(item => item.total > 0)
  }, [processedAttendanceData])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'text-green-600 bg-green-100'
      case 'absent': return 'text-red-600 bg-red-100'
      case 'late': return 'text-yellow-600 bg-yellow-100'
      case 'leave': return 'text-gray-600 bg-gray-100'
      case 'off': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <Icon size={24} className={color} />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-500" />
            {employeeName ? `${employeeName}'s Attendance` : 'Attendance Analytics'}
          </DialogTitle>
          <DialogDescription>
            View and analyze attendance records between {attendanceStart} and {attendanceEnd}
          </DialogDescription>
        </DialogHeader>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input 
                type="date" 
                value={attendanceStart} 
                onChange={e => setAttendanceStart(e.target.value)} 
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input 
                type="date" 
                value={attendanceEnd} 
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setAttendanceEnd(e.target.value)} 
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Charts
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Data Table
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard 
                title="Total Days" 
                value={statistics.total} 
                icon={Calendar}
                color="text-blue-600"
              />
              <StatCard 
                title="Present Days" 
                value={statistics.present} 
                subtitle={`${statistics.attendanceRate.toFixed(1)}% attendance`}
                icon={BadgeCheck}
                color="text-green-600"
              />
              <StatCard 
                title="Absent Days" 
                value={statistics.absent} 
                subtitle={`${((statistics.absent / statistics.total) * 100).toFixed(1)}% absence`}
                icon={Calendar}
                color="text-red-600"
              />
              <StatCard 
                title="Late/Leave" 
                value={statistics.late + statistics.leave} 
                icon={Calendar}
                color="text-yellow-600"
              />
              <StatCard 
                title="Off Days" 
                value={statistics.off} 
                icon={Calendar}
                color="text-purple-600"
              />
            </div>

            {/* Attendance Rate Gauge */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Attendance Rate</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#10B981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${statistics.attendanceRate * 2.83} 283`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{statistics.attendanceRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Attendance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Pattern */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Attendance Pattern</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Attendance Rate']}
                    />
                    <Bar dataKey="attendanceRate" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend */}
            {monthlyTrend.length > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Attendance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Attendance Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendanceRate" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="data" className="mt-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 bg-blue-50 border-b border-gray-200">
                <p className="text-sm text-blue-700">
                  📝 <strong>Note:</strong> This view shows all working days (Mon-Fri). 
                  Days marked as &quot;Absent&quot; with no punch times indicate no attendance record was found in the system.
                </p>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Record Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedAttendanceData.map((row, i) => {
                      const isSystemGenerated = row.status === 'Absent' && !row.punchIn && !row.punchOut && row.totalHours === 0
                      return (
                        <tr key={row.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(row.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(row.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                                {row.status}
                              </span>
                              {isSystemGenerated && (
                                <span className="text-xs text-gray-400" title="No attendance record found">
                                  ⚠️
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.punchIn || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.punchOut || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.totalHours > 0 ? `${row.totalHours.toFixed(1)}h` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            {isSystemGenerated ? (
                              <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                Auto-generated
                              </span>
                            ) : (
                              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Actual record
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="flex gap-2">
            <Button onClick={exportAttendanceCSV} variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={exportAttendancePDF} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
            <DialogClose asChild>
              <Button variant="default">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AttendanceDialog
