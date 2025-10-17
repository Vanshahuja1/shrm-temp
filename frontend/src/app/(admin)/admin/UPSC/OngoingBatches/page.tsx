"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Plus, Users, GraduationCap, BookOpen, Clock } from "lucide-react"

// Define the Batch type inline since it's imported from a relative path
interface Batch {
  id: string
  name: string
  type: "morning" | "evening"
  startTime: string
  endTime: string
  fees: number
  studentCount: number
  capacity: number
  facultyInvolved: string[]
  syllabusPercentComplete: number
  duration: string
  startDate: string
  subjects: string[]
}

const OngoingBatches: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockBatches: Batch[] = [
      {
        id: "1",
        name: "UPSC Prelims 2024",
        type: "morning",
        startTime: "9:00 AM",
        endTime: "1:00 PM",
        fees: 45000,
        studentCount: 45,
        capacity: 50,
        facultyInvolved: ["Dr. Rajesh Kumar", "Prof. Priya Sharma", "Mr. Anil Singh"],
        syllabusPercentComplete: 75,
        duration: "6 months",
        startDate: "2024-01-15",
        subjects: ["History", "Geography", "Polity", "Economics", "Science & Technology"]
      },
      {
        id: "2",
        name: "UPSC Mains 2024",
        type: "evening",
        startTime: "2:00 PM",
        endTime: "6:00 PM",
        fees: 55000,
        studentCount: 30,
        capacity: 35,
        facultyInvolved: ["Dr. Meera Gupta", "Prof. Suresh Yadav"],
        syllabusPercentComplete: 60,
        duration: "8 months",
        startDate: "2024-02-01",
        subjects: ["Essay", "General Studies", "Optional Subject", "Ethics"]
      }
    ]
    setBatches(mockBatches)
  }, [])

  if (selectedBatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedBatch(null)}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Batches
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedBatch.name}</h1>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedBatch.type === "morning" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedBatch.type === "morning" ? "Morning Batch" : "Evening Batch"}
                </span>
                <span className="text-gray-600">
                  {selectedBatch.startTime} - {selectedBatch.endTime}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{selectedBatch.fees.toLocaleString()}</p>
              <p className="text-gray-600">Course Fees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-blue-600" size={20} />
                <span className="text-blue-800 font-semibold">Students</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {selectedBatch.studentCount}/{selectedBatch.capacity}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="text-green-600" size={20} />
                <span className="text-green-800 font-semibold">Faculty Count</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{selectedBatch.facultyInvolved.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-purple-600" size={20} />
                <span className="text-purple-800 font-semibold">Syllabus</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{selectedBatch.syllabusPercentComplete}%</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-red-600" size={20} />
                <span className="text-red-800 font-semibold">Duration</span>
              </div>
              <p className="text-lg font-semibold text-red-600">{selectedBatch.duration}</p>
            </div>
          </div>

          {/* Faculty Involved */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Faculty Involved</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBatch.facultyInvolved.map((faculty, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {faculty
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="font-semibold text-gray-900">{faculty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Progress */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Syllabus Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{ width: `${selectedBatch.syllabusPercentComplete}%` }}
              >
                <span className="text-white text-sm font-semibold">{selectedBatch.syllabusPercentComplete}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedBatch.syllabusPercentComplete}% of syllabus completed</p>
          </div>

          {/* Subjects */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Subjects Covered</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedBatch.subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <BookOpen size={20} className="text-red-600" />
                  <span className="font-semibold text-gray-900">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ongoing Batches</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Add New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => (
          <motion.div
            key={batch.id}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSelectedBatch(batch)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{batch.name}</h3>
              <ChevronRight className="text-red-600" size={20} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Time:</p>
                <p className="font-semibold text-gray-900">
                  {batch.startTime} - {batch.endTime}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Students:</p>
                <p className="font-semibold text-blue-600">
                  {batch.studentCount}/{batch.capacity}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Faculty:</p>
                <p className="font-semibold text-green-600">{batch.facultyInvolved.length} Members</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Syllabus:</p>
                <p className="font-semibold text-purple-600">{batch.syllabusPercentComplete}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${batch.syllabusPercentComplete}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Started: {batch.startDate}</span>
              <span className="font-semibold text-green-600">₹{batch.fees.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OngoingBatches