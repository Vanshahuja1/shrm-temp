"use client"

import { useEffect, useState, useCallback } from "react"
// import { Bell, User } from "lucide-react"
import axios from "@/lib/axiosInstance"

interface EmployeeHeaderProps {
  employeeId: string
}

export function EmployeeHeader({ employeeId }: EmployeeHeaderProps) {
  const [employeeName, setEmployeeName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // const {empId} = useParams()

  const fetchEmployeeData = useCallback(async () => {
    try {
      const response = await axios.get(`/employees/${employeeId}`)
      
      console.log(response.data.name);
      setEmployeeName(response.data.name)

    } catch (error) {
      console.error("Failed to fetch employee data:", error)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    fetchEmployeeData()
  }, [fetchEmployeeData])

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
    )
  }

  return (
    <div className="bg-white shadow-sm border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="text-blue-600 text-lg">Welcome back, {employeeName || "Loading..."}</p>
          </div>
          {/* <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </div>
          <div className="flex items-center space-x-4">
           
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}