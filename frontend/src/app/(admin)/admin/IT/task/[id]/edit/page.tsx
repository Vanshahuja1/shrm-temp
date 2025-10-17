"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosInstance"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Task } from "../../../../types"

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function EditTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [managers, setManagers] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch task and organizational members on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch task details
        const taskResponse = await axiosInstance.get(`/tasks/${id}`)
        setTask(taskResponse.data)

        // Fetch organizational members
        const orgResponse = await axiosInstance.get("/IT/org-members/empInfo")
        const allMembers: Employee[] = orgResponse.data

        // All employees for "Assigned To"
        setEmployees(allMembers)

        // Filter managers and HR for "Assigned By"
        const managersAndHR = allMembers.filter(
          (member) =>
            member.role?.toLowerCase().includes("manager") ||
            member.role?.toLowerCase().includes("employee") 
        )
        setManagers(managersAndHR)

        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch task details")
        router.push("/admin/IT/task")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!task) return

    // Validate due date is greater than today
    const today = new Date().toISOString().split("T")[0];
    if (task.dueDate <= today) {
      setError("Due date must be greater than today");
      return;
    }

    try {
      const response = await axiosInstance.put(`/tasks/${task._id}`, task)
      console.log("Updated Task:", response.data)
      router.push(`/admin/IT/task/${task._id}`)
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) return null

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        <button
          onClick={() => router.push(`/admin/IT/task/${task._id}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          ← Back to Task
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6"
      >
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={task.title}
              onChange={(e) =>
                setTask({ ...task, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Assigned To
            </label>
            {loading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading employees...
              </div>
            ) : (
              <Select
                value={task.assignedTo.id}
                onValueChange={(value) => {
                  const selectedEmployee = employees.find(emp => emp.id === value);
                  if (selectedEmployee) {
                    setTask({ 
                      ...task, 
                      assignedTo: { 
                        id: selectedEmployee.id, 
                        name: selectedEmployee.name 
                      } 
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role}) - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Assigned By
            </label>
            {loading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading managers...
              </div>
            ) : (
              <Select
                value={task.assignedBy.id}
                onValueChange={(value) => {
                  const selectedManager = managers.find(mgr => mgr.id === value);
                  if (selectedManager) {
                    setTask({ 
                      ...task, 
                      assignedBy: { 
                        id: selectedManager.id, 
                        name: selectedManager.name 
                      } 
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select manager/HR" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role}) - {manager.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={task.dueDate}
              onChange={(e) =>
                setTask({ ...task, dueDate: e.target.value })
              }
              min={
                new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Due date must be at least tomorrow
            </p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={task.status}
              onValueChange={(value) =>
                setTask({
                  ...task,
                  status: value as Task["status"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Priority
            </label>
            <Select
              value={task.priority}
              onValueChange={(value) =>
                setTask({
                  ...task,
                  priority: value as Task["priority"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.push(`/admin/IT/task/${task._id}`)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Update Task
          </button>
        </div>
      </form>
    </div>
  )
}
