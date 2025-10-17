export type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  performance: number;
  attendance: number;
  tasksPerDay: number;
  managerRating: number;
  role: string;
}

export type Intern = {
  id: number
  name: string
  department: string
  duration: string
  mentor: string
  performance: number
  startDate: string
  endDate: string
}

export type Project = {
  id: number
  name: string
  description: string
  progress: number
  employees: string[]
  startDate: string
  endDate: string
  status: "ongoing" | "completed" | "paused"
  priority: "high" | "medium" | "low"
  budget: number
  actualCost: number
}

export type Task = {
_id?: string;
id?: number;
title: string;
description: string;
assignedTo: { id: string; name: string };
assignedBy: { id: string; name: string };
department?: string;
team?: string;
priority: "high" | "medium" | "low";
weightage: number;
dueDate: string;
dueTime: string;
status: "pending" | "in-progress" | "completed";
responses?: TaskResponse[];
emailSent?: boolean;
createdAt?: string;
category?: string;
estimatedHours?: number;
actualHours?: number;
tags?: string[];
attachments?: unknown[];
}

export type TaskResponse = {
  id: number
  employee: string
  response: string
  timestamp: string
  rating?: number
  documents?: string[]
  format: "text" | "document"
}

export type AttendanceRecord = {
  date: string
  employee: string
  punchIn: string
  punchOut: string
  status: "present" | "absent" | "late" | "half-day"
  regularized: boolean
  regularizationReason?: string
  totalHours: number
}

type ManagerCore = {
  employees: Employee[]
  interns: Intern[]
  bankDetails: {
    accountNumber: string
    bankName: string
    ifsc: string
    branch: string
  }
  salary: {
    basic: number
    allowances: number
    total: number
    lastAppraisal: string
  }
}

export type ManagerInfo = ManagerCore & {
  [key: string]: unknown
}

export type EmailNotification = {
  id: number
  to: string
  subject: string
  message: string
  type: "task_assignment" | "task_reminder" | "performance_review"
  sent: boolean
  timestamp: string
}

export type ProjectUpdate = {
  projectId: number
  projectName: string
  oldProgress: number
  newProgress: number
  updatedBy: string
  timestamp: string
}

export type EmployeeResponse = {
  taskId: number
  taskTitle: string
  employee: string
  rating: number
  ratedBy: string
  timestamp: string
}

export type AttendanceData = {
  employee: string
  date: string
  action: string
  reason: string
  approvedBy: string
  timestamp: string
}

export type AdminData = {
  projectUpdates: ProjectUpdate[]
  employeeResponses: EmployeeResponse[]
  attendanceData: AttendanceData[]
  performanceMetrics: unknown[]
}

