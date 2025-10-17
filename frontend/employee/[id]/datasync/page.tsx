"use client"

import { useState, useEffect, use, useCallback } from "react"
import { DataSyncStatus } from "../components/data-sync-status"
import type { DataToAdmin, DataToManager } from "../../types/employees"
import axios from "@/lib/axiosInstance"

interface SyncData {
  adminData: DataToAdmin[]
  managerData: DataToManager[]
  lastSyncTime: string
  syncStatus: "synced" | "pending" | "error"
}

export default function DataSyncPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [syncData, setSyncData] = useState<SyncData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSyncData = useCallback(async () => {
    try {
      const response = await axios.get(`/employees/${id}/data-sync`)
      setSyncData(response.data)
    } catch (error) {
      console.error("Failed to fetch sync data:", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSyncData()
  }, [fetchSyncData])

  if (loading || !syncData) {
    return <div className="animate-pulse">Loading sync status...</div>
  }

  return (
    <DataSyncStatus
      adminData={syncData.adminData}
      managerData={syncData.managerData}
      lastSyncTime={syncData.lastSyncTime}
      syncStatus={syncData.syncStatus}
    />
  );}