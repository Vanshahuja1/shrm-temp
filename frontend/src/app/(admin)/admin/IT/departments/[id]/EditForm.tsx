"use client"

import { useState } from "react"
import axios from "@/lib/axiosInstance"
import { sampleMembers } from "@/lib/sampleData"
import type { OrganizationMember } from "@/types"

interface DepartmentEditData {
  name: string;
  head: string;
  budget: number;
  managers: OrganizationMember[];
  employees: OrganizationMember[];
  interns: OrganizationMember[];
}

interface DepartmentEditFormProps {
  editData: DepartmentEditData
  setEditData: (data: DepartmentEditData | ((prev: DepartmentEditData) => DepartmentEditData)) => void
  onSave: () => void
  onCancel: () => void
}

export default function EditForm({ 
  editData, 
  setEditData, 
  onSave, 
  onCancel 
}: DepartmentEditFormProps) {
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  const [showManagerDropdown, setShowManagerDropdown] = useState(false)
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [showInternDropdown, setShowInternDropdown] = useState(false)

  const fetchOrgMembers = async () => {
    if (!Array.isArray(orgMembers) || orgMembers.length === 0) {
      try {
        const res = await axios.get("/IT/org-members/empInfo")
        console.log("Fetched employee info:", res.data)
        setOrgMembers(res.data)
      } catch (err) {
        console.error("Failed to fetch organization members:", err)
        setOrgMembers(sampleMembers)
      }
    }
  }

  const handleAddMember = async (role: string) => {
    await fetchOrgMembers()
    if (role === "Manager") setShowManagerDropdown(true)
    if (role === "Employee") setShowEmployeeDropdown(true)
    if (role === "Intern") setShowInternDropdown(true)
  }

  const handleSelectMember = (role: string, member: OrganizationMember) => {
    const key = role.toLowerCase() + 's' as keyof Pick<DepartmentEditData, 'managers' | 'employees' | 'interns'>
    setEditData((prev: DepartmentEditData) => ({ 
      ...prev, 
      [key]: [...(prev[key] || []), member] 
    }))
    setShowManagerDropdown(false)
    setShowEmployeeDropdown(false)
    setShowInternDropdown(false)
  }

  const handleRemoveMember = (role: string, idx: number) => {
    const key = role.toLowerCase() + 's' as keyof Pick<DepartmentEditData, 'managers' | 'employees' | 'interns'>
    setEditData((prev: DepartmentEditData) => ({ 
      ...prev, 
      [key]: prev[key].filter((_: OrganizationMember, i: number) => i !== idx) 
    }))
  }

  const getAvailableMembers = (targetRole: string) => {
    const assignedIds = new Set()
    // Get all assigned member IDs across all roles
    ;[...(editData.managers || []), ...(editData.employees || []), ...(editData.interns || [])].forEach((member: OrganizationMember) => {
      assignedIds.add(member.id)
    })
    
    return orgMembers.filter((member: OrganizationMember) => 
      member.role.toLowerCase() === targetRole.toLowerCase() && 
      !assignedIds.has(member.id)
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
        <input
          value={editData.name || ""}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
        <input
          value={editData.head || ""}
          onChange={(e) => setEditData({ ...editData, head: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
        <input
          type="number"
          value={editData.budget || 0}
          min={0}
          onChange={(e) => setEditData({ ...editData, budget: Number(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Managers */}
        <div className="relative">
          <label className="flex text-sm font-medium text-gray-700 mb-1 items-center">
            Managers
            <button 
              type="button" 
              className="ml-2 p-1" 
              onClick={() => handleAddMember("Manager")}
            >
              <span className="text-blue-600 text-lg">+</span>
            </button>
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {editData.managers?.map((m: OrganizationMember, idx: number) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center text-xs">
                {typeof m === 'string' ? m : m.name}
                <button 
                  type="button" 
                  className="ml-1" 
                  onClick={() => handleRemoveMember("Manager", idx)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {showManagerDropdown && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 max-h-40 overflow-y-auto w-full">
              {getAvailableMembers("Manager").length === 0 ? (
                <div className="px-2 py-1 text-gray-500 text-sm">No available managers</div>
              ) : (
                getAvailableMembers("Manager").map((m: OrganizationMember) => (
                  <div 
                    key={m.id} 
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1" 
                    onClick={() => handleSelectMember("Manager", m)}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.department} • {m.contactInfo?.email || 'No email'}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Employees */}
        <div className="relative">
          <label className="flex text-sm font-medium text-gray-700 mb-1 items-center">
            Employees
            <button 
              type="button" 
              className="ml-2 p-1" 
              onClick={() => handleAddMember("Employee")}
            >
              <span className="text-green-600 text-lg">+</span>
            </button>
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {editData.employees?.map((m: OrganizationMember, idx: number) => (
              <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center text-xs">
                {typeof m === 'string' ? m : m.name}
                <button 
                  type="button" 
                  className="ml-1" 
                  onClick={() => handleRemoveMember("Employee", idx)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {showEmployeeDropdown && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 max-h-40 overflow-y-auto w-full">
              {getAvailableMembers("Employee").length === 0 ? (
                <div className="px-2 py-1 text-gray-500 text-sm">No available employees</div>
              ) : (
                getAvailableMembers("Employee").map((m: OrganizationMember) => (
                  <div 
                    key={m.id} 
                    className="cursor-pointer hover:bg-green-100 px-2 py-1" 
                    onClick={() => handleSelectMember("Employee", m)}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.department} • {m.contactInfo?.email || 'No email'}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Interns */}
        <div className="relative">
          <label className="flex text-sm font-medium text-gray-700 mb-1 items-center">
            Interns
            <button 
              type="button" 
              className="ml-2 p-1" 
              onClick={() => handleAddMember("Intern")}
            >
              <span className="text-yellow-600 text-lg">+</span>
            </button>
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {editData.interns?.map((m: OrganizationMember, idx: number) => (
              <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center text-xs">
                {typeof m === 'string' ? m : m.name}
                <button 
                  type="button" 
                  className="ml-1" 
                  onClick={() => handleRemoveMember("Intern", idx)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {showInternDropdown && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 max-h-40 overflow-y-auto w-full">
              {getAvailableMembers("Intern").length === 0 ? (
                <div className="px-2 py-1 text-gray-500 text-sm">No available interns</div>
              ) : (
                getAvailableMembers("Intern").map((m: OrganizationMember) => (
                  <div 
                    key={m.id} 
                    className="cursor-pointer hover:bg-yellow-100 px-2 py-1" 
                    onClick={() => handleSelectMember("Intern", m)}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.department} • {m.contactInfo?.email || 'No email'}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button 
          onClick={onSave} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Save Changes
        </button>
        <button 
          onClick={onCancel} 
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
