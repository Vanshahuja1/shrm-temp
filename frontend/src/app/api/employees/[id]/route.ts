import { type NextRequest, NextResponse } from "next/server"

// Type for employee update data
interface EmployeeUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  designation?: string;
  department?: string;
  manager?: string;
  [key: string]: unknown; // Allow additional fields
}

// GET /api/employees/[id] - Get employee basic info
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Replace with your actual database query
    const employee = await getEmployeeById(id)

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch  {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/employees/[id] - Update employee info
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updatedEmployee = await updateEmployee(id, body)

    return NextResponse.json(updatedEmployee)
  } catch {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

// Placeholder functions - replace with your actual database operations
async function getEmployeeById(id: string) {
  // Your database query here
  return {
    id,
    employeeId: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    role: "Senior Developer",
    designation: "Full Stack Developer",
    department: "Engineering",
    manager: "Jane Smith",
    joinDate: "2022-03-15",
    // ... other fields
  }
}

async function updateEmployee(id: string, data: EmployeeUpdateData) {
  // Your database update here
  console.log(`Updating employee ${id} with data:`, data)
  return data
}
