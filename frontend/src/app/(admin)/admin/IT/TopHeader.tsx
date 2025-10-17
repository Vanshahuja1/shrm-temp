"use client"

import { Menu} from "lucide-react"
import { usePathname } from "next/navigation"

interface TopHeaderProps {
  setIsSidebarOpen: (open: boolean) => void
  adminName?: string
}

export default function TopHeader({ setIsSidebarOpen, adminName }: TopHeaderProps) {
  const pathname = usePathname()

  const getPageTitle = (path: string) => {
    if (path.startsWith("/overview")) return "Dashboard Overview"
    if (path.startsWith("/departments")) return "Department Management"
    if (path.startsWith("/projects")) return "Project Management"
    if (path.startsWith("/members")) return "Organization Members"
    if (path.startsWith("/hierarchy")) return "Organization Hierarchy"
    if (path.startsWith("/tasks")) return "Task Management"
    if (path.startsWith("/analytics")) return "Analytics & Charts"
    if (path.startsWith("/emails")) return "Email System"
    return "Dashboard"
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(pathname)}</h1>
            <p className="text-sm text-gray-500">Welcome back{adminName ? `, ${adminName}` : ", Admin User"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
