"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Search, Filter } from "lucide-react"
import { sampleMembers } from "@/lib/sampleData"
import axios from "@/lib/axiosInstance"
import type { OrganizationMember } from "../../types/index"
export default function MembersPage() {

  const fetchMembers = async () => {
    const response = await axios.get('/IT/org-members')
    return response.data
  }

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersData = await fetchMembers()
        console.log("Members data structure:", membersData[0]) // Log first member to see structure
        setMembers(membersData)
      } catch (error) {
        console.error("Error fetching members:", error)
        setMembers(sampleMembers)
      }
    }

    loadMembers()
  }, [])

  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedOrganization, setSelectedOrganization] = useState("all")
  const router = useRouter()

  // Get unique departments for the filter dropdown
  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(new Set(members.map(member => member.department)))
    return uniqueDepartments.sort()
  }, [members])

  // Get unique roles for the filter dropdown
  const roles = useMemo(() => {
    const uniqueRoles = Array.from(new Set(members.map(member => member.role)))
    return uniqueRoles.sort()
  }, [members])

  // Get unique organizations for the filter dropdown
  const organizations = useMemo(() => {
    const uniqueOrganizations = Array.from(new Set(
      members
        .map(member => member.organization || member.organizationId || member.organizationName)
        .filter(Boolean) // Remove null/undefined values
    ))
    return uniqueOrganizations.sort()
  }, [members])

  // Filter members based on search term, department, role, and organization
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
      const matchesRole = selectedRole === "all" || member.role.toLowerCase() === selectedRole.toLowerCase()
      const matchesOrganization = selectedOrganization === "all" || 
        member.organization === selectedOrganization || 
        member.organizationId === selectedOrganization || 
        member.organizationName === selectedOrganization
      
      return matchesSearch && matchesDepartment && matchesRole && matchesOrganization
    })
  }, [members, searchTerm, selectedDepartment, selectedRole, selectedOrganization])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">Manage your organization members</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/register")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members by name, role, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Department Filter */}
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Organization Filter */}
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Organizations</option>
                {organizations.map((organization) => (
                  <option key={organization} value={organization}>
                    {organization}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {filteredMembers.length} of {members.length} members
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedDepartment !== "all" || selectedRole !== "all" || selectedOrganization !== "all") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                Clear search: &quot;{searchTerm}&quot;
              </button>
            )}
            {selectedDepartment !== "all" && (
              <button
                onClick={() => setSelectedDepartment("all")}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
              >
                Clear department: {selectedDepartment}
              </button>
            )}
            {selectedRole !== "all" && (
              <button
                onClick={() => setSelectedRole("all")}
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
              >
                Clear role: {selectedRole}
              </button>
            )}
            {selectedOrganization !== "all" && (
              <button
                onClick={() => setSelectedOrganization("all")}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
              >
                Clear organization: {selectedOrganization}
              </button>
            )}
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedDepartment("all")
                setSelectedRole("all")
                setSelectedOrganization("all")
              }}
              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedDepartment !== "all" || selectedRole !== "all" || selectedOrganization !== "all"
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first member"}
            </p>
            {(!searchTerm && selectedDepartment === "all" && selectedRole === "all" && selectedOrganization === "all") && (
              <button
                onClick={() => router.push("/register")}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add First Member
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => router.push(`/admin/IT/members/${member.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                  {member.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Department</span>
                  <span className="font-medium text-gray-900">{member.department}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Salary</span>
                  <span className="font-medium text-green-600">
                    {`LKR ${(member.salary || 0).toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Show associated employees and interns if manager */}
              {member.role.toLowerCase() === "manager" && (() => {
                const manager = member as OrganizationMember & {
                  employees?: OrganizationMember[];
                  interns?: OrganizationMember[];
                };
                return (
                  <div className="mt-4 space-y-2">
                    {Array.isArray(manager.employees) && manager.employees.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Employees:</span>
                        <ul className="list-disc list-inside text-gray-600 text-xs mt-1">
                          {manager.employees.map((emp) => (
                            <li key={emp.id}>{emp.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(manager.interns) && manager.interns.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Interns:</span>
                        <ul className="list-disc list-inside text-gray-600 text-xs mt-1">
                          {manager.interns.map((intern) => (
                            <li key={intern.id}>{intern.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
