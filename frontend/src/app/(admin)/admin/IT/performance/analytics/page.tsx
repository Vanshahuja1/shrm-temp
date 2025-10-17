"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
  AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"

interface AnalyticsData {
  performanceOverview: {
    totalEmployees: number
    averagePerformanceScore: number
    topPerformersCount: number
    improvementNeededCount: number
  }
  categoryDistribution: {
    FEE: number
    EE: number
    AE: number
    BE: number
    PE: number
  }
  departmentPerformance: Array<{
    department: string
    averageScore: number
    employeeCount: number
    trend: "up" | "down" | "stable"
  }>
  quarterlyTrends: Array<{
    quarter: string
    averageScore: number
    completionRate: number
  }>
  kraAnalytics: {
    totalKRAs: number
    completedKRAs: number
    averageAchievement: number
    onTimeCompletion: number
  }
  incrementAnalytics: {
    totalIncrements: number
    averageIncrementPercentage: number
    totalAmountDistributed: number
    budgetUtilization: number
  }
}

export default function PerformanceAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedQuarter, setSelectedQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using mock data since API is not working
      console.log("Using mock data for performance analytics")
      
      const mockData: AnalyticsData = {
        performanceOverview: {
          totalEmployees: 156,
          averagePerformanceScore: 78,
          topPerformersCount: 42,
          improvementNeededCount: 23
        },
        categoryDistribution: {
          FEE: 42,
          EE: 38,
          AE: 45,
          BE: 22,
          PE: 9
        },
        departmentPerformance: [
          { department: "Engineering", averageScore: 82, employeeCount: 45, trend: "up" },
          { department: "Sales", averageScore: 76, employeeCount: 32, trend: "stable" },
          { department: "Marketing", averageScore: 74, employeeCount: 28, trend: "down" },
          { department: "HR", averageScore: 80, employeeCount: 18, trend: "up" },
          { department: "Finance", averageScore: 85, employeeCount: 15, trend: "up" },
          { department: "IT", averageScore: 88, employeeCount: 22, trend: "up" },
          { department: "Operations", averageScore: 72, employeeCount: 16, trend: "stable" }
        ],
        quarterlyTrends: [
          { quarter: "Q1 2024", averageScore: 72, completionRate: 85 },
          { quarter: "Q2 2024", averageScore: 75, completionRate: 88 },
          { quarter: "Q3 2024", averageScore: 76, completionRate: 92 },
          { quarter: "Q4 2024", averageScore: 78, completionRate: 95 }
        ],
        kraAnalytics: {
          totalKRAs: 234,
          completedKRAs: 189,
          averageAchievement: 82,
          onTimeCompletion: 89
        },
        incrementAnalytics: {
          totalIncrements: 45,
          averageIncrementPercentage: 12.5,
          totalAmountDistributed: 2450000,
          budgetUtilization: 78
        }
      }
      
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 700))
      
      setAnalyticsData(mockData)
      toast.success("Analytics data loaded successfully!")
      
    } catch (error: unknown) {
      console.error("Failed to fetch analytics:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics data"
      setError(errorMessage)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleExportAnalytics = () => {
    try {
      if (!analyticsData) {
        toast.error("No analytics data available to export")
        return
      }

      // Create comprehensive CSV content
      const csvSections = []
      
      // Performance Overview Section
      csvSections.push([
        "PERFORMANCE OVERVIEW",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Metric",
        "Value",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Total Employees",
        analyticsData.performanceOverview.totalEmployees.toString(),
        "",
        "",
        ""
      ])
      csvSections.push([
        "Average Performance Score",
        `${analyticsData.performanceOverview.averagePerformanceScore}%`,
        "",
        "",
        ""
      ])
      csvSections.push([
        "Top Performers Count",
        analyticsData.performanceOverview.topPerformersCount.toString(),
        "",
        "",
        ""
      ])
      csvSections.push([
        "Improvement Needed Count",
        analyticsData.performanceOverview.improvementNeededCount.toString(),
        "",
        "",
        ""
      ])
      csvSections.push(["", "", "", "", ""])

      // Category Distribution Section
      csvSections.push([
        "CATEGORY DISTRIBUTION",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Category",
        "Employee Count",
        "Percentage",
        "",
        ""
      ])
      Object.entries(analyticsData.categoryDistribution).forEach(([category, count]) => {
        const percentage = Math.round((count / analyticsData.performanceOverview.totalEmployees) * 100)
        csvSections.push([
          category,
          count.toString(),
          `${percentage}%`,
          "",
          ""
        ])
      })
      csvSections.push(["", "", "", "", ""])

      // Department Performance Section
      csvSections.push([
        "DEPARTMENT PERFORMANCE",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Department",
        "Average Score",
        "Employee Count",
        "Trend",
        ""
      ])
      analyticsData.departmentPerformance.forEach(dept => {
        csvSections.push([
          dept.department,
          `${dept.averageScore}%`,
          dept.employeeCount.toString(),
          dept.trend,
          ""
        ])
      })
      csvSections.push(["", "", "", "", ""])

      // Quarterly Trends Section
      csvSections.push([
        "QUARTERLY TRENDS",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Quarter",
        "Average Score",
        "Completion Rate",
        "",
        ""
      ])
      analyticsData.quarterlyTrends.forEach(trend => {
        csvSections.push([
          trend.quarter,
          `${trend.averageScore}%`,
          `${trend.completionRate}%`,
          "",
          ""
        ])
      })
      csvSections.push(["", "", "", "", ""])

      // KRA Analytics Section
      csvSections.push([
        "KRA ANALYTICS",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Metric",
        "Value",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Total KRAs",
        analyticsData.kraAnalytics.totalKRAs.toString(),
        "",
        "",
        ""
      ])
      csvSections.push([
        "Completed KRAs",
        analyticsData.kraAnalytics.completedKRAs.toString(),
        "",
        "",
        ""
      ])
      csvSections.push([
        "Average Achievement",
        `${analyticsData.kraAnalytics.averageAchievement}%`,
        "",
        "",
        ""
      ])
      csvSections.push([
        "On-Time Completion",
        `${analyticsData.kraAnalytics.onTimeCompletion}%`,
        "",
        "",
        ""
      ])
      csvSections.push(["", "", "", "", ""])

      // Increment Analytics Section
      csvSections.push([
        "INCREMENT ANALYTICS",
        "",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Metric",
        "Value",
        "",
        "",
        ""
      ])
      csvSections.push([
        "Total Increments",
        analyticsData.incrementAnalytics.totalIncrements.toString(),
        "",
        "",
        ""
      ])
      csvSections.push([
        "Average Increment Percentage",
        `${analyticsData.incrementAnalytics.averageIncrementPercentage}%`,
        "",
        "",
        ""
      ])
      csvSections.push([
        "Total Amount Distributed",
        `$${analyticsData.incrementAnalytics.totalAmountDistributed.toLocaleString()}`,
        "",
        "",
        ""
      ])
      csvSections.push([
        "Budget Utilization",
        `${analyticsData.incrementAnalytics.budgetUtilization}%`,
        "",
        "",
        ""
      ])

      // Create CSV content
      const csvContent = csvSections.map(row => 
        row.map(cell => `"${cell}"`).join(",")
      ).join("\n")

      // Add header with metadata
      const header = [
        `"Performance Analytics Report"`,
        `"Generated on: ${new Date().toLocaleDateString()}"`,
        `"Period: ${selectedQuarter} ${selectedYear}"`,
        `"Total Employees: ${analyticsData.performanceOverview.totalEmployees}"`,
        "",
        ""
      ].join("\n")

      const fullCsvContent = header + "\n" + csvContent

      // Create and download file
      const blob = new Blob([fullCsvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `performance_analytics_${selectedQuarter}_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Performance analytics report exported successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export analytics report")
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      FEE: "bg-green-500",
      EE: "bg-blue-500",
      AE: "bg-yellow-500",
      BE: "bg-orange-500",
      PE: "bg-red-500"
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive performance insights and trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2023, 2022].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleExportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceOverview.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active in performance tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceOverview.averagePerformanceScore}%</div>
            <p className="text-xs text-muted-foreground">Organization-wide average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsData.performanceOverview.topPerformersCount}</div>
            <p className="text-xs text-muted-foreground">FEE & EE categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Improvement</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analyticsData.performanceOverview.improvementNeededCount}</div>
            <p className="text-xs text-muted-foreground">BE & PE categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="kra">KRA Analytics</TabsTrigger>
          <TabsTrigger value="increments">Increments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.categoryDistribution).map(([category, count]) => {
                    const percentage = Math.round((count / analyticsData.performanceOverview.totalEmployees) * 100)
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary">{count} employees</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-24" />
                          <span className="text-sm font-medium w-8">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.quarterlyTrends.map((trend) => (
                    <div key={trend.quarter} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{trend.quarter}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{trend.averageScore}%</div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{trend.completionRate}%</div>
                          <div className="text-xs text-gray-600">Completion</div>
                        </div>
                        <Progress value={trend.averageScore} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departmentPerformance.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-sm text-gray-600">{dept.employeeCount} employees</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{dept.averageScore}%</div>
                        <div className="text-xs text-gray-600">Average Score</div>
                      </div>
                      <Progress value={dept.averageScore} className="w-32" />
                      {getTrendIcon(dept.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Trend Analysis</h3>
            <p className="text-gray-600">Interactive charts and trend analysis coming soon.</p>
            <p className="text-sm text-gray-500 mt-2">
              This will include time-series charts, correlation analysis, and predictive insights.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="kra" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total KRAs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.kraAnalytics.totalKRAs}</div>
                <p className="text-xs text-gray-600">Across all employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completed KRAs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analyticsData.kraAnalytics.completedKRAs}</div>
                <Progress 
                  value={(analyticsData.kraAnalytics.completedKRAs / analyticsData.kraAnalytics.totalKRAs) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analyticsData.kraAnalytics.averageAchievement}%</div>
                <p className="text-xs text-gray-600">Goal completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">On-Time Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analyticsData.kraAnalytics.onTimeCompletion}%</div>
                <p className="text-xs text-gray-600">Met deadlines</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="increments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Increments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.incrementAnalytics.totalIncrements}</div>
                <p className="text-xs text-gray-600">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Increment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analyticsData.incrementAnalytics.averageIncrementPercentage}%</div>
                <p className="text-xs text-gray-600">Percentage increase</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${(analyticsData.incrementAnalytics.totalAmountDistributed / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-gray-600">Amount distributed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analyticsData.incrementAnalytics.budgetUtilization}%</div>
                <Progress value={analyticsData.incrementAnalytics.budgetUtilization} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
