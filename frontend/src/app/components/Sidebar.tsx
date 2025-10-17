'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  Wallet,
  Briefcase,
  Bell,
  Users,
  FileText,
  BarChart3,
  Building,
  X,
} from 'lucide-react'
import { ReactNode } from 'react'

interface SidebarProps {
  isMobile?: boolean
  open?: boolean
  onClose?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { title: 'Attendance', href: '/hr/attendance', icon: <CalendarCheck size={18} /> },
  { title: 'Payroll', href: '/hr/payroll', icon: <Wallet size={18} /> },
  { title: 'Recruitment', href: '/hr/recruitment', icon: <Briefcase size={18} /> },
  { title: 'Notifications', href: '/hr/notifications', icon: <Bell size={18} /> },
  { title: 'Employees', href: '/hr/employees', icon: <Users size={18} /> },
  { title: 'Policies', href: '/hr/policies', icon: <FileText size={18} /> },
  { title: 'Reports', href: '/hr/reports', icon: <BarChart3 size={18} /> },
]

export default function Sidebar({ isMobile = false, open = false, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname()

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-red-100 shadow-lg z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center">
                  <Building className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-gray-800">One Aim IT</span>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} close={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <aside className="hidden md:block w-64 h-screen bg-white border-r border-red-100 shadow-sm p-6 sticky top-0">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded flex items-center justify-center">
          <Building className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">One Aim IT</h2>
          <p className="text-sm text-gray-500">HR Dashboard</p>
        </div>
      </div>
      <SidebarContent pathname={pathname} />
    </aside>
  )
}

interface SidebarContentProps {
  pathname: string
  close?: () => void
}

function SidebarContent({ pathname, close }: SidebarContentProps) {
  return (
    <motion.ul
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {navItems.map((item) => (
        <motion.li
          key={item.href}
          variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 },
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <Link
            href={item.href}
            onClick={close}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              pathname === item.href
                ? 'bg-red-100 text-red-700'
                : 'text-gray-700 hover:bg-red-50'
            }`}
          >
            {item.icon}
            {item.title}
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  )
}
