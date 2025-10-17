'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import RootShell from './RootShell'

export default function ClientLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHR = pathname?.startsWith('/hr')

  if (isHR) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-white to-red-100">
        <RootShell>{children}</RootShell>
      </div>
    )
  }

  return <>{children}</>
}
