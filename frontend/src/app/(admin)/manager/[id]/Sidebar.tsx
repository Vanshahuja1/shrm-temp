"use client"

import { usePathname, useRouter } from "next/navigation"
import { User, Calendar, CheckCircle, Send, MessageSquare, Settings, Target, Mail,TrendingUp, } from "lucide-react"
import {  LogOut, X } from "lucide-react"
import Image from "next/image"

interface SidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  managerName?: string
  managerId: string
  organizationName?: string
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen , managerName, managerId, organizationName}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { id: "profile", label: "Manager Profile", icon: User },
    { id: "ongoing-projects", label: "Ongoing Projects", icon: Target },
    { id: "past-projects", label: "Past Projects", icon: CheckCircle },
    { id: "task-assignment", label: "Task Assignment", icon: Send },
    { id: "emp-response", label: "Employee Responses", icon: MessageSquare },
    { id: "attendance-mgmt", label: "Attendance Management", icon: Calendar },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "personal-details", label: "Personal Details", icon: Settings },
    
  ]

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <Image
                              src="/one_aim.jpg"
                              alt="SHRM Logo"
                              width={56}
                              height={56}
                              className="w-14 h-14 object-cover rounded-2xl shadow-lg relative z-10"
                              draggable={false}
                              priority
                            />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{organizationName || "Organization"}</h1>
                  <p className="text-sm text-gray-500">Manager Dashboard</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(`/manager/${managerId}/${item.id}`)
              return (
                <button
                  key={item.id}
                  onClick={() => {
    
                    router.push(`/manager/${managerId}/${item.id}`)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    active
                      ? "bg-blue-50 text-red-700 border-l-4 border-red-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold">
                M
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{managerName || "Manager"}</p>
                <p className="text-sm text-gray-500">Manager</p>
              </div>
              <button className="text-gray-400 hover:text-red-600">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
