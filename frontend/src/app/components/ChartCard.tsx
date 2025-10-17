'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ChartCardProps {
  title: string
  chart: ReactNode
}

export default function ChartCard({ title, chart }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white p-6 rounded-2xl border border-red-100 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
      {chart}
    </motion.div>
  )
}
