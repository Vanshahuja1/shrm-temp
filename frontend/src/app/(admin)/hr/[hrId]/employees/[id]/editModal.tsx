"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import {
  Save,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Camera,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  Award,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axiosInstance from "@/lib/axiosInstance"

interface EmployeeDetails {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  role: "employee" | "manager" | "hr" | "admin" | "intern"
  currentAddress: string
  dateOfBirth: { $date: string } | string
  performance: number
  joiningDate: { $date: string } | string
  currentProjects: string[]
  pastProjects: string[]
  attendanceCount30Days: number
  taskCountPerDay: number
  tasks: string[]
  responses: string[]
  managers: string[]
  photo: string
  upperManager: string
  salary: number
  adharCard: string
  panCard: string
  experience: number
  projects: string[]
  organizationName: string
  departmentName: string
  designation: string
  isActive: boolean
  organizationId: { $oid: string }
  departmentId: { $oid: string }
  documents: {
    aadharFront?: string
    aadharBack?: string
    panCard?: string
    resume?: string
    experienceLetter?: string
    passbookPhoto?: string
    tenthMarksheet?: string
    twelfthMarksheet?: string
    degreeMarksheet?: string
    policy?: string
  }
  bankDetails: {
    accountHolder: string
    accountNumber: string
    ifsc: string
    branch: string
    accountType: "CURRENT" | "SAVING"
  }
  workLog: {
    hoursWorked: number
  }
  passwordChangedAt: { $date: string }
  createdAt: { $date: string }
  updatedAt: { $date: string }
  lastLogin?: { $date: string }
  managerName?: string
}

interface EditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employeeData: EmployeeDetails
  onSave: () => void
}

interface ValidationErrors {
  [key: string]: string
}

interface FormData {
  name?: string
  email?: string
  phone?: string
  role?: string
  currentAddress?: string
  dateOfBirth?: { $date: string } | string
  salary?: number
  adharCard?: string
  panCard?: string
  experience?: number
  designation?: string
  performance?: number
  taskCountPerDay?: number
  attendanceCount30Days?: number
  isActive?: boolean
  photo?: string
  documents?: {
    aadharFront?: string
    aadharBack?: string
    panCard?: string
    resume?: string
    experienceLetter?: string
    passbookPhoto?: string
    tenthMarksheet?: string
    twelfthMarksheet?: string
    degreeMarksheet?: string
    policy?: string
  }
  bankDetails?: {
    accountHolder: string
    accountNumber: string
    ifsc: string
    branch: string
    accountType: string
  }
}

interface NotificationState {
  show: boolean
  type: 'success' | 'error' | 'info'
  message: string
}

