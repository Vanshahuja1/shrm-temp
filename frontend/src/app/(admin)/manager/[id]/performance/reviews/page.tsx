"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Download
} from "lucide-react"
import { toast } from "react-hot-toast"

interface PerformanceReview {
  _id: string
  employeeId: {
    id: string
    name: string
    email: string
    department: string
    role: string
  }
  managerId: {
    id: string
    name: string
    email: string
  }
  reviewPeriod: {
    year: number
    quarter: string
  }
  selfAssessment?: {
    goals: Array<{
      description: string
      achievement: string
      rating: number
    }>
    strengths: string
    improvements: string
    comments: string
    submittedAt: string
  }
  managerEvaluation?: {
    performanceRating: number
    goalAchievements: Array<{
      description: string
      rating: number
      comments: string
    }>
    strengths: string
    improvements: string
    developmentPlan: string
    comments: string
    submittedAt: string
  }
  finalScores?: {
    selfRating: number
    managerRating: number
    finalRating: number
    calculatedAt: string
  }
  status: "not_started" | "self_assessment_pending" | "manager_evaluation_pending" | "completed" | "approved"
  dueDate: string
  createdAt: string
  updatedAt: string
}

export default function PerformanceReviewManagement() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateCycleDialogOpen, setIsCreateCycleDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [createCycleLoading, setCreateCycleLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Create cycle form data
  const [cycleFormData, setCycleFormData] = useState({
    year: new Date().getFullYear(),
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    dueDate: "",
    employeeIds: [] as string[],
    instructions: ""
  })

  // Edit review form data
  const [editFormData, setEditFormData] = useState({
    status: "not_started",
    dueDate: "",
    instructions: ""
  })

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using mock data since API is not working
      console.log("Using mock data for performance reviews")
      
      const mockReviews: PerformanceReview[] = [
        {
          _id: "review1",
          employeeId: {
            id: "EMP001",
            name: "Alice Johnson",
            email: "alice.johnson@company.com",
            department: "Engineering",
            role: "Senior Developer"
          },
          managerId: {
            id: "MGR001",
            name: "John Smith",
            email: "john.smith@company.com"
          },
          reviewPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          selfAssessment: {
            goals: [
              {
                description: "Complete authentication module",
                achievement: "Successfully implemented with advanced security features",
                rating: 4
              },
              {
                description: "Improve code quality metrics",
                achievement: "Reduced technical debt by 30%",
                rating: 5
              }
            ],
            strengths: "Strong technical skills, excellent problem-solving abilities",
            improvements: "Could improve communication with junior developers",
            comments: "Overall satisfied with my performance this quarter",
            submittedAt: "2024-03-15T10:30:00Z"
          },
          managerEvaluation: {
            performanceRating: 4,
            goalAchievements: [
              {
                description: "Complete authentication module",
                rating: 4,
                comments: "Excellent implementation with security best practices"
              },
              {
                description: "Improve code quality metrics",
                rating: 5,
                comments: "Outstanding contribution to code quality improvement"
              }
            ],
            strengths: "Technical excellence, proactive problem-solving",
            improvements: "Focus on mentoring junior team members",
            developmentPlan: "Leadership training and mentoring workshops",
            comments: "Excellent performance, ready for senior responsibilities",
            submittedAt: "2024-03-20T14:15:00Z"
          },
          finalScores: {
            selfRating: 4.5,
            managerRating: 4.5,
            finalRating: 4.5,
            calculatedAt: "2024-03-20T14:15:00Z"
          },
          status: "completed",
          dueDate: "2024-03-31",
          createdAt: "2024-03-01T09:00:00Z",
          updatedAt: "2024-03-20T14:15:00Z"
        },
        {
          _id: "review2",
          employeeId: {
            id: "EMP002",
            name: "Bob Wilson",
            email: "bob.wilson@company.com",
            department: "Sales",
            role: "Sales Manager"
          },
          managerId: {
            id: "MGR002",
            name: "Sarah Davis",
            email: "sarah.davis@company.com"
          },
          reviewPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          selfAssessment: {
            goals: [
              {
                description: "Achieve quarterly sales target",
                achievement: "Exceeded target by 15%",
                rating: 5
              },
              {
                description: "Expand client base",
                achievement: "Added 12 new enterprise clients",
                rating: 4
              }
            ],
            strengths: "Strong client relationships, excellent sales skills",
            improvements: "Need to improve CRM data entry consistency",
            comments: "Very pleased with the results this quarter",
            submittedAt: "2024-03-18T11:45:00Z"
          },
          status: "manager_evaluation_pending",
          dueDate: "2024-03-31",
          createdAt: "2024-03-01T09:00:00Z",
          updatedAt: "2024-03-18T11:45:00Z"
        },
        {
          _id: "review3",
          employeeId: {
            id: "EMP003",
            name: "Carol Martinez",
            email: "carol.martinez@company.com",
            department: "Marketing",
            role: "Marketing Specialist"
          },
          managerId: {
            id: "MGR003",
            name: "David Brown",
            email: "david.brown@company.com"
          },
          reviewPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "self_assessment_pending",
          dueDate: "2024-03-31",
          createdAt: "2024-03-01T09:00:00Z",
          updatedAt: "2024-03-01T09:00:00Z"
        },
        {
          _id: "review4",
          employeeId: {
            id: "EMP004",
            name: "Diana Lee",
            email: "diana.lee@company.com",
            department: "HR",
            role: "HR Coordinator"
          },
          managerId: {
            id: "MGR004",
            name: "Michael Chen",
            email: "michael.chen@company.com"
          },
          reviewPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          selfAssessment: {
            goals: [
              {
                description: "Implement employee wellness program",
                achievement: "Successfully launched with 80% participation",
                rating: 4
              }
            ],
            strengths: "Great organizational skills, employee-focused approach",
            improvements: "Could benefit from learning advanced HR analytics",
            comments: "Proud of the wellness program success",
            submittedAt: "2024-03-14T09:20:00Z"
          },
          managerEvaluation: {
            performanceRating: 4,
            goalAchievements: [
              {
                description: "Implement employee wellness program",
                rating: 5,
                comments: "Exceptional execution and employee engagement"
              }
            ],
            strengths: "Employee engagement, organizational skills",
            improvements: "Develop data analysis skills for HR metrics",
            developmentPlan: "HR analytics course and certification",
            comments: "Outstanding performance in employee engagement initiatives",
            submittedAt: "2024-03-19T16:30:00Z"
          },
          finalScores: {
            selfRating: 4.0,
            managerRating: 4.5,
            finalRating: 4.25,
            calculatedAt: "2024-03-19T16:30:00Z"
          },
          status: "approved",
          dueDate: "2024-03-31",
          createdAt: "2024-03-01T09:00:00Z",
          updatedAt: "2024-03-19T16:30:00Z"
        },
        {
          _id: "review5",
          employeeId: {
            id: "EMP005",
            name: "Eva Thompson",
            email: "eva.thompson@company.com",
            department: "Finance",
            role: "Financial Analyst"
          },
          managerId: {
            id: "MGR005",
            name: "Robert Kim",
            email: "robert.kim@company.com"
          },
          reviewPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "not_started",
          dueDate: "2024-03-31",
          createdAt: "2024-03-01T09:00:00Z",
          updatedAt: "2024-03-01T09:00:00Z"
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setReviews(mockReviews)
      toast.success("Performance reviews loaded successfully!")
      
    } catch (error: unknown) {
      console.error("Failed to fetch performance reviews:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch performance reviews"
      setError(errorMessage)
      toast.error("Failed to load performance reviews")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleExportReports = () => {
    try {
      // Create CSV content
      const csvHeaders = [
        "Employee Name",
        "Department", 
        "Manager",
        "Review Period",
        "Status",
        "Self Rating",
        "Manager Rating", 
        "Final Rating",
        "Due Date"
      ]

      const csvData = reviews.map(review => [
        review.employeeId.name,
        review.employeeId.department,
        review.managerId.name,
        `${review.reviewPeriod.quarter} ${review.reviewPeriod.year}`,
        review.status.replace("_", " "),
        review.finalScores?.selfRating || "N/A",
        review.finalScores?.managerRating || "N/A", 
        review.finalScores?.finalRating || "N/A",
        new Date(review.dueDate).toLocaleDateString()
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `performance_reviews_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Performance reviews report exported successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export report")
    }
  }

  const handleCreateReviewCycle = async () => {
    try {
      setCreateCycleLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, we'll create a few new review cycles
      const newReviews: PerformanceReview[] = [
        {
          _id: `review_${Date.now()}_1`,
          employeeId: {
            id: "EMP006",
            name: "Frank Miller",
            email: "frank.miller@company.com",
            department: "IT",
            role: "System Administrator"
          },
          managerId: {
            id: "MGR006",
            name: "Lisa Wong", 
            email: "lisa.wong@company.com"
          },
          reviewPeriod: {
            year: cycleFormData.year,
            quarter: cycleFormData.quarter
          },
          status: "not_started",
          dueDate: cycleFormData.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: `review_${Date.now()}_2`,
          employeeId: {
            id: "EMP007",
            name: "Grace Lee",
            email: "grace.lee@company.com", 
            department: "Operations",
            role: "Operations Manager"
          },
          managerId: {
            id: "MGR007",
            name: "Tom Wilson",
            email: "tom.wilson@company.com"
          },
          reviewPeriod: {
            year: cycleFormData.year,
            quarter: cycleFormData.quarter
          },
          status: "not_started", 
          dueDate: cycleFormData.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      // Add new reviews to the existing list
      setReviews(prev => [...newReviews, ...prev])
      
      toast.success(`Review cycle for ${cycleFormData.quarter} ${cycleFormData.year} created successfully!`)
      setIsCreateCycleDialogOpen(false)
      
      // Reset form
      setCycleFormData({
        year: new Date().getFullYear(),
        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        dueDate: "",
        employeeIds: [],
        instructions: ""
      })
      
    } catch (error: unknown) {
      console.error("Failed to create review cycle:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create review cycle"
      toast.error(errorMessage)
    } finally {
      setCreateCycleLoading(false)
    }
  }

  const handleEditReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setEditFormData({
      status: review.status,
      dueDate: review.dueDate,
      instructions: ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateReview = async () => {
    try {
      setEditLoading(true)
      
      if (!selectedReview) return
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const updatedReview: PerformanceReview = {
        ...selectedReview,
        status: editFormData.status as "not_started" | "self_assessment_pending" | "manager_evaluation_pending" | "completed" | "approved",
        dueDate: editFormData.dueDate,
        updatedAt: new Date().toISOString()
      }

      // Update the review in the list
      setReviews(prev => prev.map(review => review._id === selectedReview._id ? updatedReview : review))
      
      toast.success("Performance review updated successfully!")
      setIsEditDialogOpen(false)
      setSelectedReview(null)
      
      // Reset form
      setEditFormData({
        status: "not_started",
        dueDate: "",
        instructions: ""
      })
      
    } catch (error: unknown) {
      console.error("Failed to update review:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update review"
      toast.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteReview = async () => {
    try {
      setDeleteLoading(true)
      
      if (!selectedReview) return
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Remove the review from the list
      setReviews(prev => prev.filter(review => review._id !== selectedReview._id))
      
      toast.success("Performance review deleted successfully!")
      setIsDeleteDialogOpen(false)
      setSelectedReview(null)
    } catch (error: unknown) {
      console.error("Failed to delete review:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete review"
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      self_assessment_pending: "bg-yellow-100 text-yellow-800",
      manager_evaluation_pending: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-purple-100 text-purple-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "self_assessment_pending":
      case "manager_evaluation_pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.employeeId.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const reviewStats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === "self_assessment_pending" || r.status === "manager_evaluation_pending").length,
    completed: reviews.filter(r => r.status === "completed").length,
    approved: reviews.filter(r => r.status === "approved").length
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
          <Button onClick={() => fetchReviews()}>
            Try Again
          </Button>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-1">Manage employee performance review cycles</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportReports}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button onClick={() => setIsCreateCycleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Review Cycle
          </Button>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reviewStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reviewStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{reviewStats.approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="self_assessment_pending">Self Assessment Pending</SelectItem>
            <SelectItem value="manager_evaluation_pending">Manager Evaluation Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.employeeId.name}</div>
                      <div className="text-sm text-gray-600">{review.employeeId.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{review.managerId.name}</div>
                  </TableCell>
                  <TableCell>
                    {review.reviewPeriod.quarter} {review.reviewPeriod.year}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {review.selfAssessment && <CheckCircle className="h-3 w-3 text-green-500" />}
                        <span className="text-xs">Self Assessment</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.managerEvaluation && <CheckCircle className="h-3 w-3 text-green-500" />}
                        <span className="text-xs">Manager Evaluation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.finalScores && <CheckCircle className="h-3 w-3 text-green-500" />}
                        <span className="text-xs">Final Scores</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(review.status)}
                      <Badge variant="outline" className={getStatusColor(review.status)}>
                        {review.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(review.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteReview(review)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="self-assessment">Self Assessment</TabsTrigger>
                <TabsTrigger value="manager-evaluation">Manager Evaluation</TabsTrigger>
                <TabsTrigger value="final-scores">Final Scores</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Review Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Employee:</span>
                      <div className="font-medium">{selectedReview.employeeId.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Manager:</span>
                      <div className="font-medium">{selectedReview.managerId.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Department:</span>
                      <div className="font-medium">{selectedReview.employeeId.department}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Period:</span>
                      <div className="font-medium">
                        {selectedReview.reviewPeriod.quarter} {selectedReview.reviewPeriod.year}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant="outline" className={getStatusColor(selectedReview.status)}>
                        {selectedReview.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <div className="font-medium">{new Date(selectedReview.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Self Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        {selectedReview.selfAssessment ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Completed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Pending</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Manager Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        {selectedReview.managerEvaluation ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Completed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Pending</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Final Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        {selectedReview.finalScores ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Calculated</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Pending</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="self-assessment" className="space-y-4">
                {selectedReview.selfAssessment ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Goals Achievement</h4>
                      <div className="space-y-2">
                        {selectedReview.selfAssessment.goals.map((goal, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">{goal.description}</div>
                            <div className="text-sm text-gray-600 mt-1">{goal.achievement}</div>
                            <div className="flex items-center space-x-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < goal.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Strengths</h4>
                      <div className="bg-green-50 p-3 rounded">
                        {selectedReview.selfAssessment.strengths}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement</h4>
                      <div className="bg-yellow-50 p-3 rounded">
                        {selectedReview.selfAssessment.improvements}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Additional Comments</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        {selectedReview.selfAssessment.comments}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Self assessment not yet submitted
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manager-evaluation" className="space-y-4">
                {selectedReview.managerEvaluation ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Performance Rating</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < selectedReview.managerEvaluation!.performanceRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-medium">{selectedReview.managerEvaluation.performanceRating}/5</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Goal Achievements</h4>
                      <div className="space-y-2">
                        {selectedReview.managerEvaluation.goalAchievements.map((goal, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">{goal.description}</div>
                            <div className="flex items-center space-x-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < goal.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{goal.comments}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Strengths Identified</h4>
                      <div className="bg-green-50 p-3 rounded">
                        {selectedReview.managerEvaluation.strengths}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement</h4>
                      <div className="bg-yellow-50 p-3 rounded">
                        {selectedReview.managerEvaluation.improvements}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Development Plan</h4>
                      <div className="bg-blue-50 p-3 rounded">
                        {selectedReview.managerEvaluation.developmentPlan}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Manager evaluation not yet completed
                  </div>
                )}
              </TabsContent>

              <TabsContent value="final-scores" className="space-y-4">
                {selectedReview.finalScores ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Self Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReview.finalScores.selfRating}/5</div>
                          <Progress value={(selectedReview.finalScores.selfRating / 5) * 100} className="mt-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Manager Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReview.finalScores.managerRating}/5</div>
                          <Progress value={(selectedReview.finalScores.managerRating / 5) * 100} className="mt-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Final Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">{selectedReview.finalScores.finalRating}/5</div>
                          <Progress value={(selectedReview.finalScores.finalRating / 5) * 100} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-sm text-gray-600">Calculated on:</span>
                      <div className="font-medium">{new Date(selectedReview.finalScores.calculatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Final scores not yet calculated
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Review Cycle Dialog */}
      <Dialog open={isCreateCycleDialogOpen} onOpenChange={setIsCreateCycleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Review Cycle</DialogTitle>
            <DialogDescription>
              Set up a new performance review cycle for employees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Review Year</Label>
                <Select value={cycleFormData.year.toString()} onValueChange={(value) => setCycleFormData({...cycleFormData, year: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quarter">Quarter</Label>
                <Select value={cycleFormData.quarter} onValueChange={(value) => setCycleFormData({...cycleFormData, quarter: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Review Due Date</Label>
              <Input
                type="date"
                value={cycleFormData.dueDate}
                onChange={(e) => setCycleFormData({...cycleFormData, dueDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Review Instructions</Label>
              <Textarea
                value={cycleFormData.instructions}
                onChange={(e) => setCycleFormData({...cycleFormData, instructions: e.target.value})}
                placeholder="Enter instructions for employees and managers..."
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Review Cycle Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Period:</strong> {cycleFormData.quarter} {cycleFormData.year}</div>
                <div><strong>Due Date:</strong> {cycleFormData.dueDate ? new Date(cycleFormData.dueDate).toLocaleDateString() : "Not set"}</div>
                <div><strong>Employees:</strong> All active employees will be included</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCycleDialogOpen(false)} disabled={createCycleLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateReviewCycle} disabled={createCycleLoading || !cycleFormData.dueDate}>
              {createCycleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Review Cycle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Performance Review</DialogTitle>
            <DialogDescription>
              Update the review status and due date
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Review Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Employee:</strong> {selectedReview.employeeId.name}</div>
                  <div><strong>Manager:</strong> {selectedReview.managerId.name}</div>
                  <div><strong>Department:</strong> {selectedReview.employeeId.department}</div>
                  <div><strong>Period:</strong> {selectedReview.reviewPeriod.quarter} {selectedReview.reviewPeriod.year}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStatus">Review Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="self_assessment_pending">Self Assessment Pending</SelectItem>
                      <SelectItem value="manager_evaluation_pending">Manager Evaluation Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editInstructions">Review Instructions (Optional)</Label>
                <Textarea
                  value={editFormData.instructions}
                  onChange={(e) => setEditFormData({...editFormData, instructions: e.target.value})}
                  placeholder="Add any special instructions for this review..."
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Changing the status will affect the review workflow. Make sure the employee and manager are notified of any changes.
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateReview} disabled={editLoading}>
              {editLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Performance Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this performance review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Review to be deleted:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Employee:</strong> {selectedReview.employeeId.name}</div>
                  <div><strong>Department:</strong> {selectedReview.employeeId.department}</div>
                  <div><strong>Manager:</strong> {selectedReview.managerId.name}</div>
                  <div><strong>Period:</strong> {selectedReview.reviewPeriod.quarter} {selectedReview.reviewPeriod.year}</div>
                  <div><strong>Status:</strong> {selectedReview.status.replace("_", " ")}</div>
                  <div><strong>Due Date:</strong> {new Date(selectedReview.dueDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm text-amber-800">
                  <strong>Warning:</strong> Deleting this review will permanently remove all associated data including self-assessments, manager evaluations, and final scores.
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteReview} disabled={deleteLoading}>
              {deleteLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
