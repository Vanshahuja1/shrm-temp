"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "./Sidebar"
import TopHeader from "./TopHeader"

interface AdminData {
  name: string
  organizationId: string
}

interface OrganizationData {
  name: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)

  useEffect(() => {
    // Set hardcoded admin data
    setAdminData({
      name: "Narendra Singh",
      organizationId: "6889a9394f263f6b1e23a7e2"
    })
    // Set default organization data
    setOrganizationData({
      name: "IT"
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        adminName={adminData?.name}
        organizationName={organizationData?.name}
      />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <div className="sticky top-0 z-30">
          <TopHeader setIsSidebarOpen={setIsSidebarOpen} adminName={adminData?.name} />
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
