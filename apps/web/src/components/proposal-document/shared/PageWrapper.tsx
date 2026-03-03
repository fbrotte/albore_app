import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div
      className={cn(
        'proposal-page mx-auto mb-10 max-w-[900px] overflow-hidden rounded-[20px] bg-white shadow-lg',
        'print:mb-0 print:break-after-page print:rounded-none print:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
