"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Users, Building } from "lucide-react"
import { motion } from "framer-motion"
import axios from "@/lib/axiosInstance"
import type { Department, OrganizationMember } from "@/types/index"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    axios.get("/departments")
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const normalized = res.data.data.map((d: {
            _id?: string;
            id?: string;
            name: string;
            head: string;
            budget: number;
            managers: OrganizationMember[];
            employees: OrganizationMember[];
            interns: OrganizationMember[];
            members: OrganizationMember[];
          }) => ({
            ...d,
            id: d._id ?? d.id,
          })) as Department[]
          setDepartments(normalized)
          console.log("Departments loaded:", normalized.length)
        } else {
          console.error("Invalid response format:", res.data)
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error)
      })
  }, [])

  // const handleDelete = async (id: string) => {
  //   try {
  //     await axios.delete(`/departments/${id}`)
  //     setDepartments((prev) => prev.filter((d) => d.id !== id))
  //     console.log("Department deleted successfully")
  //   } catch (err) {
  //     console.error("Delete failed:", err)
  //     alert("Failed to delete department. Try again.")
  //   }
  // }

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMembers = departments.reduce(
    (sum, d) => sum + (Array.isArray(d.managers) ? d.managers.length : 0) + (Array.isArray(d.employees) ? d.employees.length : 0) + (Array.isArray(d.interns) ? d.interns.length : 0),
    0
  )

  const totalManagers = departments.reduce((sum, d) => sum + (Array.isArray(d.managers) ? d.managers.length : 0), 0)

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard icon={<Building className="text-blue-600" size={24} />} label="Total Departments" value={departments.length} />
        <StatsCard icon={<Users className="text-green-600" size={24} />} label="Total Members" value={totalMembers} />
        <StatsCard icon={<Users className="text-orange-600" size={24} />} label="Total Managers" value={totalManagers} />
      </div>

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={() => router.push("/admin/IT/departments/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Department
        </button>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((dept) => (
          <motion.div
            key={dept.id}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push(`/admin/IT/departments/${dept.id}`)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
            
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Head:</span>
                <span className="font-semibold">{dept.head}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Budget:</span>
                <span className="font-semibold text-green-600">₹{dept.budget?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Members:</span>
                <span className="font-semibold">
                  {(dept.managers?.length || 0) + (dept.employees?.length || 0) + (dept.interns?.length || 0)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 text-center text-sm text-gray-600">
                <div>
                  <p className="font-bold text-blue-600">{dept.managers?.length || 0}</p>
                  <p>Managers</p>
                </div>
                <div>
                  <p className="font-bold text-green-600">{dept.employees?.length || 0}</p>
                  <p>Employees</p>
                </div>
                <div>
                  <p className="font-bold text-purple-600">{dept.interns?.length || 0}</p>
                  <p>Interns</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
