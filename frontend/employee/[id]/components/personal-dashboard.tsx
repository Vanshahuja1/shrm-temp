import { User, Calendar, CreditCard, DollarSign, FileText, Shield } from "lucide-react"
import type { EmployeeInfo, AttendanceRecord } from "../../types/employees";

interface PersonalDashboardProps {
  employeeInfo: EmployeeInfo
  attendanceRecords: AttendanceRecord[]
}

export function PersonalDashboard({ employeeInfo, attendanceRecords }: PersonalDashboardProps) {
  // Calculate last 30 days attendance
  const last30Days = attendanceRecords.slice(-30)
  const presentDays = last30Days.filter((record) => record.status === "present" || record.status === "late").length
  const attendancePercentage = Math.round((presentDays / last30Days.length) * 100)

  return (
    <div className="space-y-6">
      {/* Basic Details */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-6 h-6 text-blue-500 mr-2" />
          Basic Details
        </h3>
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{employeeInfo.name}</h4>
            <p className="text-blue-600 font-medium text-lg">{employeeInfo.role}</p>
            {/* <p className="text-gray-600">{employeeInfo.designation}</p> */}
            <p className="text-sm text-gray-500">Employee ID: {employeeInfo.employeeId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-gray-900 font-medium">{employeeInfo.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <p className="text-gray-900 font-medium">{employeeInfo.manager}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 font-medium">{employeeInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900 font-medium">{employeeInfo.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
            <p className="text-gray-900 font-medium">{employeeInfo.joinDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p className="text-gray-900 font-medium">{employeeInfo.personalInfo.dateOfBirth}</p>
          </div>
        </div>
      </div>

      {/* Last 30 Days Attendance */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 text-blue-500 mr-2" />
          Last 30 Days Attendance
        </h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{attendancePercentage}%</span>
            </div>
            <p className="text-sm text-gray-600">Overall</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{presentDays}</span>
            </div>
            <p className="text-sm text-gray-600">Present Days</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-yellow-600">
                {last30Days.filter((r) => r.status === "late").length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Late Days</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-red-600">
                {last30Days.filter((r) => r.status === "absent").length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Absent Days</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left py-2 px-3 font-medium text-gray-900">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900">Punch In</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900">Punch Out</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900">Hours</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {last30Days.slice(-10).map((record, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-3">{record.date}</td>
                  <td className="py-2 px-3">{record.punchIn || "-"}</td>
                  <td className="py-2 px-3">{record.punchOut || "-"}</td>
                  <td className="py-2 px-3">{record.totalHours}h</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Details & Salary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-6 h-6 text-blue-500 mr-2" />
            Bank Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <p className="text-gray-900 font-medium">{employeeInfo.bankDetails.accountNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <p className="text-gray-900 font-medium">{employeeInfo.bankDetails.bankName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <p className="text-gray-900 font-medium">{employeeInfo.bankDetails.ifsc}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <p className="text-gray-900 font-medium">{employeeInfo.bankDetails.branch}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
            Salary Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary:</span>
              <span className="font-medium">LKR {employeeInfo.salary.basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allowances:</span>
              <span className="font-medium">${employeeInfo.salary.allowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Total Salary:</span>
              <span className="font-bold text-blue-600">${employeeInfo.salary.total.toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600">Last Appraisal: {employeeInfo.salary.lastAppraisal}</div>
          </div>
        </div>
      </div>

      {/* Appraisal Requests */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
          Appraisal Requests
        </h3>
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-blue-700 mb-2">
            <strong>Next Appraisal Due:</strong> December 2024
          </p>
          <p className="text-gray-600 text-sm">
            You can request an appraisal review based on your performance metrics and achievements.
          </p>
        </div>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Request Appraisal Review
        </button>
      </div> */}

      {/* Identity Documents */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-6 h-6 text-blue-500 mr-2" />
          Identity Documents
        </h3>
        <div className="grid gap-4">
          {employeeInfo.personalInfo.identityDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">{doc.type}</h4>
                  <p className="text-sm text-gray-600">{doc.number}</p>
                  <p className="text-xs text-gray-500">Uploaded: {doc.uploadDate}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  doc.status === "verified"
                    ? "bg-green-100 text-green-800"
                    : doc.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {doc.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
