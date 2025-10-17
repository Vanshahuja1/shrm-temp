"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { Department } from "../types/index" // Assuming you have a types file for Department

const SubDepartments = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    // Mock departments data - replace with actual API call
    const mockDepartments: Department[] = [
      {
        id: 1,
        name: "HR",
        managers: 1,
        coManagers: 2,
        employees: 8,
        interns: 1,
        budget: 600000,
        head: "Priya Sharma",
        description: "Human Resources and Employee Management",
        members: [
          {
            id: 1,
            name: "Priya Sharma",
            position: "HR Head",
            salary: 50000,
            experience: "8 years",
            joinDate: "2021-04-10",
            email: "priya.sharma@oneaimupsc.com",
            phone: "+91-9876543210",
            address: "Delhi, India",
            manager: "Director",
            skills: ["HR Management", "Recruitment", "Employee Relations"],
            performance: 95,
            type: "manager",
            attendanceScore: 98,
            managerReviewRating: 4.8,
            combinedPercentage: 96,
          }
        ],
      },
      {
        id: 2,
        name: "Sales",
        managers: 1,
        coManagers: 1,
        employees: 7,
        interns: 1,
        budget: 450000,
        head: "Ankit Jain",
        description: "Student Admissions and Sales Operations",
        members: [],
      },
      {
        id: 3,
        name: "Faculty",
        managers: 1,
        coManagers: 0,
        employees: 30,
        interns: 0,
        budget: 2400000,
        head: "Dr. Anil Kumar",
        description: "Academic Faculty and Teaching Staff",
        members: [],
      },
      {
        id: 4,
        name: "IT Support",
        managers: 1,
        coManagers: 1,
        employees: 6,
        interns: 2,
        budget: 350000,
        head: "Sunil Verma",
        description: "Technical Support and IT Infrastructure",
        members: [],
      },
      {
        id: 5,
        name: "Management",
        managers: 1,
        coManagers: 2,
        employees: 10,
        interns: 1,
        budget: 700000,
        head: "Shalini Bhatt",
        description: "Operations and Strategic Management",
        members: [],
      },
    ]
    setDepartments(mockDepartments)
  }, [])

  if (selectedDepartment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedDepartment(null)}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Departments
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedDepartment.name}</h1>
              <p className="text-gray-600 mb-2">{selectedDepartment.description}</p>
              <p className="text-gray-600">
                Department Head: <span className="font-semibold text-red-600">{selectedDepartment.head}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{selectedDepartment.budget.toLocaleString()}</p>
              <p className="text-gray-600">Annual Budget</p>
            </div>
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="text-red-600 font-semibold text-sm">Managers</p>
              <p className="text-2xl font-bold text-red-800">{selectedDepartment.managers}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-blue-600 font-semibold text-sm">Co-Managers</p>
              <p className="text-2xl font-bold text-blue-800">{selectedDepartment.coManagers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <p className="text-green-600 font-semibold text-sm">Employees</p>
              <p className="text-2xl font-bold text-green-800">{selectedDepartment.employees}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-purple-600 font-semibold text-sm">Interns</p>
              <p className="text-2xl font-bold text-purple-800">{selectedDepartment.interns}</p>
            </div>
          </div>

          {/* Members List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedDepartment.members.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ y: -2, scale: 1.01 }}
                className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                    <p className="text-gray-600">{member.position}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        member.type === "manager"
                          ? "bg-red-100 text-red-800"
                          : member.type === "employee"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {member.type.charAt(0).toUpperCase() + member.type.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-semibold text-green-600">₹{member.salary.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-semibold text-gray-900">{member.experience}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-semibold text-blue-600">{member.attendanceScore}%</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-semibold text-yellow-600">{member.managerReviewRating}/5.0</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Combined:</span>
                    <span className="font-semibold text-red-600">{member.combinedPercentage}%</span>
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Joined: {member.joinDate}</span>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sub Departments</h1>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
          {departments.length} Active Departments
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <motion.div
            key={dept.id}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSelectedDepartment(dept)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
              <ChevronRight className="text-red-600" size={20} />
            </div>

            <p className="text-gray-600 text-sm mb-4">{dept.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
                <p className="text-red-600 font-semibold text-sm">Managers</p>
                <p className="text-xl font-bold text-red-800">{dept.managers}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                <p className="text-green-600 font-semibold text-sm">Employees</p>
                <p className="text-xl font-bold text-green-800">{dept.employees}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Department Head</p>
              <p className="font-semibold text-gray-900">{dept.head}</p>
              <p className="text-sm text-green-600 font-semibold mt-2">Budget: ₹{dept.budget.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
    
export default SubDepartments