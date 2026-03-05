import { TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SavingsSidebarProps {
  currentTotal: number
  alboreTotal: number
  savingsTotal: number
  savingsPercentage: number
}

export function SavingsSidebar({
  currentTotal,
  alboreTotal,
  savingsTotal,
  savingsPercentage,
}: SavingsSidebarProps) {
  const monthlySavings = savingsTotal
  const annualSavings = savingsTotal * 12

  return (
    <Card className="border-2 border-success/30 bg-gradient-to-br from-success/10 to-success/5">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <TrendingDown className="h-8 w-8 text-success" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Economies totales</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-card p-4">
            <p className="mb-1 text-sm text-muted-foreground">Economie mensuelle</p>
            <p className="text-3xl font-bold text-success">
              {monthlySavings.toLocaleString('fr-FR')} €
            </p>
          </div>

          <div className="rounded-lg bg-card p-4">
            <p className="mb-1 text-sm text-muted-foreground">Economie annuelle</p>
            <p className="text-3xl font-bold text-success">
              {annualSavings.toLocaleString('fr-FR')} €
            </p>
          </div>

          <div className="rounded-lg bg-card p-4">
            <p className="mb-1 text-sm text-muted-foreground">Pourcentage d'economie</p>
            <p className="text-3xl font-bold text-success">{savingsPercentage}%</p>
          </div>
        </div>

        {/* Visual Bar */}
        {currentTotal > 0 && (
          <div className="mt-6 rounded-lg bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">Repartition mensuelle</p>
            <div className="flex h-8 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-primary text-xs font-medium text-primary-foreground"
                style={{
                  width: `${(alboreTotal / currentTotal) * 100}%`,
                }}
              >
                {alboreTotal > 50 && `${alboreTotal}€`}
              </div>
              <div
                className="flex items-center justify-center bg-success text-xs font-medium text-success-foreground"
                style={{
                  width: `${(savingsTotal / currentTotal) * 100}%`,
                }}
              >
                {savingsTotal > 50 && `-${savingsTotal}€`}
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Nouveau prix</span>
              <span>Economie</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
