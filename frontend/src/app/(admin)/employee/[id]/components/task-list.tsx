"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Clock, CheckCircle, FileText, Upload, Send } from "lucide-react";
import type { EmployeeTask } from "../../types/employees";

interface TaskListProps {
  tasks: EmployeeTask[];
  onTaskResponse: (
    taskId: number,
    response: string,
    format: "text" | "document",
    documents?: string[]
  ) => void;
}

export function TaskList({ tasks, onTaskResponse }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [responseFormat, setResponseFormat] = useState<"text" | "document">(
    "text"
  );
  const [documents, setDocuments] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileNames: string[] = Array.from(files).map((file) => file.name);
    setDocuments(fileNames);
  };

  const handleSubmitResponse = (taskId: number) => {
    if (response.trim()) {
      onTaskResponse(taskId, response, responseFormat, documents);
      setResponse("");
      setDocuments([]);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task List</h2>
        <div className="text-sm text-gray-600">
          Total Tasks: {tasks.length} | Completed:{" "}
          {tasks.filter((t) => t.status === "completed").length}
        </div>
      </div>

      <div className="grid gap-6">
        {tasks
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })
          .map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-sm border border-blue-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority.toUpperCase()} Priority
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      Weight: {task.weightage}/10
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Due: {task.dueDate} at {task.dueTime}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Assigned by: {task.assignedBy} | Created: {task.createdAt}
                  </p>
                </div>
                <div className="text-right ml-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {task.response && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Your Response
                  </h4>
                  <p className="text-blue-800 mb-2">{task.response.response}</p>
                  {task.response.documents && task.response.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {task.response.documents.map((doc, index) => {
                        const isString = typeof doc === "string";
                        const filename = isString
                          ? doc
                          : doc?.originalName || doc?.filename || `Document ${index + 1}`;
                        const key = isString
                          ? doc
                          : doc?.filename || doc?.originalName || index;
                        return (
                          <span
                            key={key}
                            className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs flex items-center"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            {filename}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">
                      Submitted: {task.response.submittedAt}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.response.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {task.response.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {task.status !== "completed" && (
                <div className="border-t border-blue-100 pt-4">
                  {selectedTask === task.id ? (
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setResponseFormat("text")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            responseFormat === "text"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Text Response
                        </button>
                        <button
                          onClick={() => setResponseFormat("document")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            responseFormat === "document"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Document Upload
                        </button>
                      </div>

                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder={
                          responseFormat === "text"
                            ? "Enter your response..."
                            : "Add description for uploaded documents..."
                        }
                      />

                      {responseFormat === "document" && (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">
                            Click to upload documents or drag and drop
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {documents.length > 0 && (
                            <div className="mt-3 text-xs text-gray-700">
                              {documents.length} file(s) selected
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSubmitResponse(task.id)}
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Response</span>
                        </button>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTask(task.id)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>
                        {task.response ? "Update Response" : "Add Response"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
