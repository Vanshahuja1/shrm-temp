"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

// This file is intentionally left blank. The default route for /hr/[hrId] is handled by [hrId]/page.tsx.

export default function DashboardPage() {
  const router = useRouter()
  const { hr_id: hrId } = useParams()

  useEffect(() => {
    router.replace(`/hr/${hrId}`) // Redirect to your main landing tab
  }, [router, hrId])

  return null
}