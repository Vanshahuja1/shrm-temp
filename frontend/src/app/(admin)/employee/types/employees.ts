export type EmployeeInfo = {
  id: string
  name: string
  role: string
  designation: string
  department: string
  manager: string
  email: string
  phone: string
  joinDate: string
  employeeId: string
  profileImage?: string
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
  personalInfo: {
    address: string
    emergencyContact: string
    dateOfBirth: string
    identityDocuments: IdentityDocument[]
  }
}

export type IdentityDocument = {
  id: number
  type: "Aadhar" | "PAN" | "Passport" | "Driving License"
  number: string
  uploadDate: string
  status: "verified" | "pending" | "rejected"
}

export type EmployeeTask = {
  id: number
  title: string
  description: string
  assignedBy: string
  priority: "high" | "medium" | "low"
  weightage: number
  dueDate: string
  dueTime: string
  status: "pending" | "in-progress" | "completed"
  createdAt: string
  response?: TaskResponse
}

export type TaskResponse = {
  id: number
  response: string
  format: "text" | "document"
  documents?: (string | {
    filename?: string;
    originalName?: string;
    path?: string;
    size?: number;
    mimetype?: string;
    uploadedAt?: string;
  })[];
  submittedAt: string
  status: "submitted" | "reviewed"
}

export type AttendanceRecord = {
  date: string
  punchIn?: string
  punchOut?: string
  status: "present" | "absent" | "late" | "half-day"
  totalHours: number
  breakTime: number
  overtimeHours: number
  overtimeJustification?: string
  regularized: boolean
  regularizationReason?: string
}

export type BreakSession = {
  id: number
  type: "break1" | "break2" | "lunch"
  duration: number // in minutes
  startTime?: string
  endTime?: string
  status: "available" | "active" | "completed"
}

export type PerformanceMetrics = {
  tasksPerDay: number
  attendanceScore: number
  managerRating: number
  combinedPercentage: number
  monthlyTasks: number
  completionRate: number
}

export type WorkHours = {
  todayHours: number
  breakTime: number
  overtimeHours: number
  requiredHours: number
  taskJustification: string[]
}

export type OvertimeRequest = {
  id: number
  date: string
  hours: number
  justification: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export type EmployeePerformanceMetricsType = PerformanceMetrics

export type DataToAdmin = {
  employeeId: string
  performanceMetrics: PerformanceMetrics
  attendanceRecords: AttendanceRecord[]
  workHours: WorkHours
  timestamp: string
}

export type DataToManager = {
  employeeId: string
  taskResponses: TaskResponse[]
  completionStatus: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    inProgressTasks: number
  }
  performanceData: PerformanceMetrics
  timestamp: string
}

export type NotificationSettings = {
  emailNotifications: boolean
  taskReminders: boolean
  overtimeAlerts: boolean
  performanceUpdates: boolean
}

export type EmployeeSettings = {
  theme: "light" | "dark"
  language: "en" | "es" | "fr"
  timezone: string
  notifications: NotificationSettings
}
