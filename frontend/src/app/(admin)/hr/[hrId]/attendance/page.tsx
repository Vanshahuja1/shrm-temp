'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DailyAttendance from './daily/page'
import MonthlyCalendar from './monthly/page'

export default function AttendancePage() {
  const [tab, setTab] = useState<'refresh' | 'monthly' >('refresh')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 tracking-tight drop-shadow-sm">
        Attendance Management
      </h1>

      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
        {['refresh', 'monthly'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              tab === key
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            {key === 'refresh' && '🔁 Daily Attendance'}
            {key === 'monthly' && '📅 Monthly Attendance'}
            {/* {key === 'leave' && '📤 Leave Management'} */}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.5 }}
      >
        {tab === 'refresh' && <DailyAttendance />}
        {tab === 'monthly' && <MonthlyCalendar />}
        {/* {tab === 'leave' && <LeaveManagement />} */}
      </motion.div>
    </motion.div>
  )
}
