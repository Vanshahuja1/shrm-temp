"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
import type { Task } from "../../types"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/tasks")
        console.log(response.data)
        setTasks(response.data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch tasks")
        console.error("Error fetching tasks:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={() => router.push("/admin/IT/task/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Task
        </button>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Tasks" value={tasks.length} Icon={CheckSquare} color="blue" />
        <StatCard label="Pending" value={tasks.filter((t) => t.status === "pending").length} Icon={Clock} color="yellow" />
        <StatCard label="In Progress" value={tasks.filter((t) => t.status === "in-progress").length} Icon={AlertCircle} color="blue" />
        <StatCard label="Completed" value={tasks.filter((t) => t.status === "completed").length} Icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <motion.div
            key={task._id}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all space-y-4 cursor-pointer"
            onClick={() => router.push(`/admin/IT/task/${task._id}`)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{task.title}</h3>
              
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
            <div className="text-sm text-gray-600">
              <span>Assigned to: {task.assignedTo.name} ({task.assignedTo.id})</span>
              <br />
              <span>Due: {task.dueDate}</span>
            </div>
            <div className="flex gap-2 pt-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string
  value: number
  Icon: React.ElementType
  color: "blue" | "yellow" | "green"
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
