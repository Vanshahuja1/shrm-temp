"use client"

import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Target, Calendar, User, BarChart3, Zap,MailIcon } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "@/lib/axiosInstance"
interface EmployeeNavigationProps {
  employeeId?: string
}

export function EmployeeNavigation({}: EmployeeNavigationProps = {}) {
  const pathname = usePathname()

  const [stats, setStats] = useState<{ isWorking: boolean, workingHrs: number }>({
    isWorking: false,
    workingHrs: 0
  })

  const { id: employeeId } = useParams()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`attendance/employee/stats/${employeeId}`)
        setStats({
          isWorking: res.data.isPunchedIn,
          workingHrs: res.data.attendanceRecord?.totalHours || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    if (employeeId) {
      fetchStats()
    }
  }, [employeeId])

  const tabs = [
    { id: "dashboard", label: "Personal Dashboard", icon: User, href: `/employee/${employeeId}/dashboard` },
    { id: "tasks", label: "Task List", icon: Target, href: `/employee/${employeeId}/tasks` },
    { id: "attendance", label: "Attendance System", icon: Calendar, href: `/employee/${employeeId}/attendance` },
    { id: "performance", label: "Performance Metrics", icon: BarChart3, href: `/employee/${employeeId}/performance` },
    { id: "workhours", label: "Work Hours Display", icon: Zap, href: `/employee/${employeeId}/workhours` },
    // { id: "datasync", label: "Data Sync Status", icon: Database, href: `/employee/${employeeId}/datasync` },
    {id: "email" , label : "Email System", icon: MailIcon, href: `/employee/${employeeId}/emails`},
    // { id: "settings", label: "Settings", icon: Settings, href: `/employee/${employeeId}/settings` },
  ]

  return (
    <div className="w-72 bg-white rounded-lg shadow-sm border border-blue-200 p-4 sticky top-20 h-fit z-20">
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${isActive ? "bg-blue-500 text-white shadow-md" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Status Indicator */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${stats.isWorking ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
          ></div>
          <span className="text-sm text-gray-600">{stats.isWorking ? "Currently Working" : "Not Clocked In"}</span>
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-600">Working Hours: {stats.workingHrs.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  )
}
