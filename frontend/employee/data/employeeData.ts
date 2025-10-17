import type {
  EmployeeInfo,
  EmployeeTask,
  AttendanceRecord,
  PerformanceMetrics,
  WorkHours,
  OvertimeRequest,
  DataToAdmin,
  DataToManager,
  EmployeeSettings,
} from "../types/employees"

export const mockEmployeeInfo: EmployeeInfo = {
  id: "EMP001",
  name: "Alice Smith",
  role: "Senior Developer",
  designation: "Frontend Developer",
  department: "Software Development",
  manager: "Sarah Johnson",
  email: "alice.smith@company.com",
  phone: "+1 (555) 111-1111",
  joinDate: "2022-01-15",
  employeeId: "EMP001",
  bankDetails: {
    accountNumber: "****5678",
    bankName: "Wells Fargo",
    ifsc: "WFBIUS6S",
    branch: "Downtown Branch",
  },
  salary: {
    basic: 75000,
    allowances: 10000,
    total: 85000,
    lastAppraisal: "2023-12-15",
  },
  personalInfo: {
    address: "456 Oak Street, City, State 12345",
    emergencyContact: "+1 (555) 888-8888",
    dateOfBirth: "1990-03-20",
    identityDocuments: [
      {
        id: 1,
        type: "Aadhar",
        number: "****-****-1234",
        uploadDate: "2022-01-20",
        status: "verified",
      },
      {
        id: 2,
        type: "PAN",
        number: "ABCDE1234F",
        uploadDate: "2022-01-20",
        status: "verified",
      },
      {
        id: 3,
        type: "Passport",
        number: "A12345678",
        uploadDate: "2022-01-20",
        status: "pending",
      },
    ],
  },
}

export const mockEmployeeTasks: EmployeeTask[] = [
  {
    id: 1,
    title: "Review Q2 Performance Reports",
    description: "Analyze and review quarterly performance metrics for all team members",
    assignedBy: "Sarah Johnson",
    priority: "high",
    weightage: 8,
    dueDate: "2024-07-15",
    dueTime: "17:00",
    status: "in-progress",
    createdAt: "2024-07-10 09:00 AM",
    response: {
      id: 1,
      response:
        "Started working on the performance analysis. Found some interesting trends in productivity metrics. Will complete detailed report by tomorrow.",
      format: "text",
      submittedAt: "2024-07-10 10:30 AM",
      status: "submitted",
    },
  },
  {
    id: 2,
    title: "Update Frontend Components",
    description: "Update React components to use the new design system",
    assignedBy: "Sarah Johnson",
    priority: "medium",
    weightage: 6,
    dueDate: "2024-07-20",
    dueTime: "16:00",
    status: "pending",
    createdAt: "2024-07-12 11:00 AM",
  },
  {
    id: 3,
    title: "Code Review - Authentication Module",
    description: "Review the new authentication module implementation",
    assignedBy: "Sarah Johnson",
    priority: "high",
    weightage: 7,
    dueDate: "2024-07-18",
    dueTime: "15:00",
    status: "completed",
    createdAt: "2024-07-08 14:00 PM",
    response: {
      id: 2,
      response:
        "Completed the code review. Found minor issues with error handling. Submitted detailed feedback document.",
      format: "document",
      documents: ["code_review_feedback.pdf", "security_recommendations.docx"],
      submittedAt: "2024-07-17 13:30 PM",
      status: "reviewed",
    },
  },
]

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    date: "2024-07-01",
    punchIn: "09:00",
    punchOut: "18:00",
    status: "present",
    totalHours: 8,
    breakTime: 60,
    overtimeHours: 0,
    regularized: false,
  },
  {
    date: "2024-07-02",
    punchIn: "09:15",
    punchOut: "18:30",
    status: "late",
    totalHours: 8.25,
    breakTime: 60,
    overtimeHours: 0.5,
    overtimeJustification: "Completing urgent bug fixes",
    regularized: true,
    regularizationReason: "Traffic jam due to road construction",
  },
  {
    date: "2024-07-03",
    punchIn: "08:45",
    punchOut: "17:45",
    status: "present",
    totalHours: 8,
    breakTime: 60,
    overtimeHours: 0,
    regularized: false,
  },
]

export const mockPerformanceMetrics: PerformanceMetrics = {
  tasksPerDay: 4.2,
  attendanceScore: 95,
  managerRating: 4.5,
  combinedPercentage: 88,
  monthlyTasks: 25,
  completionRate: 92,
}

export const mockWorkHours: WorkHours = {
  todayHours: 7.5,
  breakTime: 45,
  overtimeHours: 0,
  requiredHours: 8,
  taskJustification: [
    "Frontend component updates - 3 hours",
    "Code review sessions - 2 hours",
    "Team meetings - 1.5 hours",
    "Documentation - 1 hour",
  ],
}

export const mockOvertimeRequests: OvertimeRequest[] = [
  {
    id: 1,
    date: "2024-07-02",
    hours: 2,
    justification: "Critical bug fixes for production deployment",
    status: "approved",
    submittedAt: "2024-07-02 18:30",
    reviewedBy: "Sarah Johnson",
    reviewedAt: "2024-07-03 09:00",
  },
  {
    id: 2,
    date: "2024-07-05",
    hours: 1.5,
    justification: "Completing quarterly performance reports",
    status: "pending",
    submittedAt: "2024-07-05 17:45",
  },
]

export const mockDataToAdmin: DataToAdmin[] = [
  {
    employeeId: "EMP001",
    performanceMetrics: mockPerformanceMetrics,
    attendanceRecords: mockAttendanceRecords,
    workHours: mockWorkHours,
    timestamp: "2024-07-15 09:00:00",
  },
  {
    employeeId: "EMP001",
    performanceMetrics: mockPerformanceMetrics,
    attendanceRecords: mockAttendanceRecords.slice(-1),
    workHours: mockWorkHours,
    timestamp: "2024-07-14 18:00:00",
  },
]

export const mockDataToManager: DataToManager[] = [
  {
    employeeId: "EMP001",
    taskResponses: mockEmployeeTasks.filter((t) => t.response).map((t) => t.response!),
    completionStatus: {
      totalTasks: mockEmployeeTasks.length,
      completedTasks: mockEmployeeTasks.filter((t) => t.status === "completed").length,
      pendingTasks: mockEmployeeTasks.filter((t) => t.status === "pending").length,
      inProgressTasks: mockEmployeeTasks.filter((t) => t.status === "in-progress").length,
    },
    performanceData: mockPerformanceMetrics,
    timestamp: "2024-07-15 09:00:00",
  },
]

export const mockEmployeeSettings: EmployeeSettings = {
  theme: "light",
  language: "en",
  timezone: "UTC-8",
  notifications: {
    emailNotifications: true,
    taskReminders: true,
    overtimeAlerts: true,
    performanceUpdates: false,
  },
}
