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
        // A4 dimensions (210mm x 297mm) - always shown as A4 for PDF preview
        'proposal-page mx-auto h-[297mm] w-[210mm] bg-white',
        // Screen styles - shadow and slight rounding for preview feel
        'rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.1)]',
        // Flex layout for footer positioning
        'flex flex-col',
        // Print styles - remove decorative styles, add overflow hidden
        'print:overflow-hidden print:rounded-none print:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
