"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { User, Lock, LogIn, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Loading from "../../components/Authenticating"
import axiosInstance from "@/lib/axiosInstance"

export default function LoginPage() {
  const [formData, setFormData] = useState({ id: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Enhanced brighter particle system with optimized performance
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.8,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.6 + 0.3,
      pulse: Math.random() * 0.02 + 0.01,
    }))

    // Reduced floating geometric shapes for better performance
    const shapes = Array.from({ length: 4 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 40 + 15,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.08 + 0.03,
      type: Math.floor(Math.random() * 3), // 0: circle, 1: square, 2: triangle
    }))

    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw floating geometric shapes
      shapes.forEach((shape) => {
        ctx.save()
        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.rotation)
        ctx.globalAlpha = shape.opacity

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size)
        gradient.addColorStop(0, `rgba(220, 38, 38, ${shape.opacity * 0.8})`)
        gradient.addColorStop(1, `rgba(220, 38, 38, 0)`)

        if (shape.type === 0) {
          // Circle
          ctx.beginPath()
          ctx.arc(0, 0, shape.size, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(220, 38, 38, ${shape.opacity * 0.6})`
          ctx.lineWidth = 2
          ctx.stroke()
        } else if (shape.type === 1) {
          // Square
          ctx.beginPath()
          ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size)
          ctx.strokeStyle = `rgba(220, 38, 38, ${shape.opacity * 1})`
          ctx.lineWidth = 2
          ctx.stroke()
        } else {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -shape.size/2)
          ctx.lineTo(-shape.size/2, shape.size/2)
          ctx.lineTo(shape.size/2, shape.size/2)
          ctx.closePath()
          ctx.strokeStyle = `rgba(220, 38, 38, ${shape.opacity * 1})`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        ctx.restore()

        shape.rotation += shape.rotationSpeed
        shape.x += shape.dx
        shape.y += shape.dy

        if (shape.x < -100 || shape.x > canvas.width + 100) shape.dx *= -1
        if (shape.y < -100 || shape.y > canvas.height + 100) shape.dy *= -1
      })

      // Enhanced connections between particles - optimized
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const alpha = 0.25 * (1 - distance / 120)
            ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        })
      })

      // Optimized glowing particles
      particles.forEach((p) => {
        // Simplified main particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        p.opacity += p.pulse
        if (p.opacity > 0.9 || p.opacity < 0.2) p.pulse *= -1
        
        ctx.fillStyle = `rgba(220, 38, 38, ${p.opacity * 0.7})`
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

  // Role-based redirect function
  const getRedirectPath = (role: string, id: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "/admin"
      case "hr":
        return `/hr/${id}`
      case "manager":
        return `/manager/${id}`
      case "employee":
        return `/employee/${id}/tasks`
      default:
        return `/employee/${id}/tasks`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await axiosInstance.post("/auth/login", {
        id: formData.id.trim(),
        password: formData.password,
      })

      const data = response.data

      if (data.success) {
        // Store authentication data
        localStorage.setItem("authToken", data.data.token)
        localStorage.setItem("userData", JSON.stringify(data.data.user))

        // Show success message briefly
        setError("")

        // Redirect based on user role and id
      const redirectPath = getRedirectPath(data.data.user.role, data.data.user.id)
        // Add a small delay for better UX
        setTimeout(() => {
          router.push(redirectPath)
        }, 500)
      } else {
        setError(data.message || "Login failed. Please check your credentials.")
      }
    } catch (error: unknown) {
      console.error("Login error:", error)
      setError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Network error. Please check if the server is running and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden">
      <Loading isLoading={isLoading} />

      {/* Enhanced animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Enhanced background geometric shapes with better animations */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="absolute top-1/4 left-1/6 w-40 h-40 border-2 border-red-500/20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 35, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="absolute bottom-1/3 right-1/6 w-28 h-28 border-2 border-red-400/30 rounded-lg"
        />
        <motion.div
          animate={{
            rotate: 180,
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="absolute top-1/2 right-1/4 w-16 h-16 border border-red-300/40 transform rotate-45"
        />
      </div>

      {/* Main login container with enhanced design */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          type: "spring",
          stiffness: 80,
          damping: 12,
        }}
        className="z-10 w-full max-w-md mx-4"
      >
        {/* Enhanced header section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-center mb-10"
        >
          <motion.div
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 10 
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl mb-6 shadow-2xl shadow-red-500/40 relative overflow-hidden"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-1 border border-red-300/30 rounded-2xl"
            />
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
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-4xl font-bold text-gray-900 mb-3"
          >
            SHRM Portal
          </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-6"
          />
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-2xl font-semibold text-gray-700"
          >
            Welcome Back
          </motion.h2>
        </motion.div>

        {/* Enhanced login form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="relative"
        >
          {/* Glassmorphism container with enhanced styling */}
          <div className="bg-white/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden">
            {/* Animated border glow */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-3xl border-2 border-red-500/30 pointer-events-none"
            />

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Enhanced User ID Field */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    borderColor: focusedField === "id" ? "rgb(220, 38, 38)" : "rgb(209, 213, 219)",
                    boxShadow: focusedField === "id" 
                      ? "0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.1)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  className="relative flex items-center border-2 rounded-2xl transition-all duration-500 ease-out bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex items-center justify-center w-14 h-14">
                    <motion.div
                      animate={{
                        scale: focusedField === "id" ? 1.2 : 1,
                        color: focusedField === "id" ? "rgb(220, 38, 38)" : "rgb(156, 163, 175)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <User className="w-5 h-5" />
                    </motion.div>
                  </div>
                  <input
                    type="text"
                    placeholder="Member ID"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    onFocus={() => setFocusedField("id")}
                    onBlur={() => setFocusedField("")}
                    className="bg-transparent flex-1 px-4 py-4 text-gray-900 placeholder:text-gray-500 outline-none font-medium"
                    required
                    disabled={isLoading}
                  />
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: focusedField === "id" ? 1 : 0 }}
                  className="absolute -bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full origin-left"
                />
              </motion.div>

              {/* Enhanced Password Field */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    borderColor: focusedField === "password" ? "rgb(220, 38, 38)" : "rgb(209, 213, 219)",
                    boxShadow: focusedField === "password" 
                      ? "0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.1)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  className="relative flex items-center border-2 rounded-2xl transition-all duration-500 ease-out bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex items-center justify-center w-14 h-14">
                    <motion.div
                      animate={{
                        scale: focusedField === "password" ? 1.2 : 1,
                        color: focusedField === "password" ? "rgb(220, 38, 38)" : "rgb(156, 163, 175)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    className="bg-transparent flex-1 px-4 py-4 text-gray-900 placeholder:text-gray-500 outline-none font-medium"
                    required
                    disabled={isLoading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="mr-4 p-1 text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: focusedField === "password" ? 1 : 0 }}
                  className="absolute -bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full origin-left"
                />
              </motion.div>

              {/* Enhanced Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative bg-red-50 border-2 border-red-200 rounded-2xl p-4 overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/50 to-transparent"
                    />
                    <p className="text-red-600 text-sm text-center font-medium relative z-10">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Login button */}
              <motion.button
                type="submit"
                disabled={isLoading || !formData.id.trim() || !formData.password}
                whileHover={{ 
                  scale: isLoading ? 1 : 1.05,
                  boxShadow: "0 20px 40px rgba(220, 38, 38, 0.4)",
                }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 transition-all duration-500 ease-out px-6 py-5 rounded-2xl text-white font-bold shadow-2xl shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
                      "linear-gradient(225deg, transparent, rgba(255,255,255,0.1), transparent)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                  initial={{ x: "-100%" }}
                  animate={{ x: isLoading ? ["0%", "100%"] : "-100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                  }}
                />
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  <motion.div
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    <LogIn className="w-6 h-6" />
                  </motion.div>
                  <span>{isLoading ? "Authenticating..." : "Access Portal"}</span>
                </div>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced bottom decorative elements */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
      />
      <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
    </div>
  )
}