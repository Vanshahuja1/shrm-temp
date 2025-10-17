export interface OrganizationMember {
  id: number | string;
  name: string;
  role: "Manager" | "Employee" | "Intern" | "Head" | "Admin";
  department: string;
  organization?: string; // Organization name field from backend
  organizationId?: string; // Organization ID field  
  organizationName?: string; // Alternative organization name field
  salary: number;
  projects: string[];
  experience: string | number;
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
    last7Days: boolean[];
    todayPresent: boolean;
  };
  upperManager?: string;
  upperManagerName?: string;
}

export interface Project {
  assignDate: string;
  id: number | string;
  name: string;
  description: string;
  departmentsInvolved: string[];
  membersInvolved: string[];
  startDate: string;
  endDate?: string;
  deadline: string;
  managersInvolved: string[];
  completionPercentage: number;
  amount: number;
  client: string;
  projectScope: string;
  clientInputs: string;
  skillsRequired: string[];
  showcaseLink?: string;
  effectAnalysis?: string;
  status: "active" | "completed" | "on-hold" | "cancelled" | "pending";
  priority?: "Low" | "Medium" | "High" | "Urgent";
  category?: string;
  technologiesUsed?: string[];
  roi?: number;
  budgetAllocated?: number;
  actualSpent?: number;
  estimatedHours?: number;
  actualHours?: number;
  riskAssessment?: "Low" | "Medium" | "High";
  projectLead?: string;
  milestonesAchieved?: string[];
  links?: string[];
  lessonsLearned?: string;
  clientFeedback?: string;

  // Additional fields for completed projects
  budgetVsActual?: string;
  costEfficiency?: string;
  successRate?: string;
  qualityScore?: string;
  clientSatisfaction?: string;
}

export interface Department {
  id: number | string;
  _id?: string;
  name: string;
  head: string;
  budget: number;
  managers: OrganizationMember[];
  employees: OrganizationMember[];
  interns: OrganizationMember[];
  members: OrganizationMember[];
}
