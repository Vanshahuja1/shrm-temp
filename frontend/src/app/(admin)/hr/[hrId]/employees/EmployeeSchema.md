# Employee Management System Documentation

## Data Models

### 1. Employee Record Schema
```typescript
interface EmployeeRecord {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  designation: string;
  department?: string;
  joinedDate?: string;
  status: "Active" | "On Leave" | "Inactive";
}
```

### 2. Employee Form Data Schema
```typescript
interface EmployeeFormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    aadhar: string;
    pan: string;
    address: string;
    emergencyContact: string;
  };
  financialInfo: {
    salary: string;
    bankInfo: {
      accountHolderName: string;
      accountType: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
      branch: string;
    };
  };
  departmentInfo: {
    department: string;
    designation: string;
    managerName: string;
  };
  joiningDetails: {
    joiningDate: string;
    employeeId: string;
  };
  taskInfo: {
    taskName: string;
    assignedOn: string;
    assignedBy: string;
  };
  payrollInfo: {
    taxCode: string;
    benefits: string;
  };
  pastOrganizations: Array<{
    companyName: string;
    designation: string;
    duration: string;
    type: string; // Full Time / Part Time
    workMode: string; // Onsite / Remote
    contactInfo: string;
    expLetterUrl?: string;
    resignationLetterUrl?: string;
  }>;
}
```

## API Endpoints

### 1. Employee APIs

#### Get All Employees
```typescript
GET /api/employees
Response: EmployeeRecord[]
```

#### Get Employee Details
```typescript
GET /api/employees/:employeeId
Response: EmployeeRecord
```

#### Add New Employee
```typescript
POST /api/employees
Request: EmployeeFormData
Response: {
  success: boolean;
  employeeId: string;
}
```

#### Update Employee
```typescript
PUT /api/employees/:employeeId
Request: Partial<EmployeeFormData>
Response: {
  success: boolean;
  employeeId: string;
}

## Error Responses
```typescript
{
  success: false;
  error: string;
}
```
