"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import Sidebar from "./Sidebar"
import TopHeader from "./TopHeader"
import axios from "@/lib/axiosInstance"

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const {hrId } = useParams()
  const [hrName , setHrName] = useState("");
  useEffect(() => {
    const fetchEmp = async()=>{
      const res = await axios.get(`/IT/org-members/${hrId}`)
      setHrName(res.data.name);
    }
    fetchEmp();
  }, [hrId])
  

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        hrId={hrId as string}
        hrName={hrName}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader setIsSidebarOpen={setIsSidebarOpen} hrName={hrName} />

        <main className="flex-1 p-6 overflow-y-auto">
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
