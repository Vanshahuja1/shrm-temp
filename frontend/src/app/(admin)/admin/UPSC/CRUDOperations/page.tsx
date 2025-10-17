"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { UserMinus, TrendingUp, TrendingDown, DollarSign, AlertCircle, Mail, ChevronRight } from "lucide-react"
import { EmailNotification} from "../types"

const CRUDOperations = () => {
  // const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([])

  const operations: Operation[] = [
    {
      id: "delete-member" as const,
      title: "Delete Member",
      description: "Remove a member from the organization",
      icon: UserMinus,
      color: "red" as const,
      action: "HR Mail Notification",
    },
    {
      id: "increment" as const,
      title: "Salary Increment",
      description: "Increase employee salary",
      icon: TrendingUp,
      color: "green" as const,
      action: "HR Mail Notification",
    },
    {
      id: "decrement" as const,
      title: "Salary Decrement",
      description: "Decrease employee salary",
      icon: TrendingDown,
      color: "orange" as const,
      action: "HR Mail Notification",
    },
    {
      id: "salary-deduction" as const,
      title: "Salary Deduction",
      description: "Apply salary deductions",
      icon: DollarSign,
      color: "yellow" as const,
      action: "HR Mail Notification",
    },
    {
      id: "penalty-actions" as const,
      title: "Penalty Actions",
      description: "Apply disciplinary actions",
      icon: AlertCircle,
      color: "purple" as const,
      action: "HR Mail Notification",
    },
  ]

interface Operation {
    id: string
    title: string
    description: string
    icon: React.ComponentType<{ size?: number }>
    color: "red" | "green" | "orange" | "yellow" | "purple"
    action: string
}

// interface Notification {
//     id: number
//     type: string
//     recipient: string
//     subject: string
//     message: string
//     timestamp: string
//     status: "sent" | "pending" | "failed"
// }

const handleOperation = (operation: Operation) => {
    // Map operation.id to EmailNotification.type
    let notificationType: EmailNotification["type"]
    switch (operation.id) {
        case "delete-member":
            notificationType = "member-crud"
            break
        case "increment":
            notificationType = "increment"
            break
        case "decrement":
            notificationType = "decrement"
            break
        case "penalty-actions":
            notificationType = "penalty"
            break
        default:
            notificationType = "member-crud"
    }

    const notification: EmailNotification = {
        id: Date.now(),
        type: notificationType,
        recipient: "hr@oneaimupsc.com",
        subject: `${operation.title} - Action Required`,
        message: `A ${operation.title.toLowerCase()} operation has been initiated and requires HR attention.`,
        timestamp: new Date().toLocaleString(),
        status: "sent",
    }

    setEmailNotifications((prev) => [notification, ...prev])
    alert(`${operation.title} completed. HR notification sent.`)
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">CRUD Operations</h1>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
          {emailNotifications.length} Notifications Sent
        </div>
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((operation) => {
          const Icon = operation.icon
          const colorClasses = {
            red: "bg-red-50 border-red-200 text-red-700",
            green: "bg-green-50 border-green-200 text-green-700",
            orange: "bg-orange-50 border-orange-200 text-orange-700",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
          }

          return (
            <motion.div
              key={operation.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className={`p-6 rounded-xl border-2 ${colorClasses[operation.color]} bg-white shadow-sm cursor-pointer`}
              onClick={() => handleOperation(operation)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-3 rounded-lg ${colorClasses[operation.color].replace("text-", "bg-").replace("-700", "-100")}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{operation.title}</h3>
                  <p className="text-sm text-gray-600">{operation.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{operation.action}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Notifications */}
      {emailNotifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="text-blue-600" size={20} />
            </div>
            Recent HR Notifications
          </h3>
          <div className="space-y-4">
            {emailNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{notification.subject}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    notification.status === "sent"
                      ? "bg-green-100 text-green-800"
                      : notification.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CRUDOperations