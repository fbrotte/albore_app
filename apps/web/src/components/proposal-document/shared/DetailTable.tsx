import { cn } from '@/lib/utils'
import type { ServiceSummary } from '../types'

interface DetailTableProps {
  services: ServiceSummary[]
  showQuantity?: boolean
  className?: string
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function DetailTable({ services, showQuantity = true, className }: DetailTableProps) {
  const totals = {
    current: services.reduce((sum, s) => sum + s.currentMonthly, 0),
    proposed: services.reduce((sum, s) => sum + s.proposedMonthly, 0),
    savings: services.reduce((sum, s) => sum + s.savingAmount, 0),
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-[#dce3ed]', className)}>
      <table className="w-full border-collapse text-[0.85rem]">
        <thead>
          <tr className="bg-[#1b2a4a] text-white">
            <th className="whitespace-nowrap px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
              Service
            </th>
            {showQuantity && (
              <th className="whitespace-nowrap px-4 py-3 text-center text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
                Quantite
              </th>
            )}
            <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
              Actuel/mois
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
              Propose/mois
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
              Economie
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, idx) => (
            <tr
              key={service.id}
              className={cn(
                'border-b border-[#dce3ed] hover:bg-[#edf2f7]',
                idx % 2 === 1 && 'bg-[#f4f6f9]',
              )}
            >
              <td className="px-4 py-3 align-middle">
                <div className="font-medium text-[#2d3748]">{service.serviceName}</div>
                {service.provider && (
                  <div className="text-[0.75rem] text-[#718096]">{service.provider}</div>
                )}
              </td>
              {showQuantity && (
                <td className="px-4 py-3 text-center align-middle text-[#718096]">
                  {service.quantity !== undefined ? (
                    <>
                      {service.quantity.toFixed(0)} {service.unitLabel ?? 'unites'}
                    </>
                  ) : (
                    '-'
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums">
                {formatCurrency(service.currentMonthly)} €
              </td>
              <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums text-[#2b6cb0]">
                {formatCurrency(service.proposedMonthly)} €
              </td>
              <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums text-[#0d9668]">
                {service.savingAmount > 0 ? <>-{formatCurrency(service.savingAmount)} €</> : '-'}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-[#1b2a4a] font-bold text-white">
            <td className="px-4 py-3">Total</td>
            {showQuantity && <td className="px-4 py-3" />}
            <td className="px-4 py-3 text-right tabular-nums">
              {formatCurrency(totals.current)} €
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatCurrency(totals.proposed)} €
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-[#4ade80]">
              -{formatCurrency(totals.savings)} €
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
