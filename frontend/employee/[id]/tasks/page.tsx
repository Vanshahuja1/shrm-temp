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

export default function TaskResponsesPage() {
  const { id: employeeId } = useParams();
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTaskResponses = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/task-responses/employee/${employeeId}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch task responses:", error);
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
    try {
      await axiosInstance.post(
        `/employees/${employeeId}/tasks/${taskId}/response`,
        {
          response,
          format,
          documents,
        }
      );
      setNewResponse("");
      setSelectedTaskId(null);
      fetchTaskResponses();
    } catch (error) {
      console.error("Failed to add response:", error);
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
      <h2 className="text-2xl font-bold text-gray-900">Task Responses</h2>
      {tasks.map((task) => (
        <div key={task._id} className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
          <p className="text-sm text-gray-600">Priority: {task.priority}</p>
          <p className="text-sm text-gray-600">Status: {task.status}</p>
          <p className="text-sm text-gray-600">
            Due: {task.dueDate} at {task.dueTime}
          </p>

          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="responses">
              <AccordionTrigger>Responses</AccordionTrigger>
              <AccordionContent>
                {task.responses.map((response, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg p-3 mt-2 border border-gray-300"
                  >
                    <p className="text-sm text-gray-800">{response.response}</p>
                    <p className="text-xs text-gray-600">
                      Submitted at:{" "}
                      {new Date(response.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {response.status}
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {selectedTaskId === task._id ? (
            <div className="mt-4">
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Add your response here"
              ></textarea>
              <button
                onClick={() => handleAddResponse(task._id, newResponse, "text")}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Submit Response
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedTaskId(task._id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Response
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
