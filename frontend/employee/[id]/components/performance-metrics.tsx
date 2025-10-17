import { TrendingUp, Target, Calendar, Star, Award, BarChart3 } from "lucide-react"
import type { EmployeePerformanceMetricsType } from "../../types/employees";

interface EmployeePerformanceMetricsProps {
  metrics: EmployeePerformanceMetricsType
}

export function PerformanceMetrics({ metrics }: EmployeePerformanceMetricsProps) {
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100"
    if (percentage >= 75) return "text-blue-600 bg-blue-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>

      {/* Overall Performance Card */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Award className="w-6 h-6 text-blue-500 mr-2" />
          Overall Performance Score
        </h3>

        <div className="text-center mb-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${getPerformanceColor(metrics.combinedPercentage)}`}
          >
            <span className="text-4xl font-bold">{metrics.combinedPercentage}%</span>
          </div>
          <p className="text-gray-600 text-lg">Combined Performance Rating</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{metrics.tasksPerDay}</p>
            <p className="text-sm text-gray-600">Tasks/Day (out of 5)</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{metrics.attendanceScore}%</p>
            <p className="text-sm text-gray-600">Attendance Score</p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{metrics.managerRating}</p>
            <p className="text-sm text-gray-600">Manager Rating (out of 5)</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{metrics.completionRate}%</p>
            <p className="text-sm text-gray-600">Task Completion</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
            Task Performance
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Daily Task Average</span>
                <span className="text-sm font-medium">{metrics.tasksPerDay}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(metrics.tasksPerDay / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Tasks Completed</span>
                <span className="text-sm font-medium">{metrics.monthlyTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.monthlyTasks / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium">{metrics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.completionRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
            Performance Trends
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Attendance</p>
                <p className="text-sm text-green-700">Excellent consistency</p>
              </div>
              <div className="text-2xl font-bold text-green-600">↗</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Task Quality</p>
                <p className="text-sm text-blue-700">Above average performance</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">↗</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">Productivity</p>
                <p className="text-sm text-yellow-700">Room for improvement</p>
              </div>
              <div className="text-2xl font-bold text-yellow-600">→</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Consistent attendance record</li>
              <li>• High-quality task completion</li>
              <li>• Good manager feedback</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Areas to Improve</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Increase daily task completion</li>
              <li>• Reduce response time</li>
              <li>• Enhance documentation</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Set daily task goals</li>
              <li>• Use time management tools</li>
              <li>• Seek feedback regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
