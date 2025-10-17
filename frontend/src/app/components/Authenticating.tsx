"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"

interface LoadingProps {
  isLoading: boolean
}

export default function Loading({ isLoading }: LoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-900/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="relative"
              >
                <div className="w-16 h-16 border-4 border-red-500/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin" />
                <div className="absolute inset-2 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
              </motion.div>

              <div className="text-center">
                <motion.h3
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="text-white font-semibold text-lg"
                >
                  Authenticating
                </motion.h3>
                <p className="text-gray-400 text-sm mt-1">Verifying credentials...</p>
              </div>

              <motion.div className="flex space-x-1" initial="hidden" animate="visible">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-red-500 rounded-full"
                    variants={{
                      hidden: { opacity: 0.3 },
                      visible: { opacity: 1 },
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
