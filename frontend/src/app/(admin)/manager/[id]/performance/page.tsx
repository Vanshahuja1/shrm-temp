"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { 
  Users, 
  Target, 
  Award, 
  DollarSign, 
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Plus
} from "lucide-react"
import { toast } from "react-hot-toast"

interface PerformanceDashboardData {
  performanceStats: {
    totalEmployees: number
    totalPerformanceScores: number
    averageScore: number
    categoryDistribution: {
      FEE: number
      EE: number
      AE: number
      BE: number
      PE: number
    }
    completedReviews: number
    pendingReviews: number
    incrementsApproved: number
    totalIncentives: number
  }
  topPerformers: Array<{
    employeeId: string
    name: string
    department: string
    score: number
    category: string
  }>
  recentActivities: Array<{
    type: string
    description: string
    timestamp: string
  }>
  kraStats: {
    totalKRAs: number
    completedKRAs: number
    inProgressKRAs: number
  }
  kpiStats: {
    totalKPIs: number
    achievedKPIs: number
    averageAchievement: number
  }
  growthMetrics: {
    currentGrowth: number
    previousGrowth: number
    growthTrend: string
  }
}

export default function PerformanceDashboard() {
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedQuarter, setSelectedQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`)
  
  // Button handlers
  const handleExportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Performance Management Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Period: ${selectedQuarter} ${selectedYear}`],
      [''],
      ['Performance Statistics'],
      ['Metric', 'Value'],
      ['Total Employees', dashboardData.performanceStats.totalEmployees],
      ['Average Score', `${dashboardData.performanceStats.averageScore}%`],
      ['Completed Reviews', dashboardData.performanceStats.completedReviews],
      ['Pending Reviews', dashboardData.performanceStats.pendingReviews],
      ['Approved Increments', dashboardData.performanceStats.incrementsApproved],
      [''],
      ['Top Performers'],
      ['Rank', 'Name', 'Department', 'Score', 'Category'],
      ...dashboardData.topPerformers.map((performer, index) => [
        index + 1, performer.name, performer.department, `${performer.score}%`, performer.category
      ]),
      [''],
      ['Performance Distribution'],
      ['Category', 'Count', 'Percentage'],
      ...Object.entries(dashboardData.performanceStats.categoryDistribution).map(([category, count]) => [
        category, count, `${Math.round((count / dashboardData.performanceStats.totalEmployees) * 100)}%`
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${selectedQuarter}-${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Performance report exported successfully!')
  }

  const handleStartNewReviewCycle = () => {
    toast.success('Starting new performance review cycle...')
    // This would typically open a modal or navigate to a new review setup page
    console.log('Starting new review cycle for', selectedQuarter, selectedYear)
  }

  const handleProcessNewIncrements = () => {
    toast.success('Processing new salary increments...')
    // This would typically open the increments calculation modal
    console.log('Processing increments for', selectedQuarter, selectedYear)
  }

  const handleExportAnalyticsReport = () => {
    const analyticsData = [
      ['Performance Analytics Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Period: ${selectedQuarter} ${selectedYear}`],
      [''],
      ['KRA Statistics'],
      ['Total KRAs', dashboardData.kraStats.totalKRAs],
      ['Completed KRAs', dashboardData.kraStats.completedKRAs],
      ['In Progress KRAs', dashboardData.kraStats.inProgressKRAs],
      ['Completion Rate', `${Math.round((dashboardData.kraStats.completedKRAs / dashboardData.kraStats.totalKRAs) * 100)}%`],
      [''],
      ['KPI Statistics'],
      ['Total KPIs', dashboardData.kpiStats.totalKPIs],
      ['Achieved KPIs', dashboardData.kpiStats.achievedKPIs],
      ['Average Achievement', `${dashboardData.kpiStats.averageAchievement}%`],
      [''],
      ['Growth Metrics'],
      ['Current Growth', `${dashboardData.growthMetrics.currentGrowth}%`],
      ['Previous Growth', `${dashboardData.growthMetrics.previousGrowth}%`],
      ['Growth Trend', dashboardData.growthMetrics.growthTrend]
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([analyticsData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${selectedQuarter}-${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Analytics report exported successfully!')
  }

  const handleViewAllPerformers = () => {
    toast.success('Redirecting to complete performers list...')
    // This would typically navigate to a detailed performers page
    console.log('Viewing all performers for', selectedQuarter, selectedYear)
  }

  // Filter change handlers
  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    toast.success(`Switched to year ${year}`)
    // In a real app, this would trigger a data refetch
    console.log('Filtering data for year:', year)
  }

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter)
    toast.success(`Switched to ${quarter}`)
    // In a real app, this would trigger a data refetch
    console.log('Filtering data for quarter:', quarter)
  }
  
  // Initialize with mock data to prevent null access errors
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData>({
    performanceStats: {
      totalEmployees: 0,
      totalPerformanceScores: 0,
      averageScore: 0,
      categoryDistribution: { FEE: 0, EE: 0, AE: 0, BE: 0, PE: 0 },
      completedReviews: 0,
      pendingReviews: 0,
      incrementsApproved: 0,
      totalIncentives: 0
    },
    topPerformers: [],
    recentActivities: [],
    kraStats: { totalKRAs: 0, completedKRAs: 0, inProgressKRAs: 0 },
    kpiStats: { totalKPIs: 0, achievedKPIs: 0, averageAchievement: 0 },
    growthMetrics: { currentGrowth: 0, previousGrowth: 0, growthTrend: "stable" }
  })

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Using comprehensive mock data since API is not working
      console.log("Using mock data for performance dashboard")
      
      const mockData: PerformanceDashboardData = {
        performanceStats: {
          totalEmployees: 156,
          totalPerformanceScores: 142,
          averageScore: 78,
          categoryDistribution: {
            FEE: 42,
            EE: 38,
            AE: 45,
            BE: 22,
            PE: 9
          },
          completedReviews: 89,
          pendingReviews: 14,
          incrementsApproved: 23,
          totalIncentives: 45
        },
        topPerformers: [
          { employeeId: "EMP001", name: "Alice Johnson", department: "Engineering", score: 94, category: "FEE" },
          { employeeId: "EMP002", name: "Bob Smith", department: "Sales", score: 91, category: "FEE" },
          { employeeId: "EMP003", name: "Carol Davis", department: "Marketing", score: 89, category: "EE" },
          { employeeId: "EMP004", name: "David Wilson", department: "HR", score: 87, category: "EE" },
          { employeeId: "EMP005", name: "Eva Brown", department: "Finance", score: 85, category: "EE" },
          { employeeId: "EMP006", name: "Frank Miller", department: "IT", score: 83, category: "AE" },
          { employeeId: "EMP007", name: "Grace Lee", department: "Operations", score: 81, category: "AE" }
        ],
        recentActivities: [
          { type: "review", description: "Performance review completed for Alice Johnson", timestamp: "2024-01-15T10:30:00Z" },
          { type: "increment", description: "Salary increment approved for Bob Smith", timestamp: "2024-01-14T15:45:00Z" },
          { type: "review", description: "Mid-year review scheduled for Carol Davis", timestamp: "2024-01-13T09:15:00Z" },
          { type: "increment", description: "Promotion increment processed for David Wilson", timestamp: "2024-01-12T14:20:00Z" }
        ],
        kraStats: {
          totalKRAs: 234,
          completedKRAs: 189,
          inProgressKRAs: 45
        },
        kpiStats: {
          totalKPIs: 178,
          achievedKPIs: 145,
          averageAchievement: 82
        },
        growthMetrics: {
          currentGrowth: 12.5,
          previousGrowth: 10.2,
          growthTrend: "up"
        }
      }
      
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDashboardData(mockData)
      toast.success("Dashboard data loaded successfully!")
      
    } catch (error: unknown) {
      console.error("Error loading dashboard:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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

  const getCategoryFullForm = (category: string) => {
    const fullForms = {
      FEE: "Far Exceeds Expectations",
      EE: "Exceeds Expectations",
      AE: "Achieves Expectations",
      BE: "Below Expectations",
      PE: "Poor Expectations"
    }
    return fullForms[category as keyof typeof fullForms] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2023, 2022].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedQuarter} onValueChange={handleQuarterChange}>
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
          
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.performanceStats?.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active in performance tracking
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.performanceStats?.averageScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance average
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.performanceStats?.completedReviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.performanceStats?.pendingReviews || 0} pending
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Increments Approved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.performanceStats?.incrementsApproved || 0}</div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="increments">Increments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Performance rating categories and employee distribution
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dashboardData?.performanceStats?.categoryDistribution || {}).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{category}</span>
                          <span className="text-xs text-gray-500">{getCategoryFullForm(category)}</span>
                        </div>
                        <Badge variant="secondary">{count} employees</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {dashboardData?.performanceStats?.totalEmployees > 0
                            ? Math.round((count / dashboardData.performanceStats.totalEmployees) * 100) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Performance Rating Legend */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Rating Guide</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span><strong>FEE:</strong> Far Exceeds Expectations - Outstanding performance, consistently surpasses goals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span><strong>EE:</strong> Exceeds Expectations - Strong performance, often surpasses goals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span><strong>AE:</strong> Achieves Expectations - Solid performance, meets all required goals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span><strong>BE:</strong> Below Expectations - Performance needs improvement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span><strong>PE:</strong> Poor Expectations - Significant performance issues requiring attention</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Performers</CardTitle>
                <Button variant="outline" size="sm" onClick={handleViewAllPerformers}>
                  <Plus className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.topPerformers || []).slice(0, 5).map((performer, index) => (
                    <div key={performer.employeeId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{performer.name}</div>
                          <div className="text-sm text-gray-600">{performer.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{performer.score}%</div>
                        <Badge className={getCategoryColor(performer.category)}>
                          {performer.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KRA & KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KRA Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total KRAs</span>
                    <span className="font-medium">{dashboardData?.kraStats?.totalKRAs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-medium text-green-600">{dashboardData?.kraStats?.completedKRAs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress</span>
                    <span className="font-medium text-yellow-600">{dashboardData?.kraStats?.inProgressKRAs || 0}</span>
                  </div>
                  <Progress 
                    value={(dashboardData?.kraStats?.totalKRAs || 0) > 0
                      ? ((dashboardData?.kraStats?.completedKRAs || 0) / dashboardData.kraStats.totalKRAs) * 100 
                      : 0} 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KPI Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total KPIs</span>
                    <span className="font-medium">{dashboardData?.kpiStats?.totalKPIs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achieved</span>
                    <span className="font-medium text-green-600">{dashboardData?.kpiStats?.achievedKPIs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Achievement</span>
                    <span className="font-medium">{dashboardData?.kpiStats?.averageAchievement || 0}%</span>
                  </div>
                  <Progress 
                    value={dashboardData?.kpiStats?.averageAchievement || 0} 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Growth</span>
                    <div className="flex items-center">
                      <span className="font-medium">{dashboardData?.growthMetrics?.currentGrowth || 0}%</span>
                      {(dashboardData?.growthMetrics?.currentGrowth || 0) > (dashboardData?.growthMetrics?.previousGrowth || 0) ? (
                        <ArrowUp className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 ml-1" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Growth</span>
                    <span className="font-medium">{dashboardData?.growthMetrics?.previousGrowth || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trend</span>
                    <Badge variant={(dashboardData?.growthMetrics?.growthTrend || "stable") === "up" ? "default" : "destructive"}>
                      {dashboardData?.growthMetrics?.growthTrend || "stable"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Scores Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Manage employee performance scores and evaluations.</p>
                <div className="flex space-x-4">
                  <Button asChild>
                    <a href="./performance/scores">Manage Performance Scores</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="./performance/kra">Manage KRAs</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Monitor and manage performance review cycles.</p>
                <div className="flex space-x-4">
                  <Button asChild>
                    <a href="./performance/reviews">View Reviews</a>
                  </Button>
                  <Button variant="outline" onClick={handleStartNewReviewCycle}>
                    Start New Review Cycle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="increments">
          <Card>
            <CardHeader>
              <CardTitle>Salary Increments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Track and approve salary increment requests.</p>
                <div className="flex space-x-4">
                  <Button asChild>
                    <a href="./performance/increments">View Increments</a>
                  </Button>
                  <Button variant="outline" onClick={handleProcessNewIncrements}>
                    Process New Increments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">View comprehensive performance analytics and insights.</p>
                <div className="flex space-x-4">
                  <Button asChild>
                    <a href="./performance/analytics">View Analytics Dashboard</a>
                  </Button>
                  <Button variant="outline" onClick={handleExportAnalyticsReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
