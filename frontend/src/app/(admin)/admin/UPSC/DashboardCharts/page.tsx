"use client"
import React, { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { DollarSign  } from "lucide-react"
import { BarChart3, TrendingUp } from "lucide-react"
import { LineChart, Bar, BarChart, PieChart as RechartsPieChart, Pie, Cell, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Dashboard Charts Component
type MonthlyDataItem = {
  month: string;
  revenue: number;
  growth: number;
};

export default function DashboardChartsPage() {
  // eslint-disable-next-line
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([
    { month: "Jan", revenue: 45000, growth: 12 },
    { month: "Feb", revenue: 52000, growth: 15 },
    { month: "Mar", revenue: 48000, growth: 8 },
    { month: "Apr", revenue: 61000, growth: 22 },
    { month: "May", revenue: 55000, growth: 18 },
    { month: "Jun", revenue: 67000, growth: 25 },
  ])

  // You can fetch data here if needed
  useEffect(() => {
    // Fetch monthly data from API if needed
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('/api/dashboard/monthly-data')
    //     const data = await response.json()
    //     setMonthlyData(data)
    //   } catch (error) {
    //     console.error('Error fetching monthly data:', error)
    //   }
    // }
    // fetchData()
  }, [])
  const pieData = [
    { name: "HR", value: 12, color: "#DC2626" },
    { name: "Sales", value: 10, color: "#059669" },
    { name: "Faculty", value: 31, color: "#7C3AED" },
    { name: "IT Support", value: 10, color: "#EA580C" },
    { name: "Management", value: 14, color: "#0891B2" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Charts</h1>

      {/* Revenue and Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={20} />
            </div>
            Revenue Generated
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            Growth Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value) => [`${value}%`, "Growth"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="growth" fill="#3B82F6" name="Growth %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Member Count Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={20} />
            </div>
            Member Count by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip
                formatter={(value) => [value, "Members"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="text-red-600" size={20} />
            </div>
            Department Statistics
          </h3>
          <div className="space-y-4">
            {pieData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }}></div>
                  <span className="font-semibold text-gray-900">{dept.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: dept.color }}>
                    {dept.value}
                  </p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
