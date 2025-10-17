import { use } from "react"
import { redirect } from "next/navigation"

export default function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // Redirect to tasks page by default
  redirect(`/employee/${id}/dashboard`)
}
