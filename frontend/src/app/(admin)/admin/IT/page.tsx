"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/IT/overview") // Redirect to your main landing tab
  }, [router])

  return null
}
