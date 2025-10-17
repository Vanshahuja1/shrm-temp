
"use client"
import React from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart, Bar } from "recharts"
import { GraduationCap, BookOpen, Users, Building, TrendingUp, BarChart3 } from "lucide-react"
import { monthlyData } from "../DummyData"
const Overview = () => {
  // Define the color type
  type ColorType = "red" | "green" | "blue" | "purple"
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Students", value: "495", change: "+7%", icon: GraduationCap, color: "red" as ColorType },
          { title: "Active Batches", value: "4", change: "+1", icon: BookOpen, color: "green" as ColorType },
          { title: "Faculty Members", value: "15", change: "0%", icon: Users, color: "blue" as ColorType },
          { title: "Departments", value: "5", change: "0%", icon: Building, color: "purple" as ColorType },
        ].map((stat, index) => {
          const Icon = stat.icon
          const colorClasses: Record<ColorType, string> = {
            red: "bg-red-50 text-red-700 border-red-200",
            green: "bg-green-50 text-green-700 border-green-200",
            blue: "bg-blue-50 text-blue-700 border-blue-200",
            purple: "bg-purple-50 text-purple-700 border-purple-200",
          }

          return (
            <motion.div
              key={index}
              whileHover={{ y: -2, scale: 1.01 }}
              className={`p-6 rounded-xl border-2 ${colorClasses[stat.color]} bg-white shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${colorClasses[stat.color].replace("border-", "bg-").replace("-200", "-100")}`}
                >
                  <Icon size={24} />
                </div>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            Revenue Trend
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
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            Student Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
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
              <Bar dataKey="students" fill="#DC2626" name="Total Students" radius={[4, 4, 0, 0]} />
              <Bar dataKey="admissions" fill="#7C3AED" name="New Admissions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Overview