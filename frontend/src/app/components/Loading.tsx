import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface LoadingProps {
  isLoading: boolean
  onComplete?: () => void
}

export default function Loading({ isLoading, onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      setLoadingComplete(false)
      
      // Smooth progress animation
      const progressTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              setTimeout(() => setLoadingComplete(true), 300)
              return 100
            }
            return prev + 2
          })
        }, 40) // Smooth 2-second animation
        
        return () => clearInterval(interval)
      }, 500)

      return () => clearTimeout(progressTimer)
    }
  }, [isLoading])

  useEffect(() => {
    if (loadingComplete) {
      setTimeout(() => onComplete?.(), 600)
    }
  }, [loadingComplete, onComplete])

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: loadingComplete ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
    >
      <div className="text-center space-y-8">
        {/* Company/Brand Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-black rounded"></div>
          </div>
          <h1 className="text-xl font-light text-white tracking-wide">Loading</h1>
        </motion.div>

        {/* Modern Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-80 max-w-sm mx-auto space-y-4"
        >
          {/* Progress Track */}
          <div className="relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center text-sm">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 font-light"
            >
              Please wait...
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white font-mono text-xs"
            >
              {progress}%
            </motion.span>
          </div>
        </motion.div>

        {/* Subtle Animation Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-gray-600 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

        {/* Completion Check */}
        {progress === 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}