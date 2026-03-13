import { useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Layers, List, FileOutput, CheckCircle, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'
import { AnalysisHeader, SavingsSidebar } from './components'
import { DataTab, AssignmentTab, ConsolidatedTab, ProposalTab } from './tabs'

type TabType = 'data' | 'assignation' | 'consolide' | 'proposition'

interface TabConfig {
  label: string
  icon: React.ElementType
  getStatus: (stats: StepStats) => 'completed' | 'current' | 'pending'
  getCount: (stats: StepStats) => string | null
}

interface StepStats {
  invoiceCount: number
  lineCount: number
  matchedCount: number
  pendingCount: number
  summaryCount: number
}

const TAB_CONFIG: Record<TabType, TabConfig> = {
  data: {
    label: 'Donnees',
    icon: FileText,
    getStatus: (s) => (s.invoiceCount > 0 ? 'completed' : 'current'),
    getCount: (s) => (s.invoiceCount > 0 ? `${s.invoiceCount}` : null),
  },
  assignation: {
    label: 'Assignation',
    icon: List,
    getStatus: (s) => {
      if (s.lineCount === 0) return 'pending'
      if (s.pendingCount > 0) return 'current'
      return 'completed'
    },
    getCount: (s) => {
      if (s.lineCount === 0) return null
      if (s.pendingCount > 0) return `${s.matchedCount}/${s.lineCount}`
      return `${s.lineCount}`
    },
  },
  consolide: {
    label: 'Post consolide',
    icon: Layers,
    getStatus: (s) => {
      if (s.summaryCount > 0) return 'completed'
      if (s.matchedCount === 0) return 'pending'
      return 'current'
    },
    getCount: (s) => (s.summaryCount > 0 ? `${s.summaryCount}` : null),
  },
  proposition: {
    label: 'Proposition',
    icon: FileOutput,
    getStatus: (s) => {
      if (s.summaryCount === 0) return 'pending'
      return 'completed'
    },
    getCount: () => null,
  },
}

// Determine which tab to show based on analysis progress
function determineCurrentTab(stats: StepStats): TabType {
  // No invoices yet → data
  if (stats.invoiceCount === 0) return 'data'
  // No lines extracted yet → data (still processing)
  if (stats.lineCount === 0) return 'data'
  // Lines exist but pending matches → assignation
  if (stats.pendingCount > 0) return 'assignation'
  // All matched but no summaries → consolide
  if (stats.summaryCount === 0) return 'consolide'
  // Has summaries → proposition
  return 'proposition'
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlTab = searchParams.get('tab') as TabType | null

  const {
    data: analysis,
    isLoading,
    refetch: refetchAnalysis,
  } = trpc.analyses.getById.useQuery({ id: id! }, { enabled: !!id })

  const { data: stats, refetch: refetchStats } = trpc.analyses.getStats.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  const { data: invoiceLines, refetch: refetchLines } = trpc.invoiceLines.listByAnalysis.useQuery(
    { analysisId: id! },
    { enabled: !!id },
  )

  const { data: summaries, refetch: refetchSummaries } = trpc.summaries.list.useQuery(
    { analysisId: id! },
    { enabled: !!id },
  )

  const { data: services } = trpc.catalog.services.list.useQuery()

  // Calculate step stats
  const stepStats: StepStats = useMemo(
    () => ({
      invoiceCount: analysis?.invoices?.length ?? 0,
      lineCount: stats?.lineCount ?? 0,
      matchedCount:
        (stats?.autoMatchedCount ?? 0) + (stats?.confirmedCount ?? 0) + (stats?.manualCount ?? 0),
      pendingCount: stats?.pendingCount ?? 0,
      summaryCount: stats?.summaryCount ?? 0,
    }),
    [analysis, stats],
  )

  // Determine which tab should be active
  const suggestedTab = useMemo(() => determineCurrentTab(stepStats), [stepStats])
  const currentTab = urlTab ?? suggestedTab

  // Auto-navigate to suggested tab on initial load (no URL tab)
  useEffect(() => {
    if (!isLoading && !urlTab && analysis) {
      setSearchParams({ tab: suggestedTab }, { replace: true })
    }
  }, [isLoading, urlTab, analysis, suggestedTab, setSearchParams])

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab })
  }

  // Mutations
  const consolidateMutation = trpc.summaries.consolidate.useMutation({
    onSuccess: () => {
      refetchSummaries()
      refetchStats()
    },
  })

  const updateSummaryMutation = trpc.summaries.update.useMutation({
    onSuccess: () => {
      refetchSummaries()
      refetchStats()
    },
  })

  const setMatchMutation = trpc.invoiceLines.setMatch.useMutation({
    onSuccess: () => {
      refetchLines()
      refetchSummaries()
      refetchStats()
    },
  })

  const resetMatchMutation = trpc.invoiceLines.resetMatch.useMutation({
    onSuccess: () => {
      refetchLines()
      refetchSummaries()
      refetchStats()
    },
  })

  const ignoreMutation = trpc.invoiceLines.ignore.useMutation({
    onSuccess: () => {
      refetchLines()
    },
  })

  const confirmMatchMutation = trpc.invoiceLines.confirmMatch.useMutation({
    onSuccess: () => {
      refetchLines()
    },
  })

  const matchAllMutation = trpc.invoiceLines.matchAll.useMutation({
    onSuccess: () => {
      refetchLines()
      refetchSummaries()
      refetchStats()
    },
  })

  // Calculate totals from summaries
  const totals = useMemo(() => {
    if (!summaries || summaries.length === 0) {
      return {
        currentTotal: 0,
        alboreTotal: 0,
        savingsTotal: 0,
        savingsPercentage: 0,
      }
    }

    const currentTotal = summaries.reduce(
      (sum: number, s: { avgMonthly: unknown }) => sum + Number(s.avgMonthly),
      0,
    )

    const alboreTotal = summaries.reduce(
      (
        sum: number,
        s: {
          ourPrice?: unknown
          avgQuantity?: unknown
          avgMonthly: unknown
          savingAmount?: unknown
        },
      ) => {
        const ourPrice = s.ourPrice ? Number(s.ourPrice) : null
        const avgQuantity = s.avgQuantity ? Number(s.avgQuantity) : null
        const avgMonthly = Number(s.avgMonthly)
        const savingAmount = s.savingAmount ? Number(s.savingAmount) : 0

        if (ourPrice !== null && avgQuantity !== null) {
          return sum + ourPrice * avgQuantity
        } else {
          return sum + (avgMonthly - savingAmount)
        }
      },
      0,
    )

    const savingsTotal = summaries.reduce(
      (sum: number, s: { savingAmount?: unknown }) => sum + Number(s.savingAmount ?? 0),
      0,
    )
    const savingsPercentage = currentTotal > 0 ? (savingsTotal / currentTotal) * 100 : 0

    return {
      currentTotal: Math.round(currentTotal * 100) / 100,
      alboreTotal: Math.round(alboreTotal * 100) / 100,
      savingsTotal: Math.round(savingsTotal * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 10) / 10,
    }
  }, [summaries])

  // Show sidebar only on consolide and proposition tabs
  const showSidebar = currentTab === 'consolide' || currentTab === 'proposition'

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-16 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!analysis) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold">Analyse non trouvee</h3>
              <p className="mb-6 text-muted-foreground">
                Cette analyse n'existe pas ou vous n'avez pas les droits d'acces
              </p>
              <Button onClick={() => navigate('/dashboard')}>Retour au dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 print:contents">
        {/* Header */}
        <div className="print:hidden">
          <AnalysisHeader
            analysis={analysis}
            onBackToClient={() => navigate(`/clients/${analysis.clientId}`)}
          />

          {/* Enhanced Tabs with Progress */}
          <div className="mb-6 flex space-x-1 rounded-lg bg-muted p-1">
            {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => {
              const config = TAB_CONFIG[tab]
              const Icon = config.icon
              const status = config.getStatus(stepStats)
              const count = config.getCount(stepStats)
              const isActive = currentTab === tab

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`transition-smooth flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {/* Status indicator */}
                  {status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                  ) : status === 'current' ? (
                    <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                      <div className="absolute h-2 w-2 animate-pulse rounded-full bg-primary" />
                      <Circle className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  )}

                  {/* Icon + Label */}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{config.label}</span>

                  {/* Count badge */}
                  {count && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                        status === 'completed'
                          ? 'bg-success/10 text-success'
                          : status === 'current'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`grid gap-6 print:contents ${showSidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
        >
          <div className={`${showSidebar ? 'lg:col-span-2' : ''} print:contents`}>
            {currentTab === 'data' && (
              <DataTab
                analysisId={id!}
                analysis={analysis}
                onProcessingComplete={() => setActiveTab('assignation')}
                refetchAnalysis={() => {
                  refetchAnalysis()
                  refetchStats()
                }}
              />
            )}

            {currentTab === 'assignation' && (
              <AssignmentTab
                analysisId={id!}
                invoiceLines={invoiceLines}
                services={services}
                onAssignService={(lineId, serviceId) =>
                  setMatchMutation.mutate({ lineId, serviceId })
                }
                onResetMatch={(lineId) => resetMatchMutation.mutate({ lineId })}
                onIgnoreLine={(lineId) => ignoreMutation.mutate({ lineId })}
                onConfirmMatch={(lineId) => confirmMatchMutation.mutate({ lineId })}
                onMatchAll={() => matchAllMutation.mutate({ analysisId: id! })}
                isAssigning={setMatchMutation.isPending}
                isResetting={resetMatchMutation.isPending}
                isIgnoring={ignoreMutation.isPending}
                isConfirming={confirmMatchMutation.isPending}
                isMatchingAll={matchAllMutation.isPending}
              />
            )}

            {currentTab === 'consolide' && (
              <ConsolidatedTab
                analysisId={id!}
                summaries={summaries}
                totals={totals}
                onConsolidate={() => consolidateMutation.mutate({ analysisId: id! })}
                onUpdateSummary={(summaryId, ourPrice) =>
                  updateSummaryMutation.mutate({ id: summaryId, data: { ourPrice } })
                }
                isConsolidating={consolidateMutation.isPending}
                isUpdating={updateSummaryMutation.isPending}
              />
            )}

            {currentTab === 'proposition' && (
              <ProposalTab analysisId={id!} hasSummaries={!!summaries && summaries.length > 0} />
            )}
          </div>

          {/* Sidebar - only on consolide and proposition tabs */}
          {showSidebar && (
            <div className="print:hidden">
              <SavingsSidebar
                currentTotal={totals.currentTotal}
                alboreTotal={totals.alboreTotal}
                savingsTotal={totals.savingsTotal}
                savingsPercentage={totals.savingsPercentage}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
