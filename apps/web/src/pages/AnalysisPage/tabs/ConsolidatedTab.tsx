import { useState, useEffect, useRef, Fragment } from 'react'
import { Edit2, PieChart, RefreshCw, TrendingDown, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Summary {
  id: string
  avgMonthly: unknown
  avgQuantity?: unknown
  minQuantity?: unknown
  maxQuantity?: unknown
  avgUnitPrice?: unknown
  ourPrice?: unknown
  savingAmount?: unknown
  customLabel?: string | null
  matchedService?: {
    name: string
    unitLabel?: string
    category?: { id: string; name: string; displayOrder?: number } | null
  } | null
}

interface ConsolidatedTabProps {
  analysisId: string
  summaries: Summary[] | undefined
  totals: {
    currentTotal: number
    alboreTotal: number
    savingsTotal: number
  }
  onConsolidate: () => void
  onUpdateSummary: (summaryId: string, ourPrice: number) => void
  isConsolidating: boolean
  isUpdating: boolean
}

export function ConsolidatedTab({
  analysisId,
  summaries,
  totals,
  onConsolidate,
  onUpdateSummary,
  isConsolidating,
  isUpdating,
}: ConsolidatedTabProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const hasConsolidatedRef = useRef(false)
  const lastAnalysisIdRef = useRef(analysisId)

  // Auto-consolidate on mount or when analysis changes
  useEffect(() => {
    // Reset if analysis changed
    if (lastAnalysisIdRef.current !== analysisId) {
      hasConsolidatedRef.current = false
      lastAnalysisIdRef.current = analysisId
    }

    // Only consolidate once per tab visit
    if (!hasConsolidatedRef.current && !isConsolidating) {
      hasConsolidatedRef.current = true
      onConsolidate()
    }
  }, [analysisId, onConsolidate, isConsolidating])

  const handleEditItem = (summaryId: string, currentPrice: number | null) => {
    setEditingItem(summaryId)
    setEditValue(currentPrice?.toString() ?? '')
  }

  const handleSaveItem = (summaryId: string) => {
    const newPrice = parseFloat(editValue)
    if (!isNaN(newPrice)) {
      onUpdateSummary(summaryId, newPrice)
    }
    setEditingItem(null)
  }

  // Loading state
  if (isConsolidating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary" />
          <h3 className="mb-2 font-semibold">Consolidation en cours...</h3>
          <p className="text-muted-foreground">Calcul des postes de depense</p>
        </CardContent>
      </Card>
    )
  }

  // Group summaries by category
  const groupedSummaries = (summaries ?? []).reduce(
    (acc, summary) => {
      const categoryName = summary.matchedService?.category?.name ?? 'Autres'
      const categoryOrder = summary.matchedService?.category?.displayOrder ?? 999
      if (!acc[categoryName]) {
        acc[categoryName] = { order: categoryOrder, items: [] }
      }
      acc[categoryName].items.push(summary)
      return acc
    },
    {} as Record<string, { order: number; items: Summary[] }>,
  )

  // Sort categories by displayOrder
  const sortedCategories = Object.entries(groupedSummaries).sort(
    ([, a], [, b]) => a.order - b.order,
  )

  // No data after consolidation
  if (!summaries || summaries.length === 0) {
    return (
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="p-6 text-center">
          <PieChart className="mx-auto mb-4 h-12 w-12 text-warning" />
          <h3 className="mb-2 font-semibold">Aucun poste consolide</h3>
          <p className="text-muted-foreground">
            Assurez-vous d'avoir des lignes de factures assignees dans l'onglet "Assignation"
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="mr-2 h-5 w-5 text-primary" />
          Comparaison detaillee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="px-2 py-3 text-left text-sm font-semibold">Poste de depense</th>
                <th className="px-2 py-3 text-center text-sm font-semibold">Qte moy.</th>
                <th className="px-2 py-3 text-right text-sm font-semibold">Prix unit. actuel</th>
                <th className="px-2 py-3 text-right text-sm font-semibold">Prix unit. Albore</th>
                <th className="px-2 py-3 text-right text-sm font-semibold">Economie/mois</th>
                <th className="px-2 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([categoryName, { items }]) => (
                <Fragment key={categoryName}>
                  {/* Category header */}
                  <tr className="border-t-2 border-primary/20 bg-primary/5">
                    <td
                      colSpan={6}
                      className="px-3 py-3 text-sm font-bold uppercase tracking-wider text-primary"
                    >
                      {categoryName}
                    </td>
                  </tr>
                  {items.map((summary) => {
                    const avgQuantity = summary.avgQuantity ? Number(summary.avgQuantity) : null
                    const minQty = summary.minQuantity ? Number(summary.minQuantity) : null
                    const maxQty = summary.maxQuantity ? Number(summary.maxQuantity) : null
                    const avgUnitPrice = summary.avgUnitPrice ? Number(summary.avgUnitPrice) : null
                    const ourUnitPrice = summary.ourPrice ? Number(summary.ourPrice) : null
                    const savingAmount = summary.savingAmount ? Number(summary.savingAmount) : null
                    const unitLabel = summary.matchedService?.unitLabel ?? 'unite'

                    const qtyDisplay =
                      avgQuantity !== null
                        ? minQty !== null && maxQty !== null && Math.abs(minQty - maxQty) > 0.1
                          ? `${avgQuantity.toFixed(1)} (${minQty}-${maxQty})`
                          : avgQuantity.toFixed(1)
                        : '-'

                    return (
                      <tr
                        key={summary.id}
                        className="transition-smooth border-b border-muted hover:bg-muted/50"
                      >
                        <td className="px-2 py-4 pl-4">
                          <div className="text-sm font-medium">
                            {summary.matchedService?.name ?? summary.customLabel ?? 'Service'}
                          </div>
                          <div className="text-xs text-muted-foreground">{unitLabel}</div>
                        </td>
                        <td className="px-2 py-4 text-center text-sm">
                          <span className="font-medium">{qtyDisplay}</span>
                        </td>
                        <td className="px-2 py-4 text-right text-sm">
                          {avgUnitPrice !== null ? (
                            <span className="font-medium">
                              {avgUnitPrice.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              €
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-2 py-4 text-right text-sm">
                          {editingItem === summary.id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveItem(summary.id)
                                  if (e.key === 'Escape') setEditingItem(null)
                                }}
                                className="w-28 text-right"
                                autoFocus
                                disabled={isUpdating}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveItem(summary.id)}
                                disabled={isUpdating}
                              >
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(null)}
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium text-primary">
                              {ourUnitPrice !== null
                                ? `${ourUnitPrice.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })} €`
                                : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-4 text-right text-sm">
                          {savingAmount !== null && savingAmount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                              <TrendingDown className="mr-1 h-3 w-3" />-
                              {savingAmount.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              €
                            </span>
                          ) : savingAmount !== null && savingAmount < 0 ? (
                            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                              +
                              {Math.abs(savingAmount).toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              €
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <button
                            onClick={() =>
                              handleEditItem(
                                summary.id,
                                summary.ourPrice ? Number(summary.ourPrice) : null,
                              )
                            }
                            className="transition-smooth rounded-lg p-2 hover:bg-muted"
                            title="Editer le prix unitaire"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}

              {/* Total Row */}
              <tr className="bg-muted font-semibold">
                <td className="px-2 py-4 text-sm">Total mensuel</td>
                <td className="px-2 py-4 text-center text-sm">-</td>
                <td className="px-2 py-4 text-right text-sm">
                  {totals.currentTotal.toLocaleString('fr-FR')} €
                </td>
                <td className="px-2 py-4 text-right text-sm text-primary">
                  {totals.alboreTotal.toLocaleString('fr-FR')} €
                </td>
                <td className="px-2 py-4 text-right text-sm">
                  {totals.savingsTotal > 0 && (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-sm font-medium text-success">
                      -{totals.savingsTotal.toLocaleString('fr-FR')} €
                    </span>
                  )}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