export default function EditEmployeeModal({ isOpen, onClose, employeeData, onSave }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<FormData>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [documentPreviews, setDocumentPreviews] = useState<{ [key: string]: string }>({})
  const [photoUploading, setPhotoUploading] = useState(false)
  const [notification, setNotification] = useState<NotificationState>({ show: false, type: 'info', message: '' })
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const documentTypes = useMemo(() => ({
    aadharFront: { label: "Aadhar Card (Front)", icon: FileText, required: true },
    aadharBack: { label: "Aadhar Card (Back)", icon: FileText, required: true },
    panCard: { label: "PAN Card", icon: FileText, required: true },
    resume: { label: "Resume/CV", icon: FileText, required: false },
    experienceLetter: { label: "Experience Letter", icon: FileText, required: false },
    passbookPhoto: { label: "Bank Passbook", icon: FileText, required: false },
    tenthMarksheet: { label: "10th Marksheet", icon: FileText, required: false },
    twelfthMarksheet: { label: "12th Marksheet", icon: FileText, required: false },
    degreeMarksheet: { label: "Degree Certificate", icon: FileText, required: false },
    policy: { label: "Policy Document", icon: FileText, required: false },
  }), [])

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: 'info', message: '' })
    }, 2000)
  }

  useEffect(() => {
    if (employeeData) {
      setFormData({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        role: employeeData.role,
        currentAddress: employeeData.currentAddress,
        dateOfBirth:
          typeof employeeData.dateOfBirth === "string" ? employeeData.dateOfBirth : employeeData.dateOfBirth?.$date,
        salary: employeeData.salary,
        adharCard: employeeData.adharCard,
        panCard: employeeData.panCard,
        experience: employeeData.experience,
        designation: employeeData.designation,
        performance: employeeData.performance,
        taskCountPerDay: employeeData.taskCountPerDay,
        attendanceCount30Days: employeeData.attendanceCount30Days,
        isActive: employeeData.isActive,
        photo: employeeData.photo,
        documents: employeeData.documents || {},
        bankDetails: {
          accountHolder: employeeData.bankDetails?.accountHolder || "",
          accountNumber: employeeData.bankDetails?.accountNumber || "",
          ifsc: employeeData.bankDetails?.ifsc || "",
          branch: employeeData.bankDetails?.branch || "",
          accountType: employeeData.bankDetails?.accountType || "SAVING",
        },
      })
      setDocumentPreviews(employeeData.documents || {})
      // Clear any existing errors when modal opens with new employee data, but then validate
      setErrors({})
    }
  }, [employeeData])

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.name?.trim()) newErrors.name = "Name is required"
    if (!formData.email?.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Invalid phone number"
    if (!formData.role) newErrors.role = "Role is required"
    if (formData.adharCard && !/^\d{12}$/.test(formData.adharCard.replace(/\D/g, ""))) {
      newErrors.adharCard = "Aadhar number must be 12 digits"
    }
    if (formData.panCard && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard)) {
      newErrors.panCard = "Invalid PAN format"
    }

    // Bank details validation
    if (formData.bankDetails?.accountNumber && !/^\d{9,18}$/.test(formData.bankDetails.accountNumber.replace(/\D/g, ""))) {
      newErrors.accountNumber = "Account number must be 9-18 digits"
    }
    if (formData.bankDetails?.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifsc)) {
      newErrors.ifsc = "Invalid IFSC code format"
    }

    // Document validation - check required documents
    Object.entries(documentTypes).forEach(([docType, config]) => {
      if (config.required && !formData.documents?.[docType as keyof typeof formData.documents]) {
        newErrors[docType] = `${config.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, documentTypes])

  // Run validation when modal is opened to show initial errors
  useEffect(() => {
    if (isOpen && formData.name) { // Only run if formData is loaded
      validateForm()
    }
  }, [isOpen, formData, validateForm])

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBankDetailsChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        accountHolder: prev.bankDetails?.accountHolder || "",
        accountNumber: prev.bankDetails?.accountNumber || "",
        ifsc: prev.bankDetails?.ifsc || "",
        branch: prev.bankDetails?.branch || "",
        accountType: prev.bankDetails?.accountType || "SAVING",
        [field]: value,
      },
    }))
    // Clear error when user starts typing in bank details fields
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file) return

    // Validate file size (5MB for images)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showNotification('error', 'Image size too large. Maximum size is 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Invalid file type. Please upload JPG or PNG images only.')
      return
    }

    try {
      setPhotoUploading(true)
      
      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      // Upload file to server
      const response = await axiosInstance.post("/upload/single", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        const fileUrl = response.data.data.url

        setFormData((prev) => ({
          ...prev,
          photo: fileUrl,
        }))
        
        showNotification('success', 'Profile photo updated successfully!')
      } else {
        throw new Error(response.data.message || "Photo upload failed")
      }
    } catch (error) {
      console.error("Photo upload failed:", error)
      showNotification('error', `Photo upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleFileUpload = async (docType: string, file: File) => {
    if (!file) return

    // Validate file size (5MB for images, 10MB for PDFs)
    const maxSize = file.type.includes('image') ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      showNotification('error', `File size too large. Maximum size is ${file.type.includes('image') ? '5MB' : '10MB'}`)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Invalid file type. Please upload JPG, PNG, or PDF files only.')
      return
    }

    try {
      setUploadProgress((prev) => ({ ...prev, [docType]: 0 }))

      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[docType] || 0
          if (currentProgress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [docType]: currentProgress + 10 }
        })
      }, 200)

      // Upload file to server
      const response = await axiosInstance.post("/upload/single", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress((prev) => ({ ...prev, [docType]: percentCompleted }))
          }
        },
      })

      clearInterval(progressInterval)

      if (response.data.success) {
        const fileUrl = response.data.data.url

        setFormData((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: fileUrl,
          },
        }))

        setDocumentPreviews((prev) => ({
          ...prev,
          [docType]: fileUrl,
        }))

        setUploadProgress((prev) => ({ ...prev, [docType]: 100 }))

        // Clear document error when successfully uploaded
        if (errors[docType]) {
          setErrors((prev) => ({ ...prev, [docType]: "" }))
        }

        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[docType]
            return newProgress
          })
        }, 1000)
        
        showNotification('success', `${documentTypes[docType as keyof typeof documentTypes]?.label || 'Document'} uploaded successfully!`)
      } else {
        throw new Error(response.data.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      showNotification('error', `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[docType]
        return newProgress
      })
    }
  }

  const handleDocumentDelete = (docType: string) => {
    if (window.confirm(`Are you sure you want to delete this ${documentTypes[docType as keyof typeof documentTypes]?.label || 'document'}?`)) {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: undefined,
        },
      }))
      setDocumentPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[docType]
        return newPreviews
      })
      
      // Add error back if this is a required document
      const docConfig = documentTypes[docType as keyof typeof documentTypes]
      if (docConfig?.required) {
        setErrors((prev) => ({ ...prev, [docType]: `${docConfig.label} is required` }))
      }
      
      showNotification('success', 'Document deleted successfully!')
    }
  }

  const formatDateForInput = (dateInput?: { $date: string } | string) => {
    if (!dateInput) return ""
    const dateStr = typeof dateInput === "string" ? dateInput : dateInput.$date
    return new Date(dateStr).toISOString().split("T")[0]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const updateData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth as string).toISOString() : undefined,
        // Ensure documents are properly structured
        documents: formData.documents || {},
        // Ensure salary and numeric fields are properly typed
        salary: Number(formData.salary) || 0,
        experience: Number(formData.experience) || 0,
        performance: Number(formData.performance) || 0,
        taskCountPerDay: Number(formData.taskCountPerDay) || 0,
        attendanceCount30Days: Number(formData.attendanceCount30Days) || 0,
      }

      console.log('Sending update data:', updateData) // Debug log

      // Update employee data via API
      const response = await axiosInstance.put(`/user/${employeeData.id}`, updateData)
      
      if (response.data.success) {
        showNotification('success', 'Employee details updated successfully!')
        onSave()
        // Close modal after successful update
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        throw new Error(response.data.message || "Update failed")
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      showNotification('error', `Failed to update employee details: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[65vw] max-h-[95vh] overflow-hidden p-0 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {formData.photo ? (
                    <Image
                      src={formData.photo}
                      alt={formData.name || "Employee"}
                      width={60}
                      height={60}
                      className="w-15 h-15 rounded-full object-cover border-3 border-white/20"
                      style={{ width: '60px', height: '60px' }}
                    />
                  ) : (
                    <div className="w-15 h-15 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold border-3 border-white/20"
                         style={{ width: '60px', height: '60px' }}>
                      {getInitials(formData.name || "NA")}
                    </div>
                  )}
                  <button 
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={photoUploading}
                    onClick={() => {
                      if (photoUploading) return
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handlePhotoUpload(file)
                      }
                      input.click()
                    }}
                  >
                    {photoUploading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-red-500"></div>
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">Edit Employee Profile</DialogTitle>
                  <DialogDescription className="text-red-100 mt-1">
                    {formData.name} • {formData.role} • ID: {employeeData.id}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
            {/* Enhanced Tab Navigation */}
            <div className="border-b bg-gray-50/50 px-6 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
                <TabsTrigger
                  value="personal"
                  className="flex flex-col items-center space-y-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-red-500"
                >
                  <User size={20} className="text-gray-600" />
                  <span className="text-sm font-medium">Personal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="flex flex-col items-center space-y-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-red-500"
                >
                  <Briefcase size={20} className="text-gray-600" />
                  <span className="text-sm font-medium">Professional</span>
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="flex flex-col items-center space-y-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-red-500"
                >
                  <CreditCard size={20} className="text-gray-600" />
                  <span className="text-sm font-medium">Financial</span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex flex-col items-center space-y-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-red-500"
                >
                  <TrendingUp size={20} className="text-gray-600" />
                  <span className="text-sm font-medium">Performance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex flex-col items-center space-y-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-red-500"
                >
                  <FileText size={20} className="text-gray-600" />
                  <span className="text-sm font-medium">Documents</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-[50rem]">
              <div className="p-6">
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <User size={20} className="text-blue-600" />
                          <span>Basic Information</span>
                        </CardTitle>
                        <CardDescription>Personal details and identification</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center space-x-1">
                              <span>Full Name</span>
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name || ""}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              placeholder="Enter full name"
                              className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>Date of Birth</span>
                            </Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formatDateForInput(formData.dateOfBirth)}
                              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentAddress" className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>Current Address</span>
                          </Label>
                          <Textarea
                            id="currentAddress"
                            value={formData.currentAddress || ""}
                            onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                            placeholder="Enter current address"
                            rows={3}
                            className="bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Phone size={20} className="text-green-600" />
                          <span>Contact Information</span>
                        </CardTitle>
                        <CardDescription>Communication details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>Email Address</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="Enter email address"
                            className={errors.email ? "border-red-500 bg-white" : "bg-white"}
                          />
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>Phone Number</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="Enter phone number"
                            className={errors.phone ? "border-red-500 bg-white" : "bg-white"}
                          />
                          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <FileText size={20} className="text-purple-600" />
                        <span>Identity Documents</span>
                      </CardTitle>
                      <CardDescription>Government issued identification numbers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adharCard">Aadhar Card Number</Label>
                          <Input
                            id="adharCard"
                            value={formData.adharCard || ""}
                            onChange={(e) => handleInputChange("adharCard", e.target.value)}
                            placeholder="Enter Aadhar number"
                            maxLength={12}
                            className={errors.adharCard ? "border-red-500 bg-white" : "bg-white"}
                          />
                          {errors.adharCard && <p className="text-sm text-red-500">{errors.adharCard}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="panCard">PAN Card Number</Label>
                          <Input
                            id="panCard"
                            value={formData.panCard || ""}
                            onChange={(e) => handleInputChange("panCard", e.target.value.toUpperCase())}
                            placeholder="Enter PAN number"
                            maxLength={10}
                            className={errors.panCard ? "border-red-500 bg-white" : "bg-white"}
                          />
                          {errors.panCard && <p className="text-sm text-red-500">{errors.panCard}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-red-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Briefcase size={20} className="text-orange-600" />
                          <span>Job Information</span>
                        </CardTitle>
                        <CardDescription>Role and position details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center space-x-1">
                              <span>Role</span>
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.role || ""}
                              onValueChange={(value) => handleInputChange("role", value)}
                            >
                              <SelectTrigger className={errors.role ? "border-red-500 bg-white" : "bg-white"}>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="intern">Intern</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                              id="designation"
                              value={formData.designation || ""}
                              onChange={(e) => handleInputChange("designation", e.target.value)}
                              placeholder="Enter designation"
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="experience">Experience (Years)</Label>
                            <Input
                              id="experience"
                              type="number"
                              min="0"
                              max="50"
                              value={formData.experience || ""}
                              onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || 0)}
                              placeholder="Years of experience"
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="isActive">Employment Status</Label>
                            <Select
                              value={formData.isActive ? "active" : "inactive"}
                              onValueChange={(value) => handleInputChange("isActive", value === "active")}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Active</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Inactive</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-teal-50 to-cyan-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Building size={20} className="text-teal-600" />
                          <span>Organization Details</span>
                        </CardTitle>
                        <CardDescription>Department and organizational information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Department</p>
                              <p className="font-medium">{employeeData.departmentName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Organization</p>
                              <p className="font-medium">{employeeData.organizationName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Employee ID</p>
                              <p className="font-mono font-medium">{employeeData.id}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Manager</p>
                              <p className="font-medium">{employeeData.managerName || "Not assigned"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Financial Information Tab */}
                <TabsContent value="financial" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <CreditCard size={20} className="text-green-600" />
                          <span>Salary Information</span>
                        </CardTitle>
                        <CardDescription>Compensation details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="salary">Monthly Salary (₹)</Label>
                          <Input
                            id="salary"
                            type="number"
                            min="0"
                            value={formData.salary || ""}
                            onChange={(e) => handleInputChange("salary", parseInt(e.target.value) || 0)}
                            placeholder="Enter monthly salary"
                            className="bg-white text-lg font-semibold"
                          />
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Annual Salary</p>
                              <p className="font-bold text-lg text-green-600">
                                ₹{((formData.salary || 0) * 12).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Monthly CTC</p>
                              <p className="font-bold text-lg">₹{(formData.salary || 0).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Building size={20} className="text-blue-600" />
                          <span>Bank Details</span>
                        </CardTitle>
                        <CardDescription>Banking information for salary payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <Input
                              id="accountHolder"
                              value={formData.bankDetails?.accountHolder || ""}
                              onChange={(e) => handleBankDetailsChange("accountHolder", e.target.value)}
                              placeholder="Enter account holder name"
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountType">Account Type</Label>
                            <Select
                              value={formData.bankDetails?.accountType || "SAVING"}
                              onValueChange={(value) => handleBankDetailsChange("accountType", value)}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SAVING">Savings Account</SelectItem>
                                <SelectItem value="CURRENT">Current Account</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input
                              id="accountNumber"
                              value={formData.bankDetails?.accountNumber || ""}
                              onChange={(e) => handleBankDetailsChange("accountNumber", e.target.value)}
                              placeholder="Enter account number"
                              className={errors.accountNumber ? "border-red-500 bg-white font-mono" : "bg-white font-mono"}
                            />
                            {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ifsc">IFSC Code</Label>
                            <Input
                              id="ifsc"
                              value={formData.bankDetails?.ifsc || ""}
                              onChange={(e) => handleBankDetailsChange("ifsc", e.target.value.toUpperCase())}
                              placeholder="Enter IFSC code"
                              className={errors.ifsc ? "border-red-500 bg-white font-mono" : "bg-white font-mono"}
                            />
                            {errors.ifsc && <p className="text-sm text-red-500">{errors.ifsc}</p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="branch">Branch Name</Label>
                          <Input
                            id="branch"
                            value={formData.bankDetails?.branch || ""}
                            onChange={(e) => handleBankDetailsChange("branch", e.target.value)}
                            placeholder="Enter branch name"
                            className="bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Award size={20} className="text-purple-600" />
                          <span>Performance Score</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="performance">Performance (%)</Label>
                          <Input
                            id="performance"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.performance || ""}
                            onChange={(e) => handleInputChange("performance", parseInt(e.target.value) || 0)}
                            placeholder="0-100"
                            className="bg-white text-lg font-semibold"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Score</span>
                            <span className="font-medium">{formData.performance || 0}%</span>
                          </div>
                          <Progress value={formData.performance || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <TrendingUp size={20} className="text-blue-600" />
                          <span>Productivity</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="taskCountPerDay">Tasks Per Day</Label>
                          <Input
                            id="taskCountPerDay"
                            type="number"
                            min="0"
                            value={formData.taskCountPerDay || ""}
                            onChange={(e) => handleInputChange("taskCountPerDay", parseInt(e.target.value) || 0)}
                            placeholder="Average tasks"
                            className="bg-white text-lg font-semibold"
                          />
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{formData.taskCountPerDay || 0}</div>
                            <div className="text-sm text-gray-600">Daily Average</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Calendar size={20} className="text-green-600" />
                          <span>Attendance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="attendanceCount30Days">Attendance (30 days) %</Label>
                          <Input
                            id="attendanceCount30Days"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.attendanceCount30Days || ""}
                            onChange={(e) =>
                              handleInputChange("attendanceCount30Days", parseInt(e.target.value) || 0)
                            }
                            placeholder="Attendance %"
                            className="bg-white text-lg font-semibold"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Attendance Rate</span>
                            <span className="font-medium">{formData.attendanceCount30Days || 0}%</span>
                          </div>
                          <Progress value={formData.attendanceCount30Days || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6 mt-0">
                  <Alert className="border-amber-200 bg-amber-50">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Document Management:</strong> Upload, view, and manage employee documents. Required
                      documents are marked with a red asterisk (*).
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(documentTypes).map(([docType, config]) => {
                      const Icon = config.icon
                      const hasDocument = documentPreviews[docType]
                      const isUploading = uploadProgress[docType] !== undefined

                      return (
                        <Card key={docType} className="shadow-sm border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Icon size={16} className="text-gray-600" />
                                <span>{config.label}</span>
                                {config.required && <span className="text-red-500">*</span>}
                              </div>
                              {hasDocument && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle size={12} className="mr-1" />
                                  Uploaded
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {hasDocument ? (
                              <div className="space-y-3">
                                <div className="aspect-video bg-white rounded-lg overflow-hidden border">
                                  {documentPreviews[docType].toLowerCase().includes('.pdf') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                      <FileText size={48} className="mb-2" />
                                      <span className="text-sm font-medium">PDF Document</span>
                                    </div>
                                  ) : (
                                    <Image
                                      src={documentPreviews[docType]}
                                      alt={config.label}
                                      className="w-full h-full object-cover"
                                      fill={false}
                                      width={400}
                                      height={225}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      unoptimized
                                    />
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(documentPreviews[docType], "_blank")}
                                    className="flex-1"
                                  >
                                    <Eye size={14} className="mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement("a")
                                      link.href = documentPreviews[docType]
                                      link.download = `${formData.name}_${config.label}`
                                      link.click()
                                    }}
                                    className="flex-1"
                                  >
                                    <Download size={14} className="mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDocumentDelete(docType)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
                                  <Upload size={24} className="mb-2" />
                                  <p className="text-sm text-center">No document uploaded</p>
                                </div>
                                <div>
                                  <input
                                    ref={(el) => { fileInputRefs.current[docType] = el }}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleFileUpload(docType, file)
                                    }}
                                    className="hidden"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => fileInputRefs.current[docType]?.click()}
                                    disabled={isUploading}
                                    className="w-full"
                                    variant="outline"
                                  >
                                    {isUploading ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                        <span>Uploading...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <Upload size={14} />
                                        <span>Upload Document</span>
                                      </div>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            {isUploading && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress[docType]}%</span>
                                </div>
                                <Progress value={uploadProgress[docType]} className="h-2" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Document Summary */}
                  <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <FileText size={20} className="text-blue-600" />
                        <span>Document Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {Object.values(documentPreviews).filter(Boolean).length}
                          </div>
                          <div className="text-sm text-gray-600">Uploaded</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {
                              Object.entries(documentTypes).filter(
                                ([key, config]) => config.required && !documentPreviews[key],
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Required Missing</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{Object.keys(documentTypes).length}</div>
                          <div className="text-sm text-gray-600">Total Types</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(
                              (Object.values(documentPreviews).filter(Boolean).length /
                                Object.keys(documentTypes).length) *
                                100,
                            )}
                            %
                          </div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Sticky Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex-shrink-0">
          <DialogFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{Object.keys(errors).length} error(s) found</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={loading} className="px-6 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || Object.keys(errors).length > 0}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save size={16} />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle size={16} />}
              {notification.type === 'error' && <AlertCircle size={16} />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}