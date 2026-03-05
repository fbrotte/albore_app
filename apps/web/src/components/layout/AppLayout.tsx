import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 print:contents">
      <AppHeader />
      <main className="print:contents">{children}</main>
    </div>
  )
}
