"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { CheckCircle, AlertCircle, Clock, Edit, Trash2 } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
import type { Task } from "../../../types"

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/tasks/${id}`)
        setTask(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching task:", err)
        setError("Failed to fetch task details")
        notFound()
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTask()
    }
  }, [id])

  const handleDeleteTask = async () => {
    if (!task) return
    
    try {
      setIsDeleting(true)
      await axiosInstance.delete(`/tasks/${task._id}`)
      console.log("Task deleted successfully")
      router.push("/admin/IT/task")
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task. Please try again.")
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

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

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-600" size={20} />
      case "in-progress":
        return <AlertCircle className="text-blue-600" size={20} />
      case "completed":
        return <CheckCircle className="text-green-600" size={20} />
    }
  }

  if (!task) return null

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => router.push("/admin/IT/task")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          ← Back to Tasks
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/IT/task/${task._id}/edit`)}
            className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit size={16} />
            Edit Task
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-white bg-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{task.title}</h1>
                <div className="prose prose-gray max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              </div>

              {/* Status and Priority Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Metadata - Right Column */}
        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Assigned To</p>
                <button 
                  onClick={() => router.push(`/admin/IT/members/${task.assignedTo.id}`)}
                  className="text-lg cursor-pointer font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                >
                  {task.assignedTo.name}
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">Assigned By</p>
                <button 
                  onClick={() => router.push(`/admin/IT/members/${task.assignedBy.id}`)}
                  className="text-lg cursor-pointer font-semibold text-green-900 hover:text-green-700 transition-colors"
                >
                  {task.assignedBy.name}
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Due Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(task.dueDate) > new Date() 
                    ? `${Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                    : 'Overdue'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Task ID */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Task ID</p>
              <p className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                {task._id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete &ldquo;<span className="font-medium">{task?.title}</span>&rdquo;? 
                This will permanently remove the task and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
