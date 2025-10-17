"use client";

import { Plus} from "lucide-react";
import { useParams } from "next/navigation";
import type { Employee, Task } from "../types";
import { useEffect, useState } from "react";
import { mockTasks } from "../data/mockData";
import axiosInstance from "@/lib/axiosInstance";
export default function TaskAssignment() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { id: managerId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Task, "_id">>({
    title: "",
    description: "",
    assignedTo: { id: "", name: "" },
    assignedBy: {
      id: typeof managerId === "string" ? managerId : "",
      name: "",
    },
    dueDate: "",
    dueTime: "",
    status: "pending",
    priority: "medium",
    weightage: 5,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all tasks and filter by assignedBy.id === managerId
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        const data = response.data;
        // Only show tasks assigned by this manager
        setTasks(
          data.filter((task: Task) => task.assignedBy?.id === managerId)
        );
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks(
          mockTasks.filter((task: Task) => task.assignedBy?.id === managerId)
        );
      }
    };
    fetchTasks();
    // Fetch org members for modal dropdowns
    const fetchOrgMembers = async () => {
      try {
        const response = await axiosInstance.get("/IT/org-members/empInfo");
        const allMembers = response.data;
        
        // Filter only employees and interns for "Assigned To" (not managers or HR)
        const assignableEmployees = allMembers.filter(
          (member: Employee) => {
            const role = member.role?.toLowerCase();
            return role === "employee" || role === "intern";
          }
        );
        setEmployees(assignableEmployees);
        
        const currentManager = allMembers.find((m: Employee) => m.id === managerId);
        if (currentManager) {
          setFormData((prev) => ({
            ...prev,
            assignedBy: { id: currentManager.id, name: currentManager.name },
          }));
        }
      } catch {
        // fallback: empty
        setEmployees([]);
      }
    };
    fetchOrgMembers();
  }, [managerId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Assignment</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Assign New Task</span>
        </button>
      </div>
      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                setEditTaskId(null);
                setFormData({
                  title: "",
                  description: "",
                  assignedTo: { id: "", name: "" },
                  assignedBy: {
                    id: typeof managerId === "string" ? managerId : "",
                    name: "",
                  },
                  dueDate: "",
                  dueTime: "",
                  status: "pending",
                  priority: "medium",
                  weightage: 5,
                });
              }}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editTaskId ? "Edit Task" : "Add New Task"}
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                // Validate due date
                const today = new Date().toISOString().split("T")[0];
                if (formData.dueDate <= today) {
                  setError("Due date must be greater than today");
                  setLoading(false);
                  return;
                }
                try {
                  if (editTaskId) {
                    // Edit mode
                    await axiosInstance.put(`/tasks/${editTaskId}`, formData);
                  } else {
                    // Add mode, remove _id if present
                    await axiosInstance.post("/tasks", { ...formData });
                  }
                  setShowModal(false);
                  setEditTaskId(null);
                  setFormData({
                    title: "",
                    description: "",
                    assignedTo: { id: "", name: "" },
                    assignedBy: {
                      id: typeof managerId === "string" ? managerId : "",
                      name: "",
                    },
                    dueDate: "",
                    dueTime: "",
                    status: "pending",
                    priority: "medium",
                    weightage: 5,
                  });
                  setError(null);
                  setLoading(false);
                  // Refresh tasks
                  const response = await axiosInstance.get("/tasks");
                  const data = response.data;
                  setTasks(
                    data.filter(
                      (task: Task) => task.assignedBy?.id === managerId
                    )
                  );
                } catch {
                  setError(
                    editTaskId
                      ? "Failed to update task. Please try again."
                      : "Failed to create task. Please try again."
                  );
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
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
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.assignedTo.id}
                  onChange={(e) => {
                    const selected = employees.find(
                      (emp) => emp.id === e.target.value
                    );
                    if (selected) {
                      setFormData({
                        ...formData,
                        assignedTo: { id: selected.id, name: selected.name },
                      });
                    }
                  }}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) - {emp.department}
                    </option>
                  ))}
                </select>
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
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        

      <div className="grid gap-6">
        {tasks.map((task) => (
          <div
            key={task._id || task.id}
            className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {task.title}
                </h3>
                <p className="text-gray-600 mt-2">{task.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {task.assignedTo?.name} ({task.assignedTo?.id})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2 text-gray-500">{task.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Time:</span>
                    <span className="ml-2 text-gray-500">{task.dueTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 text-gray-500">{task.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weightage:</span>
                    <span className="ml-2 text-gray-500">
                      {task.weightage}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span
                      className={`ml-2 font-medium px-2 py-1 rounded-full text-xs ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 font-medium px-2 py-1 rounded-full text-xs ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-6">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 text-sm font-medium"
                  onClick={() => {
                    setFormData({ ...task });
                    setEditTaskId(task._id || null);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 text-sm font-medium"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteTaskId(task._id || null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTaskId(null);
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6 text-center">Delete Task</h2>
            <p className="mb-6 text-center text-gray-700">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTaskId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                onClick={async () => {
                  if (deleteTaskId) {
                    await axiosInstance.delete(`/tasks/${deleteTaskId}`);
                    setTasks((prev) =>
                      prev.filter((t) => t._id !== deleteTaskId)
                    );
                  }
                  setShowDeleteModal(false);
                  setDeleteTaskId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
