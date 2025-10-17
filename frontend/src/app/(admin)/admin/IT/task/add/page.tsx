"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "../../../types";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function AddTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Task, "_id">>({
    title: "",
    description: "",
    assignedTo: {
      id: "",
      name: "",
    },
    assignedBy: {
      id: "",
      name: "",
    },
    dueDate: "",
    status: "pending",
    priority: "medium",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Fetch organizational members on component mount
  useEffect(() => {
    const fetchOrgMembers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/IT/org-members/empInfo");
        const allMembers: Employee[] = response.data;

        // Filter only employees and interns for "Assigned To" (not managers or HR)
        const assignableEmployees = allMembers.filter(
          (member) => {
            const role = member.role?.toLowerCase();
            return role === "employee" || role === "intern";
          }
        );
        setEmployees(assignableEmployees);

        // Filter only managers for "Assigned By" (not HR or other roles)
        const managersOnly = allMembers.filter(
          (member) => {
            const role = member.role?.toLowerCase();
            return role === "manager";
          }
        );
        setManagers(managersOnly);

        setError(null);
      } catch (err) {
        setError("Failed to fetch organization members");
        console.error("Error fetching org members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgMembers();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate due date is greater than today
    const today = new Date().toISOString().split("T")[0];
    if (formData.dueDate <= today) {
      setError("Due date must be greater than today");
      return;
    }

    // Validate that a manager is assigned
    if (!formData.assignedBy.id) {
      setError("Please select a manager to assign the task");
      return;
    }

    // Validate that an employee/intern is assigned
    if (!formData.assignedTo.id) {
      setError("Please select an employee or intern to assign the task to");
      return;
    }

    try {
      const response = await axiosInstance.post("/tasks", formData);
      console.log("Created Task:", response.data);
      router.push("/admin/IT/task");
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Add New Task</h1>
        <button
          onClick={() => router.push("/admin/IT/task")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Tasks
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6"
      >
     
        
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Assigned To
            </label>
            {loading ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading employees and interns...
              </div>
            ) : (
              <Select
                value={formData.assignedTo.id}
                onValueChange={(value) => {
                  const selectedEmployee = employees.find(emp => emp.id === value);
                  if (selectedEmployee) {
                    setFormData({ 
                      ...formData, 
                      assignedTo: { 
                        id: selectedEmployee.id, 
                        name: selectedEmployee.name 
                      } 
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an employee or intern" />
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Assigned By
            </label>
            {loading ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading managers...
              </div>
            ) : (
              <Select
                value={formData.assignedBy.id}
                onValueChange={(value) => {
                  const selectedManager = managers.find(mgr => mgr.id === value);
                  if (selectedManager) {
                    setFormData({ 
                      ...formData, 
                      assignedBy: { 
                        id: selectedManager.id, 
                        name: selectedManager.name 
                      } 
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a manager" />
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Priority
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
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

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/IT/task")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Task
          </button>
        </div>
      </form>
    </div>
  );
}
