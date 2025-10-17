'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function SplashScreen() {
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 1300)   // Letters emerge
    const timer2 = setTimeout(() => setPhase(2), 1800)  // Form words
    const timer3 = setTimeout(() => setPhase(3), 2400)  // Welcome text
    const timer4 = setTimeout(() => setShow(false), 3500) // Hide 

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Redirect after splash screen hides
  useEffect(() => {
    if (!show) {
      const redirectTimeout = setTimeout(() => {
        router.push('/login')
      }, 900) // Wait for exit animation to finish
      return () => clearTimeout(redirectTimeout)
    }
  }, [show, router])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-red-200"
        >
          {/* Animated gradient glow pulse */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.32, scale: 1 }}
            animate={{
              opacity: [0.32, 0.54, 0.32],
              scale: [1, 1.06, 1]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background:
                "radial-gradient(circle at 60% 40%, #f87171 0%, #f3e8ff 60%, transparent 100%)"
            }}
          />

          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Welcome text */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                  className="mb-3"
                >
                  <p className="text-xl md:text-2xl font-light text-gray-700 tracking-widest uppercase drop-shadow">
                    Welcome to
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logo container */}
            <div className="relative flex items-baseline justify-center w-full">
              {/* Animated logo shadow */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 rounded-full bg-red-200 blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.4, 0.56, 0.4]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ zIndex: 0 }}
              />

              {/* "One" */}
              <motion.span
                initial={{ scale: 0, opacity: 0, y: 24 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  x: phase >= 2 ? -54 : 0
                }}
                transition={{
                  duration: phase >= 2 ? 0.8 : 1.1,
                  ease: "easeInOut"
                }}
                className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg relative z-10"
              >
                O
              </motion.span>

              <AnimatePresence>
                {phase >= 1 && (
                  <motion.span
                    className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight relative z-10"
                    initial={{ scale: 0.8, x: -27, y: -16, opacity: 0 }}
                    animate={{ scale: 1, x: phase >= 2 ? -41 : 12, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.13, ease: "easeInOut" }}
                  >n</motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.span
                    className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight relative z-10"
                    initial={{ scale: 0.8, x: -33, y: 22, opacity: 0 }}
                    animate={{ scale: 1, x: phase >= 2 ? -26 : 26, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.26, ease: "easeInOut" }}
                  >e</motion.span>
                )}
              </AnimatePresence>

              {/* Responsive, reduced space */}
              {phase >= 2 && <div className="w-2 sm:w-3 md:w-4" />}

              {/* "Aim" */}
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.span
                    className="text-6xl md:text-7xl font-extrabold text-red-600 tracking-tight relative z-10"
                    initial={{ scale: 0.8, x: 44, y: -24, opacity: 0 }}
                    animate={{ scale: 1, x: phase >= 2 ? 28 : 54, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.39, ease: "easeInOut" }}
                  >A</motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.span
                    className="text-6xl md:text-7xl font-extrabold text-red-600 tracking-tight relative z-10"
                    initial={{ scale: 0.8, x: 60, y: 18, opacity: 0 }}
                    animate={{ scale: 1, x: phase >= 2 ? 49 : 72, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.52, ease: "easeInOut" }}
                  >i</motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.span
                    className="text-6xl md:text-7xl font-extrabold text-red-600 tracking-tight relative z-10"
                    initial={{ scale: 0.8, x: 78, y: -10, opacity: 0 }}
                    animate={{ scale: 1, x: phase >= 2 ? 69 : 90, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.68, ease: "easeInOut" }}
                  >m</motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Underline when words form */}
            {phase >= 2 && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-6 h-1 bg-gradient-to-r from-gray-300 via-red-400 to-gray-300 rounded-full shadow-md"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '76%', opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.45, ease: "easeInOut" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}