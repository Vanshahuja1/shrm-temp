import { Database, Send, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { DataToAdmin, DataToManager } from "../../types/employees";

interface DataSyncStatusProps {
  adminData: DataToAdmin[]
  managerData: DataToManager[]
  lastSyncTime: string
  syncStatus: "synced" | "pending" | "error"
}

export function DataSyncStatus({ adminData, managerData, lastSyncTime, syncStatus }: DataSyncStatusProps) {
  const getStatusIcon = () => {
    switch (syncStatus) {
      case "synced":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case "synced":
        return "bg-green-50 border-green-200"
      case "pending":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Data Sync Status</h2>

      {/* Sync Status Overview */}
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="w-6 h-6 text-blue-500 mr-2" />
            System Sync Status
          </h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium capitalize">{syncStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <Send className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{adminData.length}</p>
            <p className="text-sm text-gray-600">Data Packets to Admin</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg">
            <Database className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{managerData.length}</p>
            <p className="text-sm text-gray-600">Data Packets to Manager</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-600">{lastSyncTime}</p>
            <p className="text-sm text-gray-600">Last Sync</p>
          </div>
        </div>
      </div>

      {/* Data to Admin */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Send className="w-6 h-6 text-blue-500 mr-2" />
          Data to Admin
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-blue-900 mb-2">Performance Metrics</h4>
              <p className="text-2xl font-bold text-blue-600">{adminData.filter((d) => d.performanceMetrics).length}</p>
              <p className="text-xs text-blue-700">Records Sent</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-green-900 mb-2">Attendance Records</h4>
              <p className="text-2xl font-bold text-green-600">
                {adminData.reduce((acc, d) => acc + d.attendanceRecords.length, 0)}
              </p>
              <p className="text-xs text-green-700">Records Sent</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-yellow-900 mb-2">Work Hours</h4>
              <p className="text-2xl font-bold text-yellow-600">{adminData.filter((d) => d.workHours).length}</p>
              <p className="text-xs text-yellow-700">Records Sent</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-purple-900 mb-2">Total Syncs</h4>
              <p className="text-2xl font-bold text-purple-600">{adminData.length}</p>
              <p className="text-xs text-purple-700">This Month</p>
            </div>
          </div>

          {adminData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recent Admin Syncs</h4>
              <div className="space-y-2">
                {adminData.slice(-3).map((data, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Performance & Attendance Data</span>
                    <span className="text-gray-500">{data.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data to Manager */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-6 h-6 text-green-500 mr-2" />
          Data to Manager
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-blue-900 mb-2">Task Responses</h4>
              <p className="text-2xl font-bold text-blue-600">
                {managerData.reduce((acc, d) => acc + d.taskResponses.length, 0)}
              </p>
              <p className="text-xs text-blue-700">Responses Sent</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-green-900 mb-2">Completion Status</h4>
              <p className="text-2xl font-bold text-green-600">
                {managerData.filter((d) => d.completionStatus).length}
              </p>
              <p className="text-xs text-green-700">Updates Sent</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-yellow-900 mb-2">Performance Data</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {managerData.filter((d) => d.performanceData).length}
              </p>
              <p className="text-xs text-yellow-700">Reports Sent</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-purple-900 mb-2">Total Syncs</h4>
              <p className="text-2xl font-bold text-purple-600">{managerData.length}</p>
              <p className="text-xs text-purple-700">This Month</p>
            </div>
          </div>

          {managerData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recent Manager Syncs</h4>
              <div className="space-y-2">
                {managerData.slice(-3).map((data, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Task Responses & Performance ({data.taskResponses.length} items)
                    </span>
                    <span className="text-gray-500">{data.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Sync Actions</h3>

        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Force Sync Now</span>
          </button>

          <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>View Sync History</span>
          </button>

          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Test Connection</span>
          </button>
        </div>
      </div>
    </div>
  )
}
