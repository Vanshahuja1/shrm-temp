"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface TaskResponse {
  _id: string;
  employeeId: string;
  response: string;
  format: "text" | "document";
  documents: string[];
  status: string;
  rating: number | null;
  submittedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: {
    id: string;
    name: string;
  };
  assignedBy: {
    id: string;
    name: string;
  };
  priority: "high" | "medium" | "low";
  dueDate: string;
  dueTime: string;
  responses?: TaskResponse[];
}
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import axios from "@/lib/axiosInstance";

export default function EmployeeResponse() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { id: managerId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/task-responses/manager/${managerId}`);
        setTasks(res.data);
      } catch {
        console.log("Failed to fetch tasks, using mock data");
      }
    };
    fetchData();
  }, [managerId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Employee Responses</h2>

      {tasks.map((task) => (
        <div
          key={task._id}
          className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                  ? "default"
                  : "secondary"
              }
            >
              {task.priority.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <p className="text-sm text-gray-600 mb-2">
            Assigned to: <span className="font-medium text-gray-800">{task.assignedTo.name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Due: {task.dueDate} at {task.dueTime}
          </p>
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="responses">
              <AccordionTrigger>Responses</AccordionTrigger>
              <AccordionContent>
                {task.responses && task.responses.length > 0 ? (
                  task.responses.map((response) => (
                    <div
                      key={response._id}
                      className="bg-gray-50 rounded-lg p-4 mt-2 border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {response.response}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            By: {task.assignedTo.name}
                          </p>
                        </div>
                        <Badge variant="outline">{response.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Submitted at:{" "}
                        {new Date(response.submittedAt).toLocaleString()}
                      </p>
                      {response.documents && response.documents.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">
                            Documents:
                          </span>
                          <ul className="list-disc list-inside mt-1">
                            {response.documents.map((doc, index) => (
                              <li key={index} className="text-xs text-blue-600">
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No responses yet.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
