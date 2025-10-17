# Attendance Management System Documentation

## Data Models

### 1. Daily Attendance Schema
```typescript
interface AttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  status: AttendanceStatus;
  notes?: string;
}

type AttendanceStatus = 
  | 'present'
  | 'absent'
  | 'late'
  | 'half-day'
  | 'on-leave';
```

### 2. Monthly Attendance Schema
```typescript
interface MonthlyAttendance {
  employeeId: string;
  name: string;
  year: number;
  month: number; // 1-12
  records: {
    [date: string]: AttendanceStatus;
  };
  summary: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    onLeave: number;
  };
}
```

### 3. Leave Management Schema
```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
}

type LeaveType = 
  | 'casual'
  | 'sick'
  | 'earned'
  | 'unpaid';

type LeaveStatus = 
  | 'pending'
  | 'approved'
  | 'rejected';

interface LeaveBalance {
  casual: number;
  sick: number;
  earned: number;
}
```

## API Endpoints

### 1. Daily Attendance APIs

#### Get Daily Attendance
```typescript
GET /api/attendance/daily
Query: {
  date?: string; // YYYY-MM-DD (defaults to today)
}
Response: {
  records: AttendanceRecord[];
}
```

#### Mark Attendance
```typescript
POST /api/attendance/daily
Request: {
  employeeId: string;
  status: AttendanceStatus;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  notes?: string;
}
Response: AttendanceRecord
```

### 2. Monthly Attendance APIs

#### Get Monthly Report
```typescript
GET /api/attendance/monthly
Query: {
  month: number; // 1-12
  year: number;
}
Response: MonthlyAttendance[]
```

### 3. Leave Management APIs

#### Get Leave Requests
```typescript
GET /api/attendance/leave
Response: LeaveRequest[]
```

#### Submit Leave Request
```typescript
POST /api/attendance/leave
Request: {
  employeeId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}
Response: LeaveRequest
```

#### Update Leave Status
```typescript
PUT /api/attendance/leave/:id
Request: {
  status: 'approved' | 'rejected';
}
Response: LeaveRequest
```

#### Get Leave Balance
```typescript
GET /api/attendance/leave/balance/:employeeId
Response: LeaveBalance
```

## Error Responses
```typescript
{
  error: {
    message: string;
    status: 400 | 401 | 403 | 404 | 500;
  }
}
```
