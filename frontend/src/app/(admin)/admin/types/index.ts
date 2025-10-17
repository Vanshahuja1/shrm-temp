export interface OrganizationMember {
  id: number | string
  name: string
  role: "Manager" | "Employee" | "Intern" | "Head" | "Admin"
  department: string
  organization?: string // Organization name from backend
  organizationId?: string // Organization ID
  organizationName?: string // Alternative organization name
  salary: number
  projects: string[]
  experience:  number
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  documents: {
    pan: string
    aadhar: string
  }
  joiningDate: string
  performanceMetrics: {
    tasksPerDay: number
    attendanceScore: number
    managerReviewRating: number
    combinedPercentage: number
  }
  attendance: {
    last7Days: boolean[]
    todayPresent: boolean
  }
  upperManager?: string
  upperManagerName?: string;
  employees?: { id: string| number; upperManager: string; name?: string }[];
  interns?: { id: string| number; upperManager: string; name?: string }[];
}
export interface UpdateMemberPayload {
  id?: string | number;
  name: string;
  role: "Manager" | "Employee" | "Intern" | "Head" | "Admin";
  department: string;
  salary: number;
  projects: string[];
  experience: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  documents: {
    pan: string;
    aadhar: string;
  };
  joiningDate: string;
  performanceMetrics: {
    tasksPerDay: number;
    attendanceScore: number;
    managerReviewRating: number;
    combinedPercentage: number;
  };
  attendance: {
    todayPresent: boolean;
  };
  upperManager?: string;
  upperManagerName?: string;
  employees?: { id: string | number; name?: string }[];
  interns?: { id: string | number; name?: string }[];
}

export interface Department {
  id: number | string
  _id?: string
  name: string
  head: string
  budget: number
  managers: OrganizationMember[]
  employees: OrganizationMember[]
  interns: OrganizationMember[]
  members: OrganizationMember[]
}

export interface Project {
  qualityScore: string
  successRate: string
  costEfficiency: string
  budgetVsActual: string
  id: number
  name: string
  description: string
  departmentsInvolved: string[]
  membersInvolved: string[]
  assignDate?: string
  startDate?: string
  deadline?: string
  endDate?: string
  managersInvolved: string[]
  completionPercentage: number
  amount: number
  client: string
  projectScope: string
  clientInputs: string
  skillsRequired: string[]
  showcaseLink?: string
  effectAnalysis?: string
  status: "active" | "completed" | "on-hold" | "cancelled" | "pending"
  priority?: "Low" | "Medium" | "High" | "Urgent"
  category?: string
  technologiesUsed?: string[]
  clientSatisfaction?: string
  roi?: number
  budgetAllocated?: number
  actualSpent?: number
  estimatedHours?: number
  actualHours?: number
  riskAssessment?: "Low" | "Medium" | "High"
  projectLead?: string
  milestonesAchieved?: string[]
  links?: string[]
  lessonsLearned?: string
  clientFeedback?: string
}

export interface Task {
  _id: number
  title: string
  description: string
  assignedTo: {
    id: string
    name: string
  }
  assignedBy: {
    id: string
    name: string
  }
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high" | "urgent"
  project?: string
}
