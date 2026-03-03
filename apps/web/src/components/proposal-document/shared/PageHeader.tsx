import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  badge?: string
  className?: string
}

export function PageHeader({ title, badge, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between overflow-hidden bg-[#1b2a4a] px-14 py-8',
        className,
      )}
    >
      {/* Background decoration */}
      <div
        className="absolute -right-10 -top-[60px] h-[200px] w-[200px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(43,108,176,0.2) 0%, transparent 70%)',
        }}
      />

      <h2 className="relative z-10 font-['Playfair_Display',serif] text-[1.6rem] font-bold text-white">
        {title}
      </h2>

      {badge && (
        <span className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(91,155,213,0.4)] bg-[rgba(91,155,213,0.2)] px-4 py-1.5 text-[0.8rem] font-semibold text-[#93c5fd]">
          {badge}
        </span>
      )}
    </div>
  )
}
