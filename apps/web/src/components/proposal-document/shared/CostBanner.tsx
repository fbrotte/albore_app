import { cn } from '@/lib/utils'

interface CostBannerProps {
  currentAmount: number
  proposedAmount: number
  currentProvider?: string
  proposedProvider?: string
  className?: string
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function CostBanner({
  currentAmount,
  proposedAmount,
  currentProvider,
  proposedProvider = 'Albore',
  className,
}: CostBannerProps) {
  return (
    <div className={cn('mb-7 grid grid-cols-2 gap-5', className)}>
      {/* Current cost */}
      <div className="rounded-xl border border-[#fed7d7] bg-[#fff5f5] p-7 text-center">
        <div className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#718096]">
          Coût Mensuel Actuel
        </div>
        {currentProvider && (
          <div className="mb-2.5 text-[0.8rem] italic text-[#718096]">{currentProvider}</div>
        )}
        <div className="font-['Playfair_Display',serif] text-[2rem] font-extrabold leading-tight text-[#dc3545]">
          {formatCurrency(currentAmount)} €
        </div>
        <div className="mt-1 text-[0.85rem] text-[#718096]">
          {formatCurrency(currentAmount * 12)} € / an
        </div>
      </div>

      {/* Proposed cost */}
      <div className="rounded-xl border border-[#b3d1f0] bg-[#e8f0fe] p-7 text-center">
        <div className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#718096]">
          Proposition {proposedProvider}
        </div>
        <div className="mb-2.5 text-[0.8rem] italic text-[#718096]">Tarif optimise</div>
        <div className="font-['Playfair_Display',serif] text-[2rem] font-extrabold leading-tight text-[#2b6cb0]">
          {formatCurrency(proposedAmount)} €
        </div>
        <div className="mt-1 text-[0.85rem] text-[#718096]">
          {formatCurrency(proposedAmount * 12)} € / an
        </div>
      </div>
    </div>
  )
}
