import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  color?: 'primary' | 'success' | 'warning'
  className?: string
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}

export function ProgressBar({ progress, color = 'primary', className }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className={cn('h-full transition-all duration-500 ease-out', colorClasses[color])}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  )
}
