'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
// import Header from './Header'

export default function RootShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mobileSidebarRef = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        sidebarOpen &&
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  return (
    <>
      {/* <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} toggleRef={toggleBtnRef} /> */}
      <div className="flex min-h-[calc(100vh-64px)] relative">
        {/* <div className="hidden md:block">
          <Sidebar />
        </div> */}

        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-red-100 shadow-lg z-50 p-6"
              ref={mobileSidebarRef}
            >
              <Sidebar isMobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}

        <motion.main
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white shadow-inner"
        >
          {children}
        </motion.main>
      </div>
    </>
  )
}
