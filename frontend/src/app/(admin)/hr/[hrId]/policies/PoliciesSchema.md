# Policy Management System Documentation

## Data Models

### 1. Leave Policy

#### Leave Violator Record
```typescript
interface LeaveViolator {
  id: number;
  name: string;
  email: string;
  usedLeaves: number;
  leaveQuota: number;
}
```

### 2. Attendance Policy

#### Attendance Record
```typescript
interface AttendanceRecord {
  id: number;
  name: string;
  email: string;
  attendance: number;  // Percentage
}
```

### 3. Discipline Policy

#### Discipline Violation Record
```typescript
interface DisciplineViolator {
  id: number;
  name: string;
  email: string;
  reason: string;
}
```

### 4. Mail Log Record
```typescript
interface MailLog {
  [key: string]: string; // key format: "${policyType}-${employeeId}"
}
```

## API Endpoints

### 1. Leave Policy APIs

#### Get Leave Violators
```typescript
GET /api/policymanagement/leave
Response: LeaveViolator[]
```

#### Send Leave Warning
```typescript
POST /api/policymanagement/send-leave-warning
Request: {
  to: string;        // email
  name: string;
  usedLeaves: number;
  leaveQuota: number;
}
Response: {
  success: boolean;
  message: string;
}
```

### 2. Attendance Policy APIs

#### Get Attendance Records
```typescript
GET /api/policymanagement/attendance
Response: AttendanceRecord[]
```

#### Send Attendance Warning
```typescript
POST /api/policymanagement/send-attendance-warning
Request: {
  to: string;        // email
  name: string;
  attendance: number;
}
Response: {
  success: boolean;
  message: string;
}
```

### 3. Discipline Policy APIs

#### Get Discipline Violations
```typescript
GET /api/policymanagement/discipline
Response: DisciplineViolator[]
```

#### Send Discipline Warning
```typescript
POST /api/policymanagement/send-discipline-warning
Request: {
  to: string;     // email
  name: string;
  reason: string;
}
Response: {
  success: boolean;
  message: string;
}
```

## Policy Types

1. Leave Policy
   - Monitors leave quota violations
   - Tracks used vs allocated leaves
   - Automated warning system

2. Attendance Policy
   - Monitors attendance percentage
   - Default threshold: 75%
   - Automated warning for defaulters

3. Discipline Policy
   - Handles various types of violations:
     - Late logins
     - Unprofessional conduct
     - Policy breaches
   - Warning system with violation tracking

## Warning System

Each policy type has its own warning mechanism with:
- Email notifications
- Warning logs
- Timestamp tracking
- Status monitoring

## Error Responses
```typescript
{
  success: false;
  error: string;
  details?: any;
}
```
