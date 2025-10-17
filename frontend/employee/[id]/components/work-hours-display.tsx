import { Clock, Coffee, Zap, FileText } from "lucide-react"
import type { WorkHours } from "../../types/employees";

interface WorkHoursDisplayProps {
  workHours: WorkHours
  isActive: boolean
}

export function WorkHoursDisplay({ workHours, isActive }: WorkHoursDisplayProps) {
  const progressPercentage = Math.min((workHours.todayHours / workHours.requiredHours) * 100, 100)
  const isOvertime = workHours.todayHours > workHours.requiredHours
  const remainingHours = Math.max(workHours.requiredHours - workHours.todayHours, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Work Hours Display</h2>

      {/* Today's Work Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="w-6 h-6 text-blue-500 mr-2" />
          Today&apos;s Work Summary
        </h3>

        {/* Progress Circle */}
        <div className="text-center mb-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isOvertime ? "bg-orange-100" : progressPercentage >= 100 ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <div className="text-center">
              <span
                className={`text-3xl font-bold ${
                  isOvertime ? "text-orange-600" : progressPercentage >= 100 ? "text-green-600" : "text-blue-600"
                }`}
              >
                {workHours.todayHours.toFixed(1)}h
              </span>
              <p className="text-xs text-gray-600">of {workHours.requiredHours}h</p>
            </div>
          </div>

          {isActive && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Currently Working</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Daily Progress</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOvertime ? "bg-orange-500" : progressPercentage >= 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          {remainingHours > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {remainingHours.toFixed(1)} hours remaining to complete minimum requirement
            </p>
          )}
        </div>

        {/* Time Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{workHours.todayHours.toFixed(1)}h</p>
            <p className="text-sm text-gray-600">Total Hours</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Coffee className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{workHours.breakTime}m</p>
            <p className="text-sm text-gray-600">Break Time</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{workHours.overtimeHours.toFixed(1)}h</p>
            <p className="text-sm text-gray-600">Overtime</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{workHours.taskJustification.length}</p>
            <p className="text-sm text-gray-600">Tasks</p>
          </div>
        </div>
      </div>

      {/* Task Justification */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 text-blue-500 mr-2" />
          Task Justification
        </h3>

        <div className="space-y-3">
          {workHours.taskJustification.map((task, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <span className="text-gray-700">{task}</span>
            </div>
          ))}
        </div>

        {workHours.taskJustification.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No task justifications recorded yet</p>
          </div>
        )}
      </div>

      {/* Work Status Alerts */}
      {isOvertime && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <h4 className="font-medium text-orange-900">Overtime Alert</h4>
              <p className="text-orange-700 text-sm">
                You have exceeded the standard 8-hour workday by {workHours.overtimeHours.toFixed(1)} hours. Consider
                submitting an overtime request if this was planned work.
              </p>
            </div>
          </div>
        </div>
      )}

      {progressPercentage >= 100 && !isOvertime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h4 className="font-medium text-green-900">Daily Goal Achieved</h4>
              <p className="text-green-700 text-sm">
                Congratulations! You have completed your required {workHours.requiredHours} hours for today.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
