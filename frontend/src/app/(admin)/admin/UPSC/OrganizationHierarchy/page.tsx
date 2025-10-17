"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Award } from "lucide-react"
import { Users } from "lucide-react"
import { Department } from "../types/index"

const OrganizationHierarchy = () => {
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
        members: [],
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

  const hierarchy = {
    director: { name: "Director - One Aim UPSC", position: "Director/CEO" },
    departments: [
      {
        name: "HR",
        head: { name: "Priya Sharma", position: "Head of HR" },
        subunits: [
          { name: "Finance", head: "Rahul Sinha" },
          { name: "Attendance", head: "Neha Gupta" },
          { name: "Performance", head: "Rohit Mehra" },
        ],
      },
      {
        name: "Sales",
        head: { name: "Ankit Jain", position: "Head of Sales" },
        subunits: [{ name: "Admissions", head: "Kavita Singh" }],
      },
      {
        name: "Faculty",
        head: { name: "Dr. Anil Kumar", position: "Faculty Head" },
        subunits: [],
      },
      {
        name: "IT Support",
        head: { name: "Sunil Verma", position: "IT Support Lead" },
        subunits: [
          { name: "Tele Callers", head: "Geeta Yadav" },
          { name: "Faculty IT Support", head: "Suresh Nair" },
        ],
      },
      {
        name: "Management",
        head: { name: "Shalini Bhatt", position: "Operations Manager" },
        subunits: [
          { name: "MIS", head: "Atul Mishra" },
          { name: "Reporting", head: "Pooja Arora" },
          { name: "AlignUp", head: "Sandeep Singh" },
          { name: "Team Lead", head: "Richa Thakur" },
          { name: "MIS Coordinator", head: "Vikram Joshi" },
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Organization Hierarchy</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <Activity className="text-red-600" size={20} />
          </div>
          Complete Organization Structure
        </h2>

        <div className="flex flex-col items-center">
          {/* Director/CEO */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl mb-8 shadow-lg text-center min-w-[250px]"
          >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg">{hierarchy.director.name}</h3>
            <p className="text-red-100">{hierarchy.director.position}</p>
          </motion.div>

          {/* Departments */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {hierarchy.departments.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center w-full"
              >
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg mb-4 w-full text-center">
                  <p className="font-semibold text-red-800">{dept.head.name}</p>
                  <p className="text-sm text-red-600">{dept.head.position || dept.name}</p>
                </div>
                {dept.subunits.length > 0 && (
                  <div className="w-full">
                    <div className="grid gap-2">
                      {dept.subunits.map((sub) => (
                        <div key={sub.name} className="bg-green-50 border border-green-200 p-2 rounded text-center">
                          <p className="text-sm font-medium text-green-800">{sub.name}</p>
                          <p className="text-xs text-green-600">Lead: {sub.head}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Reporting Structure */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={20} />
          </div>
          View Reporting Structure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {departments.map((dept) => (
            <div key={dept.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-red-600">
                {dept.managers + dept.coManagers + dept.employees + dept.interns}
              </p>
              <p className="text-gray-600 text-sm font-medium">{dept.name}</p>
              <p className="text-xs text-gray-500 mt-1">Total Members</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrganizationHierarchy