"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { fetchAllUsers, type User } from "../api"

interface DepartmentStats {
  id: string
  name: string
  head: string
  managers: number
  employees: number
  interns: number
  totalMembers: number
  budget: number
  // activeMembers: number
}

export default function StatsSection() {
  const [departments, setDepartments] = useState<DepartmentStats[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDepartmentStats = async () => {
      try {
        setLoading(true)
        const users = await fetchAllUsers()

        if (users.length === 0) {
          setError("No users found")
          return
        }

        // Group users by department
        const departmentMap = new Map<string, User[]>()
        users.forEach((user) => {
          const deptName = user.departmentName || "Unknown Department"
          if (!departmentMap.has(deptName)) {
            departmentMap.set(deptName, [])
          }
          departmentMap.get(deptName)!.push(user)
        })

        // Calculate stats for each department
        const departmentStats: DepartmentStats[] = Array.from(departmentMap.entries()).map(
          ([deptName, deptUsers], index) => {
            const managers = deptUsers.filter((u) => u.role.toLowerCase() === "manager")
            const employees = deptUsers.filter((u) => u.role.toLowerCase() === "employee")
            const interns = deptUsers.filter((u) => u.role.toLowerCase() === "intern")
            // const activeMembers = deptUsers.filter((u) => u.isActive)

            // Find department head
            const head =
              managers.find((m) => !m.upperManager) ||
              deptUsers.find((u) => u.role.toLowerCase() === "admin") ||
              managers[0]

            // Calculate average salary
            const salaries = deptUsers.filter((u) => u.salary && u.salary > 0).map((u) => u.salary!)
            const averageSalary =
              salaries.length > 0 ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length : 0

            return {
              id: `dept-${index + 1}`,
              name: deptName,
              head: head?.name || "Not Assigned",
              managers: managers.length,
              employees: employees.length,
              interns: interns.length,
              totalMembers: deptUsers.length,
              budget: Math.round(averageSalary),
              // activeMembers: activeMembers.length,
            }
          },
        )

        setDepartments(departmentStats)
        if (departmentStats.length > 0) {
          setSelectedId(departmentStats[0].id)
        }
      } catch (err) {
        setError("Failed to load department statistics")
        console.error("Error loading department stats:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDepartmentStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading department statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">No departments found</div>
      </div>
    )
  }

  const selectedDept = departments.find((d) => d.id === selectedId) || departments[0]

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedDept.name}</h2>
            <p className="text-gray-600">Department Head: {selectedDept.head}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">${selectedDept.budget.toLocaleString()}</p>
            <p className="text-gray-600">Budget</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Managers" value={selectedDept.managers} color="blue" />
          <StatsCard label="Employees" value={selectedDept.employees} color="green" />
          <StatsCard label="Interns" value={selectedDept.interns} color="purple" />
          {/* <StatsCard label="Active Members" value={selectedDept.activeMembers} color="orange" /> */}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{selectedDept.totalMembers}</p>
          </div> */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Active Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedDept.totalMembers > 0
                ? Math.round((selectedDept.activeMembers / selectedDept.totalMembers) * 100)
                : 0}
              %
            </p>
          </div> */}
        </div>
      </div>
    </>
  )
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg text-center border border-${color}-200`}>
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className={`text-${color}-800 font-medium`}>{label}</p>
    </div>
  )
}
