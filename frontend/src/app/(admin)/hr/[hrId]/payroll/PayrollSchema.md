# Payroll System Documentation

## Data Models

### 1. Basic Employee Payroll Record
```typescript
interface EmployeeRecord {
  id: string;
  name: string;
  payableDays: string;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  department?: string;
  dateOfJoining?: string;
  designation?: string;
}
```

### 2. Full and Final Settlement Record
```typescript
interface FullAndFinalRecord {
  id: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  exitDate: string;
  status: "pending" | "approved" | "processing" | "paid";
  settlements: {
    salary: number;
    gratuity: number;
    leaveEncashment: number;
    bonus: number;
    deductions: number;
    otherAllowances?: number;
    noticePeriodRecovery?: number;
    total: number;
  };
  documents: {
    type: string;
    status: "pending" | "received" | "verified";
  }[];
  remarks?: string;
}
```

### 3. Employee Joinees/Exits Record
```typescript
interface Employee {
  id: number;
  name: string;
  joiningDate?: string;
  exitDate?: string;
  status: "joined" | "exited";
  department: string;
}
```

### 4. Payroll Period
```typescript
interface PayrollPeriod {
  label: string;      // e.g., "Apr 2020"
  range: string;      // e.g., "MAR 26 - APR 25"
  status: "completed" | "current" | "upcoming";
  active?: boolean;
}
```

## API Endpoints

### 1. Employee Payroll APIs

#### Get Employee Payroll Records
```typescript
GET /api/payroll/employees
Response: EmployeeRecord[]
```

#### Generate Employee Payslip
```typescript
POST /api/payroll/generate-payslip
Request: {
  employeeId: string;
  month: string;
  year: number;
}
Response: {
  success: boolean;
  payslipUrl?: string;
}
```

### 2. Joinees & Exits APIs

#### Get Joinees and Exits List
```typescript
GET /api/payroll/joinees-exits
Response: Employee[]
```

#### Finalize Joinee/Exit List
```typescript
POST /api/payroll/finalize-joinee-exit
Request: Employee[]
Response: {
  success: boolean;
  message: string;
}
```

### 3. Full and Final Settlement APIs

#### Get Full and Final Records
```typescript
GET /api/payroll/full-and-final
Response: FullAndFinalRecord[]
```

#### Update Settlement Status
```typescript
PUT /api/payroll/full-and-final/:id/status
Request: {
  status: "pending" | "approved" | "processing" | "paid";
  remarks?: string;
}
Response: {
  success: boolean;
  record: FullAndFinalRecord;
}
```

### 4. Payroll Processing APIs

#### Get Payroll Periods
```typescript
GET /api/payroll/periods
Response: PayrollPeriod[]
```

#### Process Payroll
```typescript
POST /api/payroll/process
Request: {
  periodId: string;
  employees: string[]; // Employee IDs
}
Response: {
  success: boolean;
  processedCount: number;
  errors?: string[];
}
```

## Error Responses
```typescript
{
  success: false;
  error: string;
  details?: any;
}
```

## Payroll Modules

1. Leave & Attendance Deductions (`/hr/payroll/leave-deductions`)
2. New Joinees & Exits (`/hr/payroll/joinees-exit`)
3. Bonuses & Salary Revisions (`/hr/payroll/bonuses-revisions`)
4. Adhoc Expenses & Deductions (`/hr/payroll/adhoc-expenses`)
5. Arrears & Dues (`/hr/payroll/arrears-dues`)
6. Review All Employees (`/hr/payroll/review-all-employees`)

Each module handles specific aspects of payroll processing and can be accessed through their respective routes.
