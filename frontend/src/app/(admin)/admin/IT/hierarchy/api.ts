const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://shrm-backend.onrender.com/api"
// const API_BASE_URL="http://localhost:5000/api"
export interface User {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  departmentName: string
  organizationName: string
  upperManager?: string
  salary?: number
  performance?: number
  attendanceCount30Days?: number
  taskCountPerDay?: number
  joiningDate?: string
  isActive: boolean
  projects?: string[]
  experience?: string
}

export interface Department {
  id: string
  name: string
  head: string
  managers: number
  employees: number
  interns: number
  budget: number
}

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`)
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export const fetchUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user?role=${role}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${role}s`)
    }
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error)
    return []
  }
}

export const fetchUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}
