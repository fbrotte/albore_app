import { PageWrapper, PageHeader, SavingsBanner } from '../shared'
import type { SynthesisPageProps } from '../types'

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function SynthesisPage({ groups, totals, className }: SynthesisPageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Synthese & Bilan" badge="Recapitulatif" />

      <div className="px-14 py-10">
        {/* Section title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f8f2] text-[1.1rem]">
            📊
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Tableau Recapitulatif
          </h3>
        </div>

        {/* Summary table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-[#dce3ed]">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr className="bg-[#1b2a4a] text-white">
                <th className="whitespace-nowrap px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                  Poste
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                  Actuel/mois
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                  Propose/mois
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                  Economie/mois
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                  Economie/an
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => (
                <tr
                  key={group.id}
                  className={`border-b border-[#dce3ed] hover:bg-[#edf2f7] ${
                    idx % 2 === 1 ? 'bg-[#f4f6f9]' : ''
                  }`}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span>{group.icon}</span>
                      <span className="font-medium text-[#2d3748]">{group.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums">
                    {formatCurrency(group.currentTotal)} €
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums text-[#2b6cb0]">
                    {formatCurrency(group.proposedTotal)} €
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums text-[#0d9668]">
                    -{formatCurrency(group.savingsTotal)} €
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums text-[#0d9668]">
                    -{formatCurrency(group.savingsTotal * 12)} €
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-[#1b2a4a] font-bold text-white">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.currentMonthly)} €
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.proposedMonthly)} €
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#4ade80]">
                  -{formatCurrency(totals.savingsMonthly)} €
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#4ade80]">
                  -{formatCurrency(totals.savingsAnnual)} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KPI cards */}
        <div className="mb-8 grid grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-7 text-center">
            <div className="font-['Playfair_Display',serif] text-[2.2rem] font-extrabold text-[#2b6cb0]">
              {totals.savingsPercent.toFixed(1)}%
            </div>
            <div className="mt-1 text-[0.85rem] font-bold text-[#1b2a4a]">Reduction globale</div>
            <div className="mt-1.5 text-[0.8rem] leading-snug text-[#718096]">
              Sur l'ensemble de vos depenses telecoms et IT
            </div>
          </div>

          <div className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-7 text-center">
            <div className="font-['Playfair_Display',serif] text-[2.2rem] font-extrabold text-[#2b6cb0]">
              {formatCurrency(totals.savingsAnnual)} €
            </div>
            <div className="mt-1 text-[0.85rem] font-bold text-[#1b2a4a]">
              Economies sur 12 mois
            </div>
            <div className="mt-1.5 text-[0.8rem] leading-snug text-[#718096]">
              Projections basees sur les tarifs actuels
            </div>
          </div>
        </div>

        {/* Savings banner */}
        <SavingsBanner
          monthlyAmount={totals.savingsMonthly}
          annualAmount={totals.savingsAnnual}
          percentage={totals.savingsPercent}
        />
      </div>
    </PageWrapper>
  )
}
