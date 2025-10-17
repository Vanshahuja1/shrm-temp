"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import type { ManagerInfo } from "../types"

// Type for new task form data
interface NewTaskData {
  title: string;
  description: string;
  department: string;
  team: string;
  assignedTo: string;
  priority: "high" | "medium" | "low";
  weightage: string;
  dueDate: string;
  dueTime: string;
}

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: NewTaskData) => void
  managerInfo: ManagerInfo
}

export default function NewTaskModal({ isOpen, onClose, onSubmit, managerInfo }: NewTaskModalProps) {
  const [formData, setFormData] = useState<NewTaskData>({
    title: "",
    description: "",
    department: "",
    team: "",
    assignedTo: "",
    priority: "medium",
    weightage: "5",
    dueDate: "",
    dueTime: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      department: "",
      team: "",
      assignedTo: "",
      priority: "medium",
      weightage: "5",
      dueDate: "",
      dueTime: "",
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">Assign New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Enter task description"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Department</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Team</option>
                <option value="Development Team A">Development Team A</option>
                <option value="Infrastructure Team">Infrastructure Team</option>
              </select>
            </div>
          </div>
                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Member (Employees/Interns Only)</label>
             <select
               value={formData.assignedTo}
               onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
               required
             >
               <option value="">Select Member</option>
               {managerInfo.employees.map((employee) => (
                 <option key={employee.id} value={employee.name}>
                   {employee.name} - {employee.department}
                 </option>
               ))}
             </select>
             <p className="text-xs text-gray-500 mt-1">
               Note: &quot;Assigned By&quot; will automatically be set to you (current manager)
             </p>
           </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "high" | "medium" | "low" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.weightage}
                onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="5"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Assign & Send Email</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
