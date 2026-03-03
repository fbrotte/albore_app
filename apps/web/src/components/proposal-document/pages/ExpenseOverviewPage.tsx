import { PageWrapper, PageHeader } from '../shared'
import { GROUP_CONFIG } from '../constants'
import type { ExpenseOverviewPageProps } from '../types'

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function ExpenseOverviewPage({ groups, className }: ExpenseOverviewPageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Vue d'Ensemble des Postes de Depenses" badge="Synthese" />

      <div className="px-14 py-10">
        <p className="mb-6 text-[0.92rem] leading-relaxed text-[#2d3748]">
          Voici les principaux postes de depenses identifies lors de notre audit. Cliquez sur chaque
          categorie pour decouvrir le detail de notre analyse et nos recommandations.
        </p>

        {/* Postes cards grid */}
        <div className="grid grid-cols-3 gap-4">
          {groups.map((group) => {
            const config = GROUP_CONFIG[group.slug]
            const isActive = group.services.length > 0

            return (
              <div
                key={group.id}
                className={`rounded-xl border-2 bg-[#f4f6f9] p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isActive ? config.borderColor : 'border-transparent'
                }`}
              >
                <div
                  className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[1.4rem] text-white"
                  style={{
                    background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                  }}
                >
                  {config.icon}
                </div>
                <h4 className="mb-2 text-[0.95rem] font-bold text-[#1b2a4a]">{group.name}</h4>
                <p className="text-[0.8rem] leading-snug text-[#718096]">
                  {group.services.length} service
                  {group.services.length > 1 ? 's' : ''} analyse
                  {group.services.length > 1 ? 's' : ''}
                </p>
                {group.savingsTotal > 0 && (
                  <div className="mt-3 rounded-lg bg-[#e8f8f2] px-3 py-1.5 text-[0.85rem] font-semibold text-[#0d9668]">
                    -{formatCurrency(group.savingsTotal)} €/mois
                  </div>
                )}
              </div>
            )
          })}

          {/* Placeholder cards for empty groups */}
          {!groups.some((g) => g.slug === 'telecom') && (
            <div className="rounded-xl border-2 border-transparent bg-[#f4f6f9] p-6 text-center opacity-50">
              <div
                className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[1.4rem] text-white"
                style={{
                  background: `linear-gradient(135deg, ${GROUP_CONFIG.telecom.gradientFrom}, ${GROUP_CONFIG.telecom.gradientTo})`,
                }}
              >
                {GROUP_CONFIG.telecom.icon}
              </div>
              <h4 className="mb-2 text-[0.95rem] font-bold text-[#1b2a4a]">
                {GROUP_CONFIG.telecom.name}
              </h4>
              <p className="text-[0.8rem] leading-snug text-[#718096]">Non concerne</p>
            </div>
          )}
          {!groups.some((g) => g.slug === 'it') && (
            <div className="rounded-xl border-2 border-transparent bg-[#f4f6f9] p-6 text-center opacity-50">
              <div
                className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[1.4rem] text-white"
                style={{
                  background: `linear-gradient(135deg, ${GROUP_CONFIG.it.gradientFrom}, ${GROUP_CONFIG.it.gradientTo})`,
                }}
              >
                {GROUP_CONFIG.it.icon}
              </div>
              <h4 className="mb-2 text-[0.95rem] font-bold text-[#1b2a4a]">
                {GROUP_CONFIG.it.name}
              </h4>
              <p className="text-[0.8rem] leading-snug text-[#718096]">Non concerne</p>
            </div>
          )}
          {!groups.some((g) => g.slug === 'printing') && (
            <div className="rounded-xl border-2 border-transparent bg-[#f4f6f9] p-6 text-center opacity-50">
              <div
                className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[1.4rem] text-white"
                style={{
                  background: `linear-gradient(135deg, ${GROUP_CONFIG.printing.gradientFrom}, ${GROUP_CONFIG.printing.gradientTo})`,
                }}
              >
                {GROUP_CONFIG.printing.icon}
              </div>
              <h4 className="mb-2 text-[0.95rem] font-bold text-[#1b2a4a]">
                {GROUP_CONFIG.printing.name}
              </h4>
              <p className="text-[0.8rem] leading-snug text-[#718096]">Non concerne</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
