"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Clock } from "lucide-react"
import { Task } from "../types/index"
import { Target, CheckCircle, AlertCircle } from "lucide-react"

// Task Management Component
const TaskManagement: React.FC = () => {
  const [filterType, setFilterType] = useState("all")
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Mock tasks data - replace with actual API call
    const mockTasks: Task[] = [
      {
        id: 1,
        title: "Review Q1 Performance Reports",
        description: "Analyze and review all department performance reports for Q1",
        assignedTo: "Priya Sharma",
        assignedBy: "Director",
        dueDate: "2024-04-15",
        status: "pending",
        priority: "high",
        type: "manager-todo",
      },
      {
        id: 2,
        title: "Update Student Database",
        description: "Update all student records with latest contact information",
        assignedTo: "Rahul Sinha",
        assignedBy: "Priya Sharma",
        dueDate: "2024-04-10",
        status: "in-progress",
        priority: "medium",
        type: "employee-task",
      },
      {
        id: 3,
        title: "Prepare Faculty Schedule",
        description: "Create and finalize the faculty schedule for next month",
        assignedTo: "Dr. Anil Kumar",
        assignedBy: "Director",
        dueDate: "2024-04-20",
        status: "completed",
        priority: "high",
        type: "manager-todo",
      },
      {
        id: 4,
        title: "Organize Student Orientation",
        description: "Plan and execute orientation program for new batch",
        assignedTo: "Ankit Jain",
        assignedBy: "Priya Sharma",
        dueDate: "2024-04-25",
        status: "pending",
        priority: "low",
        type: "employee-task",
      },
    ]
    setTasks(mockTasks)
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filterType === "all") return true
    return task.type === filterType
  })

  const getStatusColor = (status : "completed" | "in-progress" | "pending") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority : "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "all" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilterType("manager-todo")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "manager-todo" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Manager TODOs
          </button>
          <button
            onClick={() => setFilterType("employee-task")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "employee-task" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Employee Tasks
          </button>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-blue-600" size={24} />
            <span className="font-semibold text-gray-700">Total Tasks</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <span className="font-semibold text-gray-700">Completed</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{tasks.filter((t) => t.status === "completed").length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-yellow-600" size={24} />
            <span className="font-semibold text-gray-700">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{tasks.filter((t) => t.status === "in-progress").length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <span className="font-semibold text-gray-700">Pending</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{tasks.filter((t) => t.status === "pending").length}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          {filterType === "all" ? "All Tasks" : filterType === "manager-todo" ? "Manager TODOs" : "Employee Tasks"}
        </h3>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ y: -1, scale: 1.01 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{task.title}</h4>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>
                    Assigned to: <span className="font-semibold">{task.assignedTo}</span>
                  </p>
                  <p>
                    Due: <span className="font-semibold">{task.dueDate}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default TaskManagement