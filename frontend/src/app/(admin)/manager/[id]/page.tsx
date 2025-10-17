"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { id: managerId } = useParams()

  useEffect(() => {
    router.replace(`/manager/${managerId}/profile`)
  }, [router, managerId])

  return null
}
