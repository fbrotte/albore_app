import { cn } from '@/lib/utils'

interface SavingsBannerProps {
  monthlyAmount: number
  annualAmount: number
  percentage: number
  className?: string
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function SavingsBanner({
  monthlyAmount,
  annualAmount,
  percentage,
  className,
}: SavingsBannerProps) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-6 rounded-xl p-8 text-center text-white', className)}
      style={{
        background: 'linear-gradient(135deg, #1b2a4a, #2b6cb0)',
      }}
    >
      <div>
        <div className="font-['Playfair_Display',serif] text-[2rem] font-extrabold leading-tight">
          {formatCurrency(monthlyAmount)} €
        </div>
        <div className="mt-1 text-[0.78rem] uppercase tracking-[0.08em] opacity-80">
          Economie mensuelle
        </div>
      </div>

      <div>
        <div className="font-['Playfair_Display',serif] text-[2rem] font-extrabold leading-tight">
          {formatCurrency(annualAmount)} €
        </div>
        <div className="mt-1 text-[0.78rem] uppercase tracking-[0.08em] opacity-80">
          Economie annuelle
        </div>
      </div>

      <div>
        <div className="font-['Playfair_Display',serif] text-[2rem] font-extrabold leading-tight">
          {percentage.toFixed(1)}%
        </div>
        <div className="mt-1 text-[0.78rem] uppercase tracking-[0.08em] opacity-80">
          Reduction totale
        </div>
      </div>
    </div>
  )
}
