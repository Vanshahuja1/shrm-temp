"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import Sidebar from "./Sidebar"
import TopHeader from "./TopHeader"
import axiosInstance from "@/lib/axiosInstance"

interface ManagerData {
  name: string
  organizationId: string
}

interface OrganizationData {
  name: string
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [managerData, setManagerData] = useState<ManagerData | null>(null)
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)
  const { id: managerId } = useParams()

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        // Fetch manager data
        const managerResponse = await axiosInstance.get(`/user/${managerId}`)
        if (managerResponse.data.success) {
          const manager = managerResponse.data.data
          setManagerData(manager)
          
          // Fetch organization data using the manager's organizationId
          if (manager.organizationId) {
            const orgResponse = await axiosInstance.get(`/organizations/${manager.organizationId}`)
            if (orgResponse.data.success) {
              setOrganizationData(orgResponse.data.data)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching manager/organization data:", error)
      }
    }

    if (managerId) {
      fetchManagerData()
    }
  }, [managerId])

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        managerId={managerId as string}
        managerName={managerData?.name}
        organizationName={organizationData?.name}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-shrink-0">
          <TopHeader setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? location.pathname : "initial"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
