# Notifications System Documentation

## Data Models

### 1. Base Employee Schema for Notifications
```typescript
interface Employee {
  id: number;
  name: string;
  email: string;
  organization: string;
  department: string;
  role: string;
}
```

### 2. Notification Types

#### General Notification
```typescript
interface GeneralNotification {
  type: 'general';
  recipients: Employee[];
  message: string;
  status: 'sent' | 'pending';
}
```

#### Increment Notification
```typescript
interface IncrementNotification {
  type: 'increment';
  recipient: Employee;
  incrementPercentage: number;
  effectiveDate?: string;
  status: 'sent' | 'pending';
}
```

#### Penalty Notification
```typescript
interface PenaltyNotification {
  type: 'penalty';
  recipient: Employee;
  penaltyAmount?: number;
  reason: string;
  status: 'sent' | 'pending';
}
```

#### Salary Notification
```typescript
interface SalaryNotification {
  type: 'salary';
  recipient: Employee;
  month: string;
  amount: number;
  status: 'sent' | 'pending';
}
```

## API Endpoints

### 1. Employee APIs for Notifications

#### Get All Employees
```typescript
GET /api/employees/all
Response: Employee[]
```

### 2. Notification APIs

#### Send General Notification
```typescript
POST /api/notifications/general
Request: {
  recipients: number[]; // Employee IDs
  message: string;
}
Response: {
  success: boolean;
  messagesSent: number;
}
```

#### Send Increment Notification
```typescript
POST /api/notifications/increment
Request: {
  employeeId: number;
  incrementPercentage: number;
  effectiveDate?: string;
}
Response: {
  success: boolean;
  notificationId: string;
}
```

#### Send Penalty Notification
```typescript
POST /api/notifications/penalty
Request: {
  employeeId: number;
  penaltyAmount?: number;
  reason: string;
}
Response: {
  success: boolean;
  notificationId: string;
}
```

#### Send Salary Notification
```typescript
POST /api/notifications/salary
Request: {
  employeeId: number;
  month: string;
  amount: number;
}
Response: {
  success: boolean;
  notificationId: string;
}
```

## Error Responses
```typescript
{
  success: false;
  error: string;
}
```
