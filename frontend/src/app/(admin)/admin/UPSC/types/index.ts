export type DepartmentMember = {
  id: number;
  name: string;
  position: string;
  salary: number;
  experience: string;
  joinDate: string;
  email: string;
  phone: string;
  address: string;
  manager: string;
  skills: string[];
  performance: number;
  type: "manager" | "employee" | "intern";
  attendanceScore: number;
  managerReviewRating: number;
  combinedPercentage: number;
};

export type Department = {
  id: number;
  name: string;
  managers: number;
  coManagers: number;
  employees: number;
  interns: number;
  members: DepartmentMember[];
  budget: number;
  head: string;
  description: string;
};

export type Faculty = {
  id: number;
  name: string;
  subjects: string[];
  batchAssignments: string[];
  averageClassesPerDay: number;
  qualifications: string;
  experience: string;
  durationInOrganization: string;
  rating: number;
  students: number;
  salary: number;
  joinDate: string;
  email: string;
  phone: string;
  performanceMetrics: {
    attendanceScore: number;
    managerReviewRating: number;
    combinedPercentage: number;
  };
};

export type Student = {
  id: number;
  name: string;
  batch: string;
  enrollmentDate: string;
  phone: string;
  email: string;
  feeStatus: "paid" | "pending" | "overdue";
  basicInfo: {
    age: number;
    address: string;
    parentContact: string;
    previousEducation: string;
  };
  performanceMetrics: {
    attendanceScore: number;
    testScores: number[];
    assignmentCompletion: number;
    overallGrade: string;
  };
};

export type Batch = {
  id: number;
  name: string;
  type: "morning" | "evening";
  startTime: string;
  endTime: string;
  facultyInvolved: string[];
  studentCount: number;
  capacity: number;
  syllabusPercentComplete: number;
  subjects: string[];
  startDate: string;
  duration: string;
  fees: number;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  type: "manager-todo" | "employee-task";
};

export type EmailNotification = {
  id: number;
  type: "member-crud" | "increment" | "decrement" | "penalty";
  recipient: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "sent" | "pending" | "failed";
};
import { LucideIcon } from "lucide-react";

export interface Operation {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "red" | "green" | "orange" | "yellow" | "purple";
  action: string;
}

export type NotificationType =
  | "delete-member"
  | "increment"
  | "decrement"
  | "salary-deduction"
  | "penalty-actions";
