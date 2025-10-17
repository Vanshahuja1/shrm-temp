"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axiosInstance"
import { motion } from "framer-motion"
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Building, 
  CheckCircle, 
  // DollarSign,
  Clock
} from "lucide-react"
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
  PieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from "recharts"

type ColorType = "blue" | "green" | "purple" | "orange" | "emerald" | "red"

interface StatItem {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: ColorType
}

export default function Overview() {
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; employees: number; activeProjects: number; completedProjects: number; attendance: number }>>([])
  const [departmentData, setDepartmentData] = useState<Array<{ name: string; value: number; employees: number; color: string }>>([])
  const [projectStatusData, setProjectStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [totalDepartments, setTotalDepartments] = useState(0)
  const [activeProjects, setActiveProjects] = useState(0)
  const [completedProjects, setCompletedProjects] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true)
      try {
        console.log("Fetching overview data...")
        const res = await axios.get("/overview")
        console.log("Overview API response:", res.data)
        
        // Safely extract data with fallbacks
        const data = res.data
        
        if (data.success !== false) {
          setMonthlyData(data.monthlyData || [])
          setDepartmentData(data.departmentData || [])
          setProjectStatusData(data.projectStatusData || [])
          setTotalEmployees(data.totalEmployees || 0)
          setTotalDepartments(data.totalDepartments || 0)
          setActiveProjects(data.activeProjects || 0)
          setCompletedProjects(data.completedProjects || 0)
          
          console.log("Data set successfully:", {
            totalEmployees: data.totalEmployees,
            totalDepartments: data.totalDepartments,
            activeProjects: data.activeProjects,
            completedProjects: data.completedProjects
          })
        } else {
          console.error("API returned error:", data.error)
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error)
        // console.error("Error details:", error.response?.data || error.message)
        
        // Set default values on error
        setTotalEmployees(0)
        setTotalDepartments(0)
        setActiveProjects(0)
        setCompletedProjects(0)
        setMonthlyData([])
        setDepartmentData([])
        setProjectStatusData([])
      }
      setLoading(false)
    }
    fetchOverview()
  }, [])

  const stats: StatItem[] = [
    { title: "Total Employees", value: String(totalEmployees || 0), change: "+12%", icon: Users, color: "blue" },
    { title: "Active Projects", value: String(activeProjects || 0), change: "+5%", icon: Briefcase, color: "green" },
    { title: "Completed Projects", value: String(completedProjects || 0), change: "+23%", icon: CheckCircle, color: "emerald" },
    { title: "Departments", value: String(totalDepartments || 0), change: "0%", icon: Building, color: "orange" },
  ]

  console.log("Current state values:", { totalEmployees, activeProjects, completedProjects, totalDepartments })
  console.log("Stats array:", stats)

  const colorClasses: Record<ColorType, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const getIconBackgroundClass = (color: ColorType): string => {
    const backgroundClasses: Record<ColorType, string> = {
      blue: "bg-blue-100",
      green: "bg-green-100",
      purple: "bg-purple-100",
      orange: "bg-orange-100",
      emerald: "bg-emerald-100",
      red: "bg-red-100",
    }
    return backgroundClasses[color]
  }

  if (loading) {
    return <div className="p-8 text-center text-lg text-gray-500">Loading overview...</div>
  }

  return (
    <>
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${colorClasses[stat.color]} bg-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getIconBackgroundClass(stat.color)} shadow-sm`}>
                  <Icon size={24} />
                </div>
                {/* <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    stat.change.startsWith("+") ? "bg-green-100 text-green-700" : 
                    stat.change === "0%" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.change}
                </span> */}
              </div>
              <p className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Growth Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[80, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#attendanceGradient)" 
                strokeWidth={3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={projectStatusData} 
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={100} 
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} projects`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {projectStatusData.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                <span className="text-sm text-gray-600">{status.name} ({status.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            Employee Distribution by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="name" stroke="#6b7280" width={120} />
              <Tooltip formatter={(value) => [`${value} employees`, "Count"]} />
              <Bar dataKey="employees" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Department */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Revenue by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => [
                  name === "revenue" ? `${(Number(value) / 1000).toFixed(0)}K` : value,
                  name === "revenue" ? "Revenue" : "Projects"
                ]}
              />
              <Bar dataKey="revenue" fill="#10B981" name="revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div> */}
      </div>

      {/* Full Width Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-indigo-600" />
          Monthly Performance Metrics
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "employees") return [value, "Employees"]
                if (name === "activeProjects") return [value, "Active Projects"]
                if (name === "completedProjects") return [value, "Completed Projects"]
                if (name === "attendance") return [`${value}%`, "Attendance"]
                return [value, name]
              }}
            />
            <Line type="monotone" dataKey="employees" stroke="#3B82F6" strokeWidth={3} name="employees" />
            <Line type="monotone" dataKey="activeProjects" stroke="#8B5CF6" strokeWidth={2} name="activeProjects" />
            <Line type="monotone" dataKey="completedProjects" stroke="#10B981" strokeWidth={2} name="completedProjects" />
            <Line type="monotone" dataKey="attendance" stroke="#F59E0B" strokeWidth={2} name="attendance" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
    </>
  )
}
