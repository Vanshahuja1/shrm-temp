"use client"

import React from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Target, 
  Star, 
  FileText, 
  TrendingUp,
  Award,
  DollarSign
} from "lucide-react"

interface PerformanceLayoutProps {
  children: React.ReactNode
}

export default function PerformanceLayout({ children }: PerformanceLayoutProps) {
  const { id: managerId } = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const performanceMenuItems = [
    {
      id: "",
      label: "Overview",
      icon: BarChart3,
      description: "Performance dashboard and analytics"
    },
    {
      id: "scores",
      label: "Performance Scores",
      icon: Target,
      description: "Individual employee performance tracking"
    },
    {
      id: "kra",
      label: "KRA Management",
      icon: Star,
      description: "Key Responsibility Areas"
    },
    {
      id: "reviews",
      label: "Performance Reviews",
      icon: FileText,
      description: "Review cycles and evaluations"
    },
    {
      id: "increments",
      label: "Salary Increments",
      icon: DollarSign,
      description: "Salary increment management"
    },
    {
      id: "analytics",
      label: "Advanced Analytics",
      icon: TrendingUp,
      description: "Detailed performance analytics"
    }
  ]

  const getActiveItem = () => {
    const performanceBasePath = `/manager/${managerId}/performance`
    
    if (pathname === performanceBasePath) {
      return ""
    }
    
    const segments = pathname.replace(performanceBasePath, "").split("/").filter(Boolean)
    return segments[0] || ""
  }

  const activeItem = getActiveItem()

  return (
    <div className="space-y-6">
      {/* Performance Navigation Header */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive performance tracking and evaluation system</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Award className="h-4 w-4 mr-1" />
            PMS v2.0
          </Badge>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-gray-200 -mx-6 px-6">
        <nav className="flex space-x-8 overflow-x-auto pb-4">
          {performanceMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  const targetPath = item.id === "" 
                    ? `/manager/${managerId}/performance`
                    : `/manager/${managerId}/performance/${item.id}`
                  router.push(targetPath)
                }}
                className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-lg transition-all duration-200 min-w-fit ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                <div className="text-center">
                  <div className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 max-w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
