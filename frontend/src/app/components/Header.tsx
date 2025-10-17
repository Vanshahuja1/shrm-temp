'use client'

import { Menu } from 'lucide-react'
import { RefObject } from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
  toggleRef?: RefObject<HTMLButtonElement>
}

export default function Header({ onToggleSidebar, toggleRef }: HeaderProps) {
  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button ref={toggleRef} onClick={onToggleSidebar} className="md:hidden text-gray-700">
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-red-600 tracking-wide">
          One Aim HR Portal
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-gray-600">Welcome, HR Admin</span>
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
          A
        </div>
      </div>
    </header>
  )
}
