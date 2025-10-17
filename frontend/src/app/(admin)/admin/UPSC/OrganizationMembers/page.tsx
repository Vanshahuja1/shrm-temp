"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Star, Mail, Phone } from "lucide-react"
import { Faculty , Student} from "../types/index"

// Organization Members Component
type MemberType =
  | (Faculty & { type: "faculty" })
  | (Student & { type: "student" })
  | null

const OrganizationMembers = () => {
  const [activeTab, setActiveTab] = useState("faculties")
  const [selectedMember, setSelectedMember] = useState<MemberType>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    // Mock faculties data - replace with actual API call
    const mockFaculties: Faculty[] = [
      {
        id: 1,
        name: "Dr. Anil Kumar",
        subjects: ["Public Administration", "Governance"],
        batchAssignments: ["Morning Batch A", "Evening Batch A"],
        averageClassesPerDay: 4,
        qualifications: "PhD in Public Administration, MA Political Science",
        experience: "12 years",
        durationInOrganization: "4 years",
        rating: 4.8,
        students: 120,
        salary: 80000,
        joinDate: "2020-03-10",
        email: "anil.kumar@oneaimupsc.com",
        phone: "+91-9876543216",
        performanceMetrics: {
          attendanceScore: 96,
          managerReviewRating: 4.8,
          combinedPercentage: 95,
        },
      },
      {
        id: 2,
        name: "Prof. Manish Grover",
        subjects: ["History", "Geography"],
        batchAssignments: ["Morning Batch B", "Evening Batch B"],
        averageClassesPerDay: 3,
        qualifications: "MA History, MA Geography",
        experience: "8 years",
        durationInOrganization: "3 years",
        rating: 4.6,
        students: 95,
        salary: 60000,
        joinDate: "2021-09-11",
        email: "manish.grover@oneaimupsc.com",
        phone: "+91-9876543217",
        performanceMetrics: {
          attendanceScore: 94,
          managerReviewRating: 4.6,
          combinedPercentage: 92,
        },
      },
    ]

    // Mock students data - replace with actual API call
    const mockStudents: Student[] = [
      {
        id: 1,
        name: "Arjun Patel",
        batch: "Morning Batch A",
        enrollmentDate: "2024-01-15",
        phone: "+91-9876543300",
        email: "arjun.patel@email.com",
        feeStatus: "paid",
        basicInfo: {
          age: 24,
          address: "Mumbai, Maharashtra",
          parentContact: "+91-9876543301",
          previousEducation: "B.Tech Computer Science",
        },
        performanceMetrics: {
          attendanceScore: 92,
          testScores: [85, 78, 90, 88],
          assignmentCompletion: 95,
          overallGrade: "A",
        },
      },
      {
        id: 2,
        name: "Priya Singh",
        batch: "Evening Batch A",
        enrollmentDate: "2024-02-01",
        phone: "+91-9876543302",
        email: "priya.singh@email.com",
        feeStatus: "pending",
        basicInfo: {
          age: 26,
          address: "Delhi, India",
          parentContact: "+91-9876543303",
          previousEducation: "MA Economics",
        },
        performanceMetrics: {
          attendanceScore: 88,
          testScores: [82, 85, 79, 91],
          assignmentCompletion: 90,
          overallGrade: "B+",
        },
      },
    ]

    setFaculties(mockFaculties)
    setStudents(mockStudents)
  }, [])

  if (selectedMember) {
    if (selectedMember.type === "faculty") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedMember(null)}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Members
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedMember.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedMember.name}</h1>
                <p className="text-xl text-gray-600">{selectedMember.subjects.join(", ")}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Rating: {selectedMember.rating}/5.0
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedMember.experience} Experience
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Professional Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Professional Details</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">Monthly Salary</p>
                    <p className="text-2xl font-bold text-green-600">₹{selectedMember.salary.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">Students Teaching</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedMember.students}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">Classes/Day</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedMember.averageClassesPerDay}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">Duration in Org</p>
                    <p className="text-lg font-semibold text-yellow-600">{selectedMember.durationInOrganization}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">Attendance Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${selectedMember.performanceMetrics.attendanceScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedMember.performanceMetrics.attendanceScore}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">Manager Review Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < Math.floor(selectedMember.performanceMetrics.managerReviewRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{selectedMember.performanceMetrics.managerReviewRating}/5.0</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">Combined Percentage</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                        style={{ width: `${selectedMember.performanceMetrics.combinedPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedMember.performanceMetrics.combinedPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Assignments */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Batch Assignments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMember.batchAssignments.map((batch, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-900">{batch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Qualifications</h3>
              <p className="text-gray-700">{selectedMember.qualifications}</p>
            </div>
          </div>
        </div>
      )
    }

    // Student Details
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedMember(null)}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Members
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {selectedMember.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedMember.name}</h1>
              <p className="text-xl text-gray-600">{selectedMember.batch}</p>
              <div className="flex items-center gap-4 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMember.feeStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : selectedMember.feeStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  Fee Status: {selectedMember.feeStatus.charAt(0).toUpperCase() + selectedMember.feeStatus.slice(1)}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Grade: {selectedMember.performanceMetrics.overallGrade}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="text-gray-500" size={20} />
                  <span className="text-gray-700">{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-500" size={20} />
                  <span className="text-gray-700">{selectedMember.phone}</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Age</p>
                  <p className="text-lg font-bold text-blue-600">{selectedMember.basicInfo.age} years</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Address</p>
                  <p className="text-gray-700">{selectedMember.basicInfo.address}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Previous Education</p>
                  <p className="text-gray-700">{selectedMember.basicInfo.previousEducation}</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Attendance Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                      style={{ width: `${selectedMember.performanceMetrics.attendanceScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedMember.performanceMetrics.attendanceScore}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Assignment Completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                      style={{ width: `${selectedMember.performanceMetrics.assignmentCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMember.performanceMetrics.assignmentCompletion}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Test Scores</p>
                  <div className="flex gap-2">
                    {selectedMember.performanceMetrics.testScores.map((score, index) => (
                      <div key={index} className="bg-white px-3 py-2 rounded border">
                        <span className="font-semibold">{score}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Average:{" "}
                    {Math.round(
                      selectedMember.performanceMetrics.testScores.reduce((a, b) => a + b, 0) /
                        selectedMember.performanceMetrics.testScores.length,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Organization Members</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("faculties")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "faculties" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Faculties ({faculties.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Students ({students.length})
          </button>
        </div>
      </div>

      {activeTab === "faculties" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((faculty) => (
            <motion.div
              key={faculty.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedMember({ ...faculty, type: "faculty" })}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {faculty.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{faculty.name}</h3>
                  <p className="text-gray-600">{faculty.subjects.join(", ")}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-semibold text-gray-900">{faculty.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-semibold text-blue-600">{faculty.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classes/Day:</span>
                  <span className="font-semibold text-purple-600">{faculty.averageClassesPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-green-600">{faculty.rating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-semibold text-green-600">₹{faculty.salary.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Batch Assignments:</p>
                <div className="flex flex-wrap gap-1">
                  {faculty.batchAssignments.slice(0, 2).map((batch, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {batch}
                    </span>
                  ))}
                  {faculty.batchAssignments.length > 2 && (
                    <span className="text-xs text-gray-500">+{faculty.batchAssignments.length - 2} more</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${faculty.performanceMetrics.combinedPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Overall Performance: {faculty.performanceMetrics.combinedPercentage}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <motion.div
              key={student.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedMember({ ...student, type: "student" })}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{student.name}</h3>
                  <p className="text-gray-600">{student.batch}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold text-gray-900">{student.basicInfo.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance:</span>
                  <span className="font-semibold text-blue-600">{student.performanceMetrics.attendanceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-semibold text-green-600">{student.performanceMetrics.overallGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Status:</span>
                  <span
                    className={`font-semibold ${
                      student.feeStatus === "paid"
                        ? "text-green-600"
                        : student.feeStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Test Scores:</p>
                <div className="flex gap-1">
                  {student.performanceMetrics.testScores.slice(0, 4).map((score, index) => (
                    <div key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {score}%
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${student.performanceMetrics.attendanceScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Attendance Score: {student.performanceMetrics.attendanceScore}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
export default OrganizationMembers