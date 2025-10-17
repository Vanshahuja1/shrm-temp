"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Users, DollarSign, Target } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const performanceData = [
  { month: "Jan", performance: 85, attendance: 92, productivity: 78 },
  { month: "Feb", performance: 88, attendance: 94, productivity: 82 },
  { month: "Mar", performance: 82, attendance: 89, productivity: 79 },
  { month: "Apr", performance: 91, attendance: 96, productivity: 88 },
  { month: "May", performance: 89, attendance: 93, productivity: 85 },
  { month: "Jun", performance: 93, attendance: 95, productivity: 90 },
]

const departmentPerformance = [
  { department: "IT Development", performance: 92, employees: 25, budget: 850000 },
  { department: "HR", performance: 88, employees: 12, budget: 320000 },
  { department: "Business Dev", performance: 85, employees: 18, budget: 420000 },
  { department: "IT Management", performance: 90, employees: 15, budget: 500000 },
]

const projectStatusData = [
  { name: "Completed", value: 12, color: "#10B981" },
  { name: "In Progress", value: 8, color: "#3B82F6" },
  { name: "Pending", value: 3, color: "#F59E0B" },
  { name: "On Hold", value: 2, color: "#EF4444" },
]

const salaryDistribution = [
  { range: "30k-50k", count: 45, color: "#8B5CF6" },
  { range: "50k-70k", count: 32, color: "#06B6D4" },
  { range: "70k-90k", count: 18, color: "#10B981" },
  { range: "90k+", count: 12, color: "#F59E0B" },
]

const skillsRadarData = [
  { skill: "Technical", A: 120, B: 110, fullMark: 150 },
  { skill: "Communication", A: 98, B: 130, fullMark: 150 },
  { skill: "Leadership", A: 86, B: 130, fullMark: 150 },
  { skill: "Problem Solving", A: 99, B: 100, fullMark: 150 },
  { skill: "Teamwork", A: 85, B: 90, fullMark: 150 },
  { skill: "Innovation", A: 65, B: 85, fullMark: 150 },
]

const attendanceData = [
  { day: "Mon", present: 95, absent: 5 },
  { day: "Tue", present: 92, absent: 8 },
  { day: "Wed", present: 88, absent: 12 },
  { day: "Thu", present: 94, absent: 6 },
  { day: "Fri", present: 90, absent: 10 },
  { day: "Sat", present: 85, absent: 15 },
  { day: "Sun", present: 80, absent: 20 },
]

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"></h1>
          <p className="text-gray-600"></p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-gray-600">Avg Performance</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-gray-600">Attendance Rate</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-gray-600">Goal Achievement</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-gray-600">Productivity</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line type="monotone" dataKey="performance" stroke="#3B82F6" strokeWidth={3} />
              <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="productivity" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            Department Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Status & Salary Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="text-purple-600" size={20} />
            </div>
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <RechartsPieChart data={projectStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartsPieChart>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {projectStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="text-orange-600" size={20} />
            </div>
            Salary Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="range" type="category" stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Analysis & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-red-100 rounded-lg">
              <Target className="text-red-600" size={20} />
            </div>
            Skills Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis />
              <Radar name="Team A" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Team B" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="text-indigo-600" size={20} />
            </div>
            Weekly Attendance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Department Analytics Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentPerformance.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.employees}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${dept.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{dept.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {dept.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        dept.performance > 90
                          ? "bg-green-100 text-green-800"
                          : dept.performance > 85
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dept.performance > 90 ? "Excellent" : dept.performance > 85 ? "Good" : "Needs Improvement"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
