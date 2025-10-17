"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Loader2 } from "lucide-react"
import { fetchAllUsers, type User } from "../api"

interface HierarchyData {
  head: User | null
  department: string
  managers: User[]
  employees: User[]
  interns: User[]
}

export default function ChartSection() {
  const [hierarchy, setHierarchy] = useState<HierarchyData>({
    head: null,
    department: "",
    managers: [],
    employees: [],
    interns: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHierarchyData = async () => {
      try {
        setLoading(true)
        const users = await fetchAllUsers()

        if (users.length === 0) {
          setError("No users found")
          return
        }

        // Find department head (could be admin or highest level manager)
        const head =
          users.find(
            (user) =>
              user.role.toLowerCase() === "admin" ) || null

        // Separate users by role
        const managers = users.filter((user) => user.role.toLowerCase() === "manager")
        const employees = users.filter((user) => user.role.toLowerCase() === "employee")
        const interns = users.filter((user) => user.role.toLowerCase() === "intern")

        // Get department name from the first user
        const department = users[0]?.departmentName || "Organization"

        setHierarchy({
          head,
          department,
          managers,
          employees,
          interns,
        })
      } catch (err) {
        setError("Failed to load organizational data")
        console.error("Error loading hierarchy:", err)
      } finally {
        setLoading(false)
      }
    }

    loadHierarchyData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading organizational chart...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Organizational Chart</h3>

      {/* Department Head */}
      {hierarchy.head && (
        <div className="flex justify-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl text-center min-w-[200px] shadow-lg"
          >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg">{hierarchy.head.name}</h3>
            <p className="text-blue-100">Admin</p>
            <p className="text-blue-200 text-sm mt-1">{hierarchy.department}</p>
          </motion.div>
        </div>
      )}

      {/* Managers */}
      <HierarchyLevel title="Managers" members={hierarchy.managers} color="red" />

      {/* Employees */}
      <HierarchyLevel title="Employees" members={hierarchy.employees} color="green" />

      {/* Interns */}
      <HierarchyLevel title="Interns" members={hierarchy.interns} color="purple" />
    </div>
  )
}

function HierarchyLevel({
  title,
  members,
  color,
}: {
  title: string
  members: User[]
  color: string
}) {
  if (members.length === 0) {
    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">{title} (0)</h4>
        <div className="text-center text-gray-500 py-8">No {title.toLowerCase()} found</div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        {title} ({members.length})
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {members.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ scale: 1.05 }}
            className={`bg-${color}-50 border-2 border-${color}-200 p-3 rounded-lg text-center`}
          >
            <div
              className={`w-10 h-10 bg-${color}-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-sm font-bold`}
            >
              {member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
            <p className={`font-semibold text-${color}-800 text-sm`}>{member.name}</p>
            <p className={`text-${color}-600 text-xs`}>{member.upperManager ? `→ ${member.upperManager}` : title}</p>
            <p className={`text-${color}-500 text-xs`}>{member.performance ? `${member.performance}%` : "N/A"}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
