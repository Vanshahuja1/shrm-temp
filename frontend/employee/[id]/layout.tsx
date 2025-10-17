import type React from "react"
import { use } from "react"
import { EmployeeNavigation } from "./components/employee-navigation"
import { EmployeeHeader } from "./components/employee-header"

export default function EmployeeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <div className="min-h-screen bg-blue-50">
      <EmployeeHeader employeeId={id} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-6">
          <EmployeeNavigation employeeId={id} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
