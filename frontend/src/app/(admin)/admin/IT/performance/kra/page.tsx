"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Target,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react"
import { toast } from "react-hot-toast"

interface KRA {
  _id: string
  employeeId: {
    id: string
    name: string
    email: string
    department: string
    role: string
  }
  kraTitle: string
  description: string
  targetValue: number
  achievedValue: number
  weightage: number
  evaluationPeriod: {
    year: number
    quarter: string
  }
  status: "not_started" | "in_progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high" | "critical"
  dueDate: string
  achievementPercentage: number
  createdAt: string
  updatedAt: string
}

interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: string
}

export default function KRAManagement() {
  const [kraList, setKraList] = useState<KRA[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedKRA, setSelectedKRA] = useState<KRA | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    kraTitle: "",
    description: "",
    targetValue: 0,
    weightage: 0,
    priority: "medium",
    year: new Date().getFullYear(),
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    dueDate: ""
  })

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    employeeId: "",
    kraTitle: "",
    description: "",
    targetValue: 0,
    achievedValue: 0,
    weightage: 0,
    priority: "medium",
    year: new Date().getFullYear(),
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    dueDate: "",
    status: "not_started"
  })

  const fetchKRAs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using mock data since API is not working
      console.log("Using mock data for KRAs")
      
      const mockKRAs: KRA[] = [
        {
          _id: "kra1",
          employeeId: {
            id: "EMP001",
            name: "Alice Johnson",
            email: "alice.johnson@company.com",
            department: "Engineering",
            role: "Senior Developer"
          },
          kraTitle: "Develop New Feature Module",
          description: "Design and implement the user authentication module with advanced security features",
          targetValue: 100,
          achievedValue: 85,
          weightage: 30,
          evaluationPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "in_progress",
          priority: "high",
          dueDate: "2024-03-31",
          achievementPercentage: 85,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-02-20T14:45:00Z"
        },
        {
          _id: "kra2",
          employeeId: {
            id: "EMP002",
            name: "Bob Smith",
            email: "bob.smith@company.com",
            department: "Sales",
            role: "Sales Manager"
          },
          kraTitle: "Achieve Quarterly Sales Target",
          description: "Meet or exceed the quarterly sales target of $500K with new client acquisitions",
          targetValue: 500000,
          achievedValue: 520000,
          weightage: 40,
          evaluationPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "completed",
          priority: "critical",
          dueDate: "2024-03-31",
          achievementPercentage: 104,
          createdAt: "2024-01-10T09:15:00Z",
          updatedAt: "2024-03-25T16:20:00Z"
        },
        {
          _id: "kra3",
          employeeId: {
            id: "EMP003",
            name: "Carol Davis",
            email: "carol.davis@company.com",
            department: "Marketing",
            role: "Marketing Specialist"
          },
          kraTitle: "Launch Digital Marketing Campaign",
          description: "Plan and execute a comprehensive digital marketing campaign for the new product line",
          targetValue: 10,
          achievedValue: 6,
          weightage: 25,
          evaluationPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "in_progress",
          priority: "medium",
          dueDate: "2024-04-15",
          achievementPercentage: 60,
          createdAt: "2024-01-08T08:45:00Z",
          updatedAt: "2024-02-15T11:30:00Z"
        },
        {
          _id: "kra4",
          employeeId: {
            id: "EMP004",
            name: "David Wilson",
            email: "david.wilson@company.com",
            department: "HR",
            role: "HR Coordinator"
          },
          kraTitle: "Implement Employee Wellness Program",
          description: "Design and launch a comprehensive employee wellness program to improve workplace satisfaction",
          targetValue: 100,
          achievedValue: 45,
          weightage: 20,
          evaluationPeriod: {
            year: 2024,
            quarter: "Q1"
          },
          status: "overdue",
          priority: "medium",
          dueDate: "2024-02-28",
          achievementPercentage: 45,
          createdAt: "2024-01-12T12:00:00Z",
          updatedAt: "2024-03-01T09:15:00Z"
        },
        {
          _id: "kra5",
          employeeId: {
            id: "EMP005",
            name: "Eva Brown",
            email: "eva.brown@company.com",
            department: "Finance",
            role: "Financial Analyst"
          },
          kraTitle: "Optimize Budget Allocation Process",
          description: "Streamline the budget allocation process and reduce processing time by 25%",
          targetValue: 25,
          achievedValue: 0,
          weightage: 15,
          evaluationPeriod: {
            year: 2024,
            quarter: "Q2"
          },
          status: "not_started",
          priority: "low",
          dueDate: "2024-06-30",
          achievementPercentage: 0,
          createdAt: "2024-02-01T14:30:00Z",
          updatedAt: "2024-02-01T14:30:00Z"
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setKraList(mockKRAs)
      toast.success("KRAs loaded successfully!")
      
    } catch (error: unknown) {
      console.error("Failed to fetch KRAs:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch KRAs"
      setError(errorMessage)
      toast.error("Failed to load KRAs")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    try {
      // Using mock data since API is not working
      console.log("Using mock data for employees")
      
      const mockEmployees: Employee[] = [
        {
          id: "EMP001",
          name: "Alice Johnson",
          email: "alice.johnson@company.com",
          department: "Engineering",
          role: "Senior Developer"
        },
        {
          id: "EMP002",
          name: "Bob Smith",
          email: "bob.smith@company.com",
          department: "Sales",
          role: "Sales Manager"
        },
        {
          id: "EMP003",
          name: "Carol Davis",
          email: "carol.davis@company.com",
          department: "Marketing",
          role: "Marketing Specialist"
        },
        {
          id: "EMP004",
          name: "David Wilson",
          email: "david.wilson@company.com",
          department: "HR",
          role: "HR Coordinator"
        },
        {
          id: "EMP005",
          name: "Eva Brown",
          email: "eva.brown@company.com",
          department: "Finance",
          role: "Financial Analyst"
        },
        {
          id: "EMP006",
          name: "Frank Miller",
          email: "frank.miller@company.com",
          department: "IT",
          role: "System Administrator"
        },
        {
          id: "EMP007",
          name: "Grace Lee",
          email: "grace.lee@company.com",
          department: "Operations",
          role: "Operations Manager"
        }
      ]
      
      setEmployees(mockEmployees)
      
    } catch (error: unknown) {
      console.error("Failed to fetch employees:", error)
      toast.error("Failed to load employees")
    }
  }, [])

  useEffect(() => {
    fetchKRAs()
    fetchEmployees()
  }, [fetchKRAs, fetchEmployees])

  const handleCreateKRA = async () => {
    try {
      setCreateLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const selectedEmployee = employees.find(emp => emp.id === formData.employeeId)
      
      if (!selectedEmployee) {
        toast.error("Please select a valid employee")
        return
      }

      const newKRA: KRA = {
        _id: `kra_${Date.now()}`,
        employeeId: selectedEmployee,
        kraTitle: formData.kraTitle,
        description: formData.description,
        targetValue: formData.targetValue,
        achievedValue: 0,
        weightage: formData.weightage,
        evaluationPeriod: {
          year: formData.year,
          quarter: formData.quarter
        },
        status: "not_started",
        priority: formData.priority as "low" | "medium" | "high" | "critical",
        dueDate: formData.dueDate,
        achievementPercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to the current KRA list
      setKraList(prev => [newKRA, ...prev])
      
      toast.success("KRA created successfully!")
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error: unknown) {
      console.error("Failed to create KRA:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create KRA"
      toast.error(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      kraTitle: "",
      description: "",
      targetValue: 0,
      weightage: 0,
      priority: "medium",
      year: new Date().getFullYear(),
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      dueDate: ""
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      employeeId: "",
      kraTitle: "",
      description: "",
      targetValue: 0,
      achievedValue: 0,
      weightage: 0,
      priority: "medium",
      year: new Date().getFullYear(),
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      dueDate: "",
      status: "not_started"
    })
  }

  const handleEditKRA = (kra: KRA) => {
    setSelectedKRA(kra)
    setEditFormData({
      employeeId: kra.employeeId.id,
      kraTitle: kra.kraTitle,
      description: kra.description,
      targetValue: kra.targetValue,
      achievedValue: kra.achievedValue,
      weightage: kra.weightage,
      priority: kra.priority,
      year: kra.evaluationPeriod.year,
      quarter: kra.evaluationPeriod.quarter,
      dueDate: kra.dueDate,
      status: kra.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateKRA = async () => {
    try {
      setEditLoading(true)
      
      if (!selectedKRA) return
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const selectedEmployee = employees.find(emp => emp.id === editFormData.employeeId)
      
      if (!selectedEmployee) {
        toast.error("Please select a valid employee")
        return
      }

      const updatedKRA: KRA = {
        ...selectedKRA,
        employeeId: selectedEmployee,
        kraTitle: editFormData.kraTitle,
        description: editFormData.description,
        targetValue: editFormData.targetValue,
        achievedValue: editFormData.achievedValue,
        weightage: editFormData.weightage,
        evaluationPeriod: {
          year: editFormData.year,
          quarter: editFormData.quarter
        },
        status: editFormData.status as "not_started" | "in_progress" | "completed" | "overdue",
        priority: editFormData.priority as "low" | "medium" | "high" | "critical",
        dueDate: editFormData.dueDate,
        achievementPercentage: editFormData.targetValue > 0 ? Math.round((editFormData.achievedValue / editFormData.targetValue) * 100) : 0,
        updatedAt: new Date().toISOString()
      }

      // Update the KRA in the list
      setKraList(prev => prev.map(kra => kra._id === selectedKRA._id ? updatedKRA : kra))
      
      toast.success("KRA updated successfully!")
      setIsEditDialogOpen(false)
      setSelectedKRA(null)
      resetEditForm()
    } catch (error: unknown) {
      console.error("Failed to update KRA:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update KRA"
      toast.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteKRA = (kra: KRA) => {
    setSelectedKRA(kra)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteKRA = async () => {
    try {
      setDeleteLoading(true)
      
      if (!selectedKRA) return
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Remove the KRA from the list
      setKraList(prev => prev.filter(kra => kra._id !== selectedKRA._id))
      
      toast.success("KRA deleted successfully!")
      setIsDeleteDialogOpen(false)
      setSelectedKRA(null)
    } catch (error: unknown) {
      console.error("Failed to delete KRA:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete KRA"
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Target className="h-4 w-4 text-blue-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredKRAs = kraList.filter(kra => {
    const matchesSearch = kra.kraTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kra.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || kra.status === statusFilter
    const matchesPriority = priorityFilter === "all" || kra.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

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
          <Button onClick={() => fetchKRAs()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Key Responsibility Areas (KRA)</h1>
          <p className="text-gray-600 mt-1">Manage employee goals and responsibilities</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create KRA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New KRA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select value={formData.quarter} onValueChange={(value) => setFormData({...formData, quarter: value})}>
                    <SelectTrigger>
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
              </div>

              <div>
                <Label htmlFor="kraTitle">KRA Title</Label>
                <Input
                  value={formData.kraTitle}
                  onChange={(e) => setFormData({...formData, kraTitle: e.target.value})}
                  placeholder="Enter KRA title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weightage">Weightage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weightage}
                    onChange={(e) => setFormData({...formData, weightage: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={createLoading}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKRA} disabled={createLoading}>
                  {createLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create KRA"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search KRAs or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KRA Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KRAs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kraList.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kraList.filter(kra => kra.status === "completed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kraList.filter(kra => kra.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kraList.filter(kra => kra.status === "overdue").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KRA Table */}
      <Card>
        <CardHeader>
          <CardTitle>KRA List ({filteredKRAs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KRA Title</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKRAs.map((kra) => (
                <TableRow key={kra._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{kra.kraTitle}</div>
                      <div className="text-sm text-gray-600">Weight: {kra.weightage}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{kra.employeeId.name}</div>
                      <div className="text-sm text-gray-600">{kra.employeeId.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{kra.achievedValue} / {kra.targetValue}</span>
                        <span>{kra.achievementPercentage}%</span>
                      </div>
                      <Progress value={kra.achievementPercentage} className="w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(kra.priority)}>
                      {kra.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(kra.status)}
                      <Badge variant="outline" className={getStatusColor(kra.status)}>
                        {kra.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(kra.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedKRA(kra)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditKRA(kra)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteKRA(kra)}
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

      {/* View KRA Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>KRA Details</DialogTitle>
          </DialogHeader>
          {selectedKRA && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Employee:</span>
                    <div className="font-medium">{selectedKRA.employeeId.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Department:</span>
                    <div className="font-medium">{selectedKRA.employeeId.department}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Period:</span>
                    <div className="font-medium">
                      {selectedKRA.evaluationPeriod.quarter} {selectedKRA.evaluationPeriod.year}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <div className="font-medium">{new Date(selectedKRA.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">KRA Details</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Title:</span>
                    <div className="font-medium">{selectedKRA.kraTitle}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <div className="mt-1">{selectedKRA.description}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Progress & Achievement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Target Value:</span>
                      <span className="font-medium">{selectedKRA.targetValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achieved Value:</span>
                      <span className="font-medium">{selectedKRA.achievedValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievement:</span>
                      <span className="font-medium">{selectedKRA.achievementPercentage}%</span>
                    </div>
                    <Progress value={selectedKRA.achievementPercentage} className="mt-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status & Priority</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge variant="outline" className={getStatusColor(selectedKRA.status)}>
                        {selectedKRA.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Priority:</span>
                      <Badge variant="outline" className={getPriorityColor(selectedKRA.priority)}>
                        {selectedKRA.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Weightage:</span>
                      <span className="font-medium">{selectedKRA.weightage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit KRA Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit KRA</DialogTitle>
            <DialogDescription>
              Update the KRA details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editEmployee">Employee</Label>
                <Select value={editFormData.employeeId} onValueChange={(value) => setEditFormData({...editFormData, employeeId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editQuarter">Quarter</Label>
                <Select value={editFormData.quarter} onValueChange={(value) => setEditFormData({...editFormData, quarter: value})}>
                  <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="editKraTitle">KRA Title</Label>
              <Input
                value={editFormData.kraTitle}
                onChange={(e) => setEditFormData({...editFormData, kraTitle: e.target.value})}
                placeholder="Enter KRA title"
              />
            </div>

            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Enter detailed description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editTargetValue">Target Value</Label>
                <Input
                  type="number"
                  value={editFormData.targetValue}
                  onChange={(e) => setEditFormData({...editFormData, targetValue: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="editAchievedValue">Achieved Value</Label>
                <Input
                  type="number"
                  value={editFormData.achievedValue}
                  onChange={(e) => setEditFormData({...editFormData, achievedValue: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="editWeightage">Weightage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.weightage}
                  onChange={(e) => setEditFormData({...editFormData, weightage: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPriority">Priority</Label>
                <Select value={editFormData.priority} onValueChange={(value) => setEditFormData({...editFormData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editDueDate">Due Date</Label>
              <Input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Achievement Progress:</strong> {editFormData.targetValue > 0 ? Math.round((editFormData.achievedValue / editFormData.targetValue) * 100) : 0}%
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateKRA} disabled={editLoading}>
              {editLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update KRA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete KRA Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete KRA</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this KRA? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedKRA && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">KRA to be deleted:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {selectedKRA.kraTitle}</div>
                  <div><strong>Employee:</strong> {selectedKRA.employeeId.name}</div>
                  <div><strong>Department:</strong> {selectedKRA.employeeId.department}</div>
                  <div><strong>Priority:</strong> {selectedKRA.priority}</div>
                  <div><strong>Status:</strong> {selectedKRA.status.replace("_", " ")}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteKRA} disabled={deleteLoading}>
              {deleteLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete KRA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
