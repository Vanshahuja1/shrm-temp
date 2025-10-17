'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface ModuleCardProps {
  title: string
  href: string
}

export default function ModuleCard({ title, href }: ModuleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      className="w-full"
    >
      <Link
        href={href}
        className="block w-full p-6 bg-white border border-red-100 hover:border-red-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      >
        <h3 className="text-lg font-semibold text-red-600 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">Tap to manage {title.toLowerCase()}</p>
      </Link>
    </motion.div>
  )
}
