# Reports System Documentation

## Data Models

### 1. Basic Employee Record
```typescript
interface Employee {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  status: "Active" | "On Leave" | "Inactive";
  joinedDate?: string;
}
```

### 2. Detailed Employee Report
```typescript
interface EmployeeReport {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;

  performance: {
    rating: number;
    attendance: number;
    projectsCompleted: number;
    targetsAchieved: number;
    performanceMeasure: number;
    consistencyScore: number;
    engagementScore: number;
  };

  workStats: {
    daysWorked: number;
    totalTasksCompleted: number;
    coursesCompleted: number;
    certificationsEarned: number;
    trainingsAttended: number;
    avgDailyWorkingHours: number;
    overtimeHoursMonthly: number;
    avgBreakTimePerDay: string;
  };

  growthAndHR: {
    joiningDate: string;
    probationStatus: boolean;
    lastPromotionDate: string;
    nextAppraisalDue: string;
    appraisalsReceived: number;
    skillLevel: string;
  };

  wellbeing: {
    age: number;
    lastMedicalCheckup: string;
    sickLeavesTaken: number;
    wellnessProgramParticipation: boolean;
    lastFeedbackSurveyScore: number;
    workLifeBalanceScore: number;
  };

  finance: {
    currentSalary: string;
    bonusReceivedThisYear: string;
    referralBonusesEarned: string;
  };

  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
  }>;
}
```

### 3. Attendance Record
```typescript
interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent";
}
```

## API Endpoints

### 1. Employee Report APIs

#### Get All Employees
```typescript
GET /api/reports/employee
Response: Employee[]
```

#### Get Employee Detailed Report
```typescript
GET /api/reports/employee/:id
Response: EmployeeReport
```

### 2. Attendance Report APIs

#### Get Employee Attendance
```typescript
GET /api/reports/attendance/:employeeId
Request Query: {
  startDate: string;
  endDate: string;
}
Response: AttendanceRecord[]
```

### 3. Export APIs

#### Export Attendance Report
```typescript
POST /api/reports/attendance/export
Request: {
  employeeId: string;
  format: "csv" | "pdf";
  startDate: string;
  endDate: string;
}
Response: {
  success: boolean;
  url?: string;
}
```

## Report Categories

1. Performance Metrics
   - Overall rating
   - Attendance percentage
   - Projects completed
   - Targets achieved
   - Performance measure
   - Consistency score
   - Engagement score

2. Work Statistics
   - Days worked
   - Tasks completed
   - Courses completed
   - Certifications earned
   - Training attendance
   - Working hours analysis
   - Break time analysis

3. Growth & HR
   - Joining details
   - Probation status
   - Promotion history
   - Appraisal tracking
   - Skill assessment

4. Wellbeing
   - Age
   - Medical checkups
   - Sick leave tracking
   - Wellness program participation
   - Feedback survey scores
   - Work-life balance metrics

5. Financial
   - Salary information
   - Bonus details
   - Referral earnings

6. Activity Tracking
   - Recent activities
   - Activity types
   - Timeline tracking

## Export Formats
- CSV Export
- PDF Export
- Print functionality

## Error Responses
```typescript
{
  success: false;
  error: string;
  details?: any;
}
```
