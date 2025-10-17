"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Briefcase,
  Building2,
  DollarSign,
  CreditCard,
  Calendar,
  Users,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Camera,
  Banknote,
  FileText,
  ImageIcon,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"
import axiosInstance from "@/lib/axiosInstance"
import Image from "next/image"

interface BankDetails {
  accountHolder: string
  accountNumber: string
  ifsc: string
  branch: string
  accountType: "SAVING" | "CURRENT"
}

interface DocumentFiles {
  aadharFront: string
  aadharBack: string
  panCard: string
  resume: string
  experienceLetter: string
  passbookPhoto: string
  tenthMarksheet: string
  twelfthMarksheet: string
  degreeMarksheet: string
  policy: string
}

interface Organization {
  _id: string
  name: string
  description?: string
}

interface Department {
  _id: string
  name: string
  organizationId: string
  head?: string
}

interface Manager {
  _id: string
  id: string
  name: string
  role: string
  departmentId?: string
  " departmentId"?: string // Handle the space issue
  organizationId: string
}

interface RegisterFormData {
  // Basic Information
  name: string
  email: string
  phone:string
  role: "admin" | "manager" | "employee" | "intern" | "hr"
  organizationId: string
  departmentId: string
  // Personal Information
  dateOfBirth: string
  currentAddress: string
  photo: string
  // Work Information
  joiningDate: string
  upperManager: string
  salary: string
  experience: string
  // Documents
  adharCard: string
  panCard: string
  // Bank Details
  bankDetails: BankDetails
  // Document Files
  documents: DocumentFiles
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone:"",
    role: "employee", // Set a default value instead of empty string
    organizationId: "",
    departmentId: "",
    dateOfBirth: "",
    currentAddress: "",
    photo: "",
    joiningDate: "",
    upperManager: "",
    salary: "",
    experience: "",
    adharCard: "",
    panCard: "",
    bankDetails: {
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      accountType: "SAVING",
    },
    documents: {
      aadharFront: "",
      aadharBack: "",
      panCard: "",
      resume: "",
      experienceLetter: "",
      passbookPhoto: "",
      tenthMarksheet: "",
      twelfthMarksheet: "",
      degreeMarksheet: "",
      policy: "",
    },
  })

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedCredentials, setGeneratedCredentials] = useState<{ id: string; password: string } | null>(null)
  const [focusedField, setFocusedField] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [loadingOrganizations, setLoadingOrganizations] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingManagers, setLoadingManagers] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations()
  }, [])

  // Fetch departments when organization is selected
  useEffect(() => {
    if (formData.organizationId) {
      fetchDepartmentsByOrganization(formData.organizationId)
    } else {
      setDepartments([])
      setFormData((prev) => ({ ...prev, departmentId: "", upperManager: "" }))
      setManagers([])
    }
  }, [formData.organizationId])

  // Fetch managers when both organization and department are selected
  useEffect(() => {
    if (formData.organizationId && formData.departmentId) {
      fetchManagersAndAdmins(formData.organizationId, formData.departmentId)
    } else {
      setManagers([])
      setFormData((prev) => ({ ...prev, upperManager: "" }))
    }
  }, [formData.organizationId, formData.departmentId])

  const fetchOrganizations = async () => {
    setLoadingOrganizations(true)
    try {
      const response = await axiosInstance.get("/organizations")
      if (response.data.success) {
        setOrganizations(response.data.data)
      } else {
        setError("Failed to fetch organizations")
      }
    } catch (error) {
      console.error("Error fetching organizations:", error)
      setError("Error loading organizations")
    } finally {
      setLoadingOrganizations(false)
    }
  }

  const fetchDepartmentsByOrganization = async (organizationId: string) => {
    setLoadingDepartments(true)
    setError("")

    try {
      const response = await axiosInstance.get(`/departments?organizationId=${organizationId}`)

      if (response.data.success) {
        setDepartments(response.data.data)

        if (response.data.data.length === 0) {
          setError("No departments found for the selected organization")
        }
      } else {
        setError("Failed to fetch departments")
        setDepartments([])
      }
    } catch (error: unknown) {
      console.error("Error fetching departments:", error)
      setError(`Error loading departments: ${(error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message}`)
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  // New function to fetch managers and admins
  const fetchManagersAndAdmins = async (organizationId: string, departmentId: string) => {
    setLoadingManagers(true)
    setError("")

    try {
      // Fetch all users from the same organization
      const response = await axiosInstance.get(`/user?organizationId=${organizationId}`)

      if (response.data.success) {
        const users = response.data.data

        // Filter only managers from the same department (excluding admins)
        const availableManagers = users.filter((user: Manager) => {
          // Handle potential leading space in departmentId field
          const userDeptId = user.departmentId || user[" departmentId"] || ""
          const isManager = user.role === "manager" && userDeptId === departmentId
          
          return isManager
        })

        setManagers(availableManagers)

        if (availableManagers.length === 0) {
          setError("No managers or admins found for this department/organization")
        }
      } else {
        setError("Failed to fetch managers")
        setManagers([])
      }
    } catch (error: unknown) {
      console.error("Error fetching managers:", error)
      setError(`Error loading managers: ${(error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message}`)
      setManagers([])
    } finally {
      setLoadingManagers(false)
    }
  }

  // Canvas animation code (keeping the same)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Enhanced particle system with red color scheme
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
    }))

    let animationId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.15 * (1 - distance / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        p.opacity += p.pulse
        if (p.opacity > 0.8 || p.opacity < 0.1) p.pulse *= -1
        ctx.fillStyle = `rgba(220, 38, 38, ${p.opacity * 0.6})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animationId = requestAnimationFrame(draw)
    }
    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (name.startsWith("bankDetails.")) {
      const field = name.split(".")[1] as keyof BankDetails
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value,
        },
      }))
    } else if (name.startsWith("documents.")) {
      const field = name.split(".")[1] as keyof DocumentFiles
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleFileUpload = async (file: File, documentType: keyof DocumentFiles | "photo") => {
    if (documentType === "photo") {
      setUploadingFiles((prev) => ({ ...prev, photo: true }))
    } else {
      setUploadingFiles((prev) => ({ ...prev, [documentType]: true }))
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await axiosInstance.post("/upload/single", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        const fileUrl = response.data.data.url

        if (documentType === "photo") {
          setFormData((prev) => ({
            ...prev,
            photo: fileUrl,
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            documents: {
              ...prev.documents,
              [documentType]: fileUrl,
            },
          }))
        }

        // Clear validation error for this field
        if (validationErrors[documentType]) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[documentType]
            return newErrors
          })
        }
      } else {
        throw new Error(response.data.message || "Upload failed")
      }
    } catch (error: unknown) {
      console.error("File upload error:", error)
      setError(`Error uploading ${documentType}: ${(error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message}`)
    } finally {
      if (documentType === "photo") {
        setUploadingFiles((prev) => ({ ...prev, photo: false }))
      } else {
        setUploadingFiles((prev) => ({ ...prev, [documentType]: false }))
      }
    }
  }

  // Validation functions for each step
  const validateStep1 = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    if (!formData.phone.trim()) errors.phone = "Phone number is required"
    if (!formData.role) errors.role = "Role is required"
    if (!formData.organizationId) errors.organizationId = "Organization is required"
    if (!formData.departmentId) errors.departmentId = "Department is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/
    if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors: Record<string, string> = {}

    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!formData.currentAddress.trim()) errors.currentAddress = "Current address is required"
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required"
    
    // Only validate upperManager for roles other than admin and manager
    if (!["admin", "manager"].includes(formData.role) && !formData.upperManager) {
      errors.upperManager = "Upper manager is required"
    }
    
    if (!formData.salary) errors.salary = "Salary is required"
    if (!formData.experience) errors.experience = "Experience is required"
    if (!formData.adharCard.trim()) errors.adharCard = "Aadhar card number is required"
    if (!formData.panCard.trim()) errors.panCard = "PAN card number is required"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = () => {
    const errors: Record<string, string> = {}

    if (!formData.bankDetails.accountHolder.trim())
      errors["bankDetails.accountHolder"] = "Account holder name is required"
    if (!formData.bankDetails.accountNumber.trim()) errors["bankDetails.accountNumber"] = "Account number is required"
    if (!formData.bankDetails.ifsc.trim()) errors["bankDetails.ifsc"] = "IFSC code is required"
    if (!formData.bankDetails.branch.trim()) errors["bankDetails.branch"] = "Branch name is required"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep4 = () => {
    // Documents are now optional, so no validation errors
    setValidationErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate current step before submission
    if (!validateStep4()) {
      setError("Please upload all required documents before submitting")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        role: formData.role.toLowerCase(), // Ensure role is lowercase
        salary: Number.parseFloat(formData.salary) || 0,
        experience: Number.parseInt(formData.experience) || 0,
        dateOfBirth: formData.dateOfBirth || null,
        joiningDate: formData.joiningDate || null,
      }

      const response = await axiosInstance.post("/auth/register", submitData)

      if (response.data.success) {
        setGeneratedCredentials({
          id: response.data.data.id,
          password: response.data.data.id,
        })
        setCurrentStep(5)
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone:"",
          role: "employee", // Set a default value instead of empty string
          organizationId: "",
          departmentId: "",
          dateOfBirth: "",
          currentAddress: "",
          photo: "",
          joiningDate: "",
          upperManager: "",
          salary: "",
          experience: "",
          adharCard: "",
          panCard: "",
          bankDetails: {
            accountHolder: "",
            accountNumber: "",
            ifsc: "",
            branch: "",
            accountType: "SAVING",
          },
          documents: {
            aadharFront: "",
            aadharBack: "",
            panCard: "",
            resume: "",
            experienceLetter: "",
            passbookPhoto: "",
            tenthMarksheet: "",
            twelfthMarksheet: "",
            degreeMarksheet: "",
            policy: "",
          },
        })
      } else {
        setError(response.data.message || "Registration failed")
      }
    } catch (error: unknown) {
      console.error("Registration error:", error)
      setError((error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || "Network error. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      default:
        isValid = true
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setError("")
    } else if (!isValid) {
      setError("Please fill in all required fields before proceeding")
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError("")
      setValidationErrors({})
    }
  }

  // Document upload component
  const DocumentUpload = ({
    documentType,
    label,
    accept = "image/*,.pdf",
    icon: Icon = FileText,
    required = false,
  }: {
    documentType: keyof DocumentFiles
    label: string
    accept?: string
    icon?: React.ComponentType<{ className?: string }>
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center hover:border-red-500 transition-colors ${
          validationErrors[documentType] ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
      >
        <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file, documentType)
          }}
          className="hidden"
          id={documentType}
          disabled={uploadingFiles[documentType]}
        />
        <label htmlFor={documentType} className="cursor-pointer text-red-600 hover:text-red-700 font-medium">
          {uploadingFiles[documentType] ? "Uploading..." : "Click to upload"}
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {accept.includes("image") ? "PNG, JPG, PDF up to 5MB" : "PDF up to 10MB"}
        </p>
        {formData.documents[documentType] && (
          <p className="text-xs text-red-600 mt-2">✓ File uploaded successfully</p>
        )}
        {validationErrors[documentType] && (
          <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {validationErrors[documentType]}
          </p>
        )}
      </div>
    </div>
  )

  if (generatedCredentials && currentStep === 5) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 w-full max-w-md mx-4"
        >
          <motion.div className="bg-white/90 backdrop-blur-xl border border-red-200 rounded-3xl p-8 shadow-2xl shadow-red-900/10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Your employee account has been created successfully.</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-red-800 mb-4">Your Login Credentials</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-mono font-bold text-red-700">{generatedCredentials.id}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Password:</span>
                  <span className="font-mono font-bold text-red-700">{generatedCredentials.password}</span>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-4">
                <strong>Important:</strong> Save these credentials securely. You can change your password after first
                login.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-red-500/25"
              >
                Login Now
              </Link>
              <button
                onClick={() => {
                  setGeneratedCredentials(null)
                  setCurrentStep(1)
                  setValidationErrors({})
                }}
                className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                Register Another Employee
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Background geometric shapes */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-red-500/30 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-red-400/40 rounded-lg"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.0,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        className="z-10 w-full max-w-4xl mx-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-red-500/25"
          >
            <Image
                          src="/one_aim.jpg"
                          alt="SHRM Logo"
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-2xl shadow-lg relative z-10"
                          draggable={false}
                          priority
              />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SHRM Portal</h1>
          {/* <p className="text-gray-600">Employee Management System</p> */}
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Registration</h1>
        </motion.div>
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 h-1 mx-1 transition-all duration-300 ${
                      currentStep > step ? "bg-red-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-2xl shadow-red-900/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.name
                          ? "border-red-500 bg-red-50"
                          : focusedField === "name"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <User
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.name
                              ? "text-red-400"
                              : focusedField === "name"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.phone
                          ? "border-red-500 bg-red-50"
                          : focusedField === "phone"
                            ? "border-red-500 bg-green-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Phone
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.phone
                              ? "text-red-500"
                              : focusedField === "phone"
                                ? "text-red-500"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.email
                          ? "border-red-500 bg-red-50"
                          : focusedField === "email"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Mail
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.email
                              ? "text-red-400"
                              : focusedField === "email"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Role Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.role
                          ? "border-red-500 bg-red-50"
                          : focusedField === "role"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Briefcase
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.role
                              ? "text-red-400"
                              : focusedField === "role"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("role")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="intern">Intern</option>
                        <option value="hr">HR</option>
                      </select>
                    </div>
                    {validationErrors.role && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.role}
                      </p>
                    )}
                  </div>

                  {/* Organization Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.organizationId
                          ? "border-red-500 bg-red-50"
                          : focusedField === "organizationId"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Building2
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.organizationId
                              ? "text-red-400"
                              : focusedField === "organizationId"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        name="organizationId"
                        value={formData.organizationId}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("organizationId")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        required
                        disabled={isLoading || loadingOrganizations}
                      >
                        <option value="">
                          {loadingOrganizations ? "Loading organizations..." : "Select Organization"}
                        </option>
                        {organizations.map((org) => (
                          <option key={org._id} value={org._id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.organizationId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.organizationId}
                      </p>
                    )}
                  </div>

                  {/* Department Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.departmentId
                          ? "border-red-500 bg-red-50"
                          : focusedField === "departmentId"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Users
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.departmentId
                              ? "text-red-400"
                              : focusedField === "departmentId"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("departmentId")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        required
                        disabled={isLoading || loadingDepartments || !formData.organizationId}
                      >
                        <option value="">
                          {!formData.organizationId
                            ? "Select organization first"
                            : loadingDepartments
                              ? "Loading departments..."
                              : departments.length === 0
                                ? "No departments available"
                                : "Select Department"}
                        </option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name} {dept.head && `(Head: ${dept.head})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.departmentId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.departmentId}
                      </p>
                    )}
                    {formData.organizationId && departments.length === 0 && !loadingDepartments && (
                      <p className="text-sm text-amber-600 mt-1">
                        No departments found for this organization. Please contact admin to add departments.
                      </p>
                    )}
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-500 ease-out px-6 py-4 rounded-xl text-white font-semibold shadow-lg shadow-red-500/25"
                >
                  Continue to Personal Details
                </motion.button>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm mb-2">Already a member?</p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Login
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Information & Work Details */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal & Work Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of Birth */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.dateOfBirth
                          ? "border-red-500 bg-red-50"
                          : focusedField === "dateOfBirth"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Calendar
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.dateOfBirth
                              ? "text-red-400"
                              : focusedField === "dateOfBirth"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("dateOfBirth")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Joining Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.joiningDate
                          ? "border-red-500 bg-red-50"
                          : focusedField === "joiningDate"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Calendar
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.joiningDate
                              ? "text-red-400"
                              : focusedField === "joiningDate"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("joiningDate")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.joiningDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.joiningDate}
                      </p>
                    )}
                  </div>

                  {/* Upper Manager - Only show for employee, intern, and hr roles */}
                  {formData.role && !["admin", "manager"].includes(formData.role) && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upper Manager <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                          validationErrors.upperManager
                            ? "border-red-500 bg-red-50"
                            : focusedField === "upperManager"
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-12 h-12">
                          <User
                            className={`w-5 h-5 transition-colors duration-500 ease-out ${
                              validationErrors.upperManager
                                ? "text-red-400"
                                : focusedField === "upperManager"
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}
                          />
                        </div>
                        <select
                          name="upperManager"
                          value={formData.upperManager}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField("upperManager")}
                          onBlur={() => setFocusedField("")}
                          className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                          disabled={isLoading || loadingManagers || !formData.departmentId}
                          required
                        >
                          <option value="">
                            {!formData.departmentId
                              ? "Select department first"
                              : loadingManagers
                                ? "Loading managers..."
                                : managers.length === 0
                                  ? "No managers available"
                                  : "Select Manager"}
                          </option>
                          {managers.map((manager) => (
                            <option key={manager._id} value={manager.id}>
                              {manager.name} ({manager.role}) - {manager.id}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.upperManager && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.upperManager}
                        </p>
                      )}
                      {formData.departmentId && managers.length === 0 && !loadingManagers && (
                        <p className="text-sm text-amber-600 mt-1">
                          No managers found for this department.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Salary in Rupees */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Salary (₹) <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.salary
                          ? "border-red-500 bg-red-50"
                          : focusedField === "salary"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <DollarSign
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.salary
                              ? "text-red-400"
                              : focusedField === "salary"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="number"
                        name="salary"
                        placeholder="Enter annual salary in rupees"
                        value={formData.salary}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("salary")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.salary && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.salary}
                      </p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.experience
                          ? "border-red-500 bg-red-50"
                          : focusedField === "experience"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Calendar
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.experience
                              ? "text-red-400"
                              : focusedField === "experience"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="number"
                        name="experience"
                        placeholder="Enter years of experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("experience")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.experience && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.experience}
                      </p>
                    )}
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "photo")
                        }}
                        className="hidden"
                        id="photo"
                        disabled={uploadingFiles.photo}
                      />
                      <label htmlFor="photo" className="cursor-pointer text-red-600 hover:text-red-700 font-medium">
                        {uploadingFiles.photo ? "Uploading..." : "Click to upload photo"}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      {formData.photo && <p className="text-xs text-red-600 mt-2">✓ Photo uploaded successfully</p>}
                    </div>
                  </div>

                  {/* Aadhar Card Number */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.adharCard
                          ? "border-red-500 bg-red-50"
                          : focusedField === "adharCard"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <CreditCard
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.adharCard
                              ? "text-red-400"
                              : focusedField === "adharCard"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="adharCard"
                        placeholder="Enter 12-digit Aadhar number"
                        value={formData.adharCard}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("adharCard")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.adharCard && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.adharCard}
                      </p>
                    )}
                  </div>

                  {/* PAN Card Number */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors.panCard
                          ? "border-red-500 bg-red-50"
                          : focusedField === "panCard"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <CreditCard
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors.panCard
                              ? "text-red-400"
                              : focusedField === "panCard"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="panCard"
                        placeholder="Enter 10-character PAN number"
                        value={formData.panCard}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("panCard")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.panCard && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.panCard}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Address */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Address <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative flex items-start border-2 rounded-xl transition-all duration-500 ease-out ${
                      validationErrors.currentAddress
                        ? "border-red-500 bg-red-50"
                        : focusedField === "currentAddress"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 mt-1">
                      <MapPin
                        className={`w-5 h-5 transition-colors duration-500 ease-out ${
                          validationErrors.currentAddress
                            ? "text-red-400"
                            : focusedField === "currentAddress"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      />
                    </div>
                    <textarea
                      name="currentAddress"
                      placeholder="Enter your current residential address"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("currentAddress")}
                      onBlur={() => setFocusedField("")}
                      rows={3}
                      className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none resize-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {validationErrors.currentAddress && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.currentAddress}
                    </p>
                  )}
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-500 ease-out px-6 py-4 rounded-xl text-white font-semibold shadow-lg shadow-red-500/25"
                  >
                    Continue to Bank Details
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Holder */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors["bankDetails.accountHolder"]
                          ? "border-red-500 bg-red-50"
                          : focusedField === "bankDetails.accountHolder"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <User
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors["bankDetails.accountHolder"]
                              ? "text-red-400"
                              : focusedField === "bankDetails.accountHolder"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="bankDetails.accountHolder"
                        placeholder="Enter account holder name"
                        value={formData.bankDetails.accountHolder}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("bankDetails.accountHolder")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors["bankDetails.accountHolder"] && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors["bankDetails.accountHolder"]}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors["bankDetails.accountNumber"]
                          ? "border-red-500 bg-red-50"
                          : focusedField === "bankDetails.accountNumber"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Banknote
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors["bankDetails.accountNumber"]
                              ? "text-red-400"
                              : focusedField === "bankDetails.accountNumber"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        placeholder="Enter bank account number"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("bankDetails.accountNumber")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors["bankDetails.accountNumber"] && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors["bankDetails.accountNumber"]}
                      </p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors["bankDetails.ifsc"]
                          ? "border-red-500 bg-red-50"
                          : focusedField === "bankDetails.ifsc"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <CreditCard
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors["bankDetails.ifsc"]
                              ? "text-red-400"
                              : focusedField === "bankDetails.ifsc"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="bankDetails.ifsc"
                        placeholder="Enter IFSC code"
                        value={formData.bankDetails.ifsc}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("bankDetails.ifsc")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors["bankDetails.ifsc"] && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors["bankDetails.ifsc"]}
                      </p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        validationErrors["bankDetails.branch"]
                          ? "border-red-500 bg-red-50"
                          : focusedField === "bankDetails.branch"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Building2
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            validationErrors["bankDetails.branch"]
                              ? "text-red-400"
                              : focusedField === "bankDetails.branch"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="bankDetails.branch"
                        placeholder="Enter branch name"
                        value={formData.bankDetails.branch}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("bankDetails.branch")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors["bankDetails.branch"] && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors["bankDetails.branch"]}
                      </p>
                    )}
                  </div>

                  {/* Account Type */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <div
                      className={`relative flex items-center border-2 rounded-xl transition-all duration-500 ease-out ${
                        focusedField === "bankDetails.accountType"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        <Banknote
                          className={`w-5 h-5 transition-colors duration-500 ease-out ${
                            focusedField === "bankDetails.accountType" ? "text-red-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        name="bankDetails.accountType"
                        value={formData.bankDetails.accountType}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("bankDetails.accountType")}
                        onBlur={() => setFocusedField("")}
                        className="bg-transparent flex-1 px-4 py-3 text-gray-900 outline-none"
                        disabled={isLoading}
                      >
                        <option value="SAVING">Savings Account</option>
                        <option value="CURRENT">Current Account</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-500 ease-out px-6 py-4 rounded-xl text-white font-semibold shadow-lg shadow-red-500/25"
                  >
                    Continue to Documents
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Please upload any relevant documents. All documents should be clear and readable. (Optional)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentUpload
                    documentType="aadharFront"
                    label="Aadhar Card (Front Side)"
                    icon={CreditCard}
                  />
                  <DocumentUpload
                    documentType="aadharBack"
                    label="Aadhar Card (Back Side)"
                    icon={CreditCard}
                  />
                  <DocumentUpload documentType="panCard" label="PAN Card" icon={CreditCard} />
                  <DocumentUpload
                    documentType="resume"
                    label="Resume"
                    accept=".pdf,.doc,.docx"
                    icon={FileText}
                  />
                  <DocumentUpload
                    documentType="experienceLetter"
                    label="Experience Letter"
                    accept=".pdf,.doc,.docx"
                    icon={FileText}
                  />
                  <DocumentUpload documentType="passbookPhoto" label="Passbook Photo" icon={ImageIcon} />
                  <DocumentUpload documentType="tenthMarksheet" label="10th Marksheet" icon={FileText} />
                  <DocumentUpload documentType="twelfthMarksheet" label="12th Marksheet" icon={FileText} />
                  <DocumentUpload
                    documentType="degreeMarksheet"
                    label="Degree/Latest Semester Marksheet"
                    icon={FileText}
                  />
                  <DocumentUpload
                    documentType="policy"
                    label="Policy Document"
                    accept=".pdf"
                    icon={FileText}
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-500 ease-out px-6 py-4 rounded-xl text-white font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: isLoading ? ["0%", "100%"] : "-100%" }}
                      transition={{
                        duration: 1.5,
                        repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
                        ease: "linear",
                      }}
                    />
                    <span className="relative">{isLoading ? "Creating Account..." : "Create Employee Account (Documents Optional)"}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </motion.div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
    </div>
  )
}
