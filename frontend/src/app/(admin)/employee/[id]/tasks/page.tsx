"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface TaskResponse {
  employeeId: string;
  response: string;
  format: "text" | "document";
  documents: string[];
  submittedAt: string;
  status: string;
  rating: number | null;
  reviewedBy: string | null;
  reviewComments: string;
}

interface EmployeeTask {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: string;
  dueDate: string;
  dueTime: string;
  assignedTo: {
    id: string;
    name: string;
  };
  responses: TaskResponse[];
}

type AlertType = "success" | "error" | "info" | null;

interface AlertState {
  type: AlertType;
  message: string;
}

export default function TaskResponsesPage() {
  const { id: employeeId } = useParams();
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alert.type) {
      const timer = setTimeout(() => {
        setAlert({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const fetchTaskResponses = useCallback(async () => {
    if (!employeeId) {
      showAlert("error", "Employee ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/task-responses/employee/${employeeId}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
        if (response.data.length === 0) {
          showAlert("info", "No tasks found for this employee");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Failed to fetch task responses:", error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 404) {
          showAlert("error", "Employee or tasks not found");
        } else if (status === 401 || status === 403) {
          showAlert("error", "You don't have permission to view these tasks");
        } else if (status >= 500) {
          showAlert("error", "Server error. Please try again later");
        } else {
          showAlert("error", error.response.data?.message || "Failed to fetch tasks");
        }
      } else if (error.request) {
        // Request made but no response
        showAlert("error", "Network error. Please check your connection");
      } else {
        // Something else happened
        showAlert("error", "An unexpected error occurred");
      }
      
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTaskResponses();
  }, [fetchTaskResponses]);

  const handleAddResponse = async (
    taskId: string,
    response: string,
    format: "text" | "document",
    documents: string[] = []
  ) => {
    // Validation
    if (!response.trim()) {
      showAlert("error", "Response cannot be empty");
      return;
    }

    if (response.trim().length < 10) {
      showAlert("error", "Response must be at least 10 characters long");
      return;
    }

    if (!employeeId || !taskId) {
      showAlert("error", "Invalid employee or task ID");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(
        `/employees/${employeeId}/tasks/${taskId}/response`,
        {
          response: response.trim(),
          format,
          documents,
        }
      );
      
      showAlert("success", "Response submitted successfully!");
      setNewResponse("");
      setSelectedTaskId(null);
      
      // Refresh task list
      await fetchTaskResponses();
    } catch (error: any) {
      console.error("Failed to add response:", error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          showAlert("error", error.response.data?.message || "Invalid response data");
        } else if (status === 401 || status === 403) {
          showAlert("error", "You don't have permission to submit responses");
        } else if (status === 404) {
          showAlert("error", "Task not found");
        } else if (status === 409) {
          showAlert("error", "Response already exists or task is locked");
        } else if (status >= 500) {
          showAlert("error", "Server error. Please try again later");
        } else {
          showAlert("error", "Failed to submit response");
        }
      } else if (error.request) {
        showAlert("error", "Network error. Please check your connection");
      } else {
        showAlert("error", "An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelResponse = () => {
    setSelectedTaskId(null);
    setNewResponse("");
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "info":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {alert.type && (
        <Alert className={`flex items-start gap-3 ${getAlertColor(alert.type)}`}>
          {getAlertIcon(alert.type)}
          <AlertDescription className="flex-1">{alert.message}</AlertDescription>
          <button
            onClick={() => setAlert({ type: null, message: "" })}
            className="text-current hover:opacity-70"
          >
            ✕
          </button>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task List</h2>
        <button
          onClick={fetchTaskResponses}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h3>
          <p className="text-gray-600">There are no tasks assigned to this employee yet.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task._id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
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
            
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                Status: <span className="font-medium">{task.status}</span>
              </span>
              <span className="flex items-center gap-1">
                Due: <span className="font-medium">{task.dueDate} at {task.dueTime}</span>
              </span>
            </div>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="responses">
                <AccordionTrigger>
                  Responses ({task.responses?.length || 0})
                </AccordionTrigger>
                <AccordionContent>
                  {task.responses && task.responses.length > 0 ? (
                    task.responses.map((response, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-200"
                      >
                        <p className="text-sm text-gray-800 mb-2">{response.response}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span>
                            Submitted: {new Date(response.submittedAt).toLocaleString()}
                          </span>
                          <span className="font-medium">Status: {response.status}</span>
                          {response.rating && (
                            <span>Rating: {response.rating}/5</span>
                          )}
                        </div>
                        {response.reviewComments && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            Review: {response.reviewComments}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No responses yet</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {selectedTaskId === task._id ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your response here (minimum 10 characters)"
                  disabled={submitting}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddResponse(task._id, newResponse, "text")}
                    disabled={submitting || !newResponse.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Response"}
                  </button>
                  <button
                    onClick={handleCancelResponse}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedTaskId(task._id)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Response
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}