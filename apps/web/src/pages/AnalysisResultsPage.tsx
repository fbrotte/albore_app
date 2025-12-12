import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  FileText,
  Euro,
  TrendingDown,
  Edit2,
  PieChart,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  List,
  Layers,
  Search,
  Link2,
  Unlink,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

type TabType = 'lines' | 'summaries'

export default function AnalysisResultsPage() {
  const { id: analysisId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('lines')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [assigningLine, setAssigningLine] = useState<string | null>(null)
  const [serviceSearch, setServiceSearch] = useState('')

  const { data: analysis, isLoading } = trpc.analyses.getById.useQuery(
    { id: analysisId! },
    { enabled: !!analysisId },
  )

  const { data: invoiceLines, refetch: refetchLines } = trpc.invoiceLines.listByAnalysis.useQuery(
    { analysisId: analysisId! },
    { enabled: !!analysisId },
  )

  const { data: summaries, refetch: refetchSummaries } = trpc.summaries.list.useQuery(
    { analysisId: analysisId! },
    { enabled: !!analysisId },
  )

  const { data: services } = trpc.catalog.services.list.useQuery()

  const consolidateMutation = trpc.summaries.consolidate.useMutation({
    onSuccess: () => {
      refetchSummaries()
    },
  })

  const updateSummaryMutation = trpc.summaries.update.useMutation({
    onSuccess: () => {
      setEditingItem(null)
      refetchSummaries()
    },
  })

  const setMatchMutation = trpc.invoiceLines.setMatch.useMutation({
    onSuccess: () => {
      setAssigningLine(null)
      setServiceSearch('')
      refetchLines()
      refetchSummaries()
    },
  })

  const resetMatchMutation = trpc.invoiceLines.resetMatch.useMutation({
    onSuccess: () => {
      refetchLines()
      refetchSummaries()
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
    },
  })

  const handleEditItem = (summaryId: string, currentPrice: number | null) => {
    setEditingItem(summaryId)
    setEditValue(currentPrice?.toString() ?? '')
  }

  const handleSaveItem = (summaryId: string) => {
    const newPrice = parseFloat(editValue)
    if (!isNaN(newPrice)) {
      updateSummaryMutation.mutate({
        id: summaryId,
        data: { ourPrice: newPrice },
      })
    } else {
      setEditingItem(null)
    }
  }

  const handleConsolidate = () => {
    if (analysisId) {
      consolidateMutation.mutate({ analysisId })
    }
  }

  const handleAssignService = (lineId: string, serviceId: string) => {
    setMatchMutation.mutate({ lineId, serviceId })
  }

  const handleResetMatch = (lineId: string) => {
    resetMatchMutation.mutate({ lineId })
  }

  const handleIgnoreLine = (lineId: string) => {
    ignoreMutation.mutate({ lineId })
  }

  const handleConfirmMatch = (lineId: string) => {
    confirmMatchMutation.mutate({ lineId })
  }

  const handleMatchAll = () => {
    if (analysisId) {
      matchAllMutation.mutate({ analysisId })
    }
  }

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!services) return []
    if (!serviceSearch.trim()) return services
    const search = serviceSearch.toLowerCase()
    return services.filter(
      (s: { name: string; description?: string | null; category?: { name: string } | null }) =>
        s.name.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search) ||
        s.category?.name.toLowerCase().includes(search),
    )
  }, [services, serviceSearch])

  // Calculate totals from summaries
  const totals = useMemo(() => {
    if (!summaries || summaries.length === 0) {
      return {
        currentTotal: 0,
        alboreTotal: 0,
        savingsTotal: 0,
        savingsPercentage: 0,
        monthlySavings: 0,
        annualSavings: 0,
      }
    }

    const currentTotal = summaries.reduce(
      (sum: number, s: { avgMonthly: unknown }) => sum + Number(s.avgMonthly),
      0,
    )
    const alboreTotal = summaries.reduce(
      (sum: number, s: { ourPrice?: unknown; avgMonthly: unknown }) =>
        sum + (s.ourPrice ? Number(s.ourPrice) : Number(s.avgMonthly)),
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
      monthlySavings: Math.round(savingsTotal * 100) / 100,
      annualSavings: Math.round(savingsTotal * 12 * 100) / 100,
    }
  }, [summaries])

  // Stats for lines
  const lineStats = useMemo(() => {
    if (!invoiceLines) return { total: 0, matched: 0, unmatched: 0, ignored: 0 }
    const matched = invoiceLines.filter(
      (l: { matchStatus: string }) =>
        l.matchStatus === 'AUTO' || l.matchStatus === 'CONFIRMED' || l.matchStatus === 'MANUAL',
    ).length
    const ignored = invoiceLines.filter(
      (l: { matchStatus: string }) => l.matchStatus === 'IGNORED',
    ).length
    return {
      total: invoiceLines.length,
      matched,
      unmatched: invoiceLines.length - matched - ignored,
      ignored,
    }
  }, [invoiceLines])

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirme
          </span>
        )
      case 'AUTO':
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Link2 className="mr-1 h-3 w-3" />
            Auto
          </span>
        )
      case 'MANUAL':
        return (
          <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            <Edit2 className="mr-1 h-3 w-3" />
            Manuel
          </span>
        )
      case 'IGNORED':
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <X className="mr-1 h-3 w-3" />
            Ignore
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Non assigne
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <Card>
              <CardContent className="p-6">
                <div className="h-32 rounded bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(`/analyses/${analysisId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour a l'analyse
          </Button>
          <h1 className="mb-2 text-4xl font-bold">Resultats de l'analyse</h1>
          <p className="text-lg text-muted-foreground">
            Verifiez les lignes extraites et ajustez les assignations
          </p>
        </div>

        {/* Client Info Card */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-card p-3">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="text-lg font-semibold">{analysis?.client?.name ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-card p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Analyse</p>
                  <p className="text-lg font-semibold">{analysis?.name ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-card p-3">
                  <List className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lignes extraites</p>
                  <p className="text-lg font-semibold">
                    {lineStats.matched}/{lineStats.total} assignees
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-card p-3">
                  <Euro className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant actuel</p>
                  <p className="text-lg font-semibold">
                    {totals.currentTotal.toLocaleString('fr-FR')} € / mois
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveTab('lines')}
                className={`transition-smooth flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === 'lines'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Lignes de facture ({invoiceLines?.length ?? 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('summaries')}
                className={`transition-smooth flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === 'summaries'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Postes consolides ({summaries?.length ?? 0})</span>
              </button>
            </div>

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <List className="mr-2 h-5 w-5 text-primary" />
                      Lignes extraites des factures
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm font-normal">
                        <span className="text-success">{lineStats.matched} assignees</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-destructive">{lineStats.unmatched} a assigner</span>
                        {lineStats.ignored > 0 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {lineStats.ignored} ignorees
                            </span>
                          </>
                        )}
                      </div>
                      {lineStats.unmatched > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMatchAll}
                          disabled={matchAllMutation.isPending}
                        >
                          {matchAllMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Matching...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Matching auto
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!invoiceLines || invoiceLines.length === 0 ? (
                    <div className="py-8 text-center">
                      <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune ligne de facture extraite</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate(`/analyses/${analysisId}/upload`)}
                      >
                        Ajouter une facture
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoiceLines.map(
                        (line: {
                          id: string
                          matchStatus: string
                          description: string
                          totalHt: unknown
                          quantity?: number | null
                          unitPrice?: unknown
                          invoice?: { invoiceNumber?: string | null } | null
                          matchedService?: {
                            name: string
                            category?: { name: string } | null
                          } | null
                        }) => (
                          <div
                            key={line.id}
                            className={`transition-smooth rounded-lg border p-4 ${
                              line.matchStatus === 'PENDING'
                                ? 'border-destructive/30 bg-destructive/5'
                                : line.matchStatus === 'IGNORED'
                                  ? 'border-muted bg-muted/30 opacity-60'
                                  : 'border-muted hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  {getMatchStatusBadge(line.matchStatus)}
                                  <span className="text-xs text-muted-foreground">
                                    {line.invoice?.invoiceNumber ?? 'Facture'}
                                  </span>
                                </div>
                                <p
                                  className="mb-1 truncate text-sm font-medium"
                                  title={line.description}
                                >
                                  {line.description}
                                </p>
                                {line.matchedService && (
                                  <p className="flex items-center text-xs text-primary">
                                    <Link2 className="mr-1 h-3 w-3" />
                                    {line.matchedService.name}
                                    {line.matchedService.category && (
                                      <span className="ml-1 text-muted-foreground">
                                        ({line.matchedService.category.name})
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-semibold">
                                  {Number(line.totalHt).toLocaleString('fr-FR')} €
                                </p>
                                {line.quantity !== null &&
                                  line.quantity !== undefined &&
                                  Number(line.quantity) > 1 &&
                                  line.unitPrice !== null &&
                                  line.unitPrice !== undefined && (
                                    <p className="text-xs text-muted-foreground">
                                      {Number(line.quantity)} x{' '}
                                      {Number(line.unitPrice).toLocaleString('fr-FR')} €
                                    </p>
                                  )}
                              </div>
                            </div>

                            {/* Assignment dropdown */}
                            {assigningLine === line.id && (
                              <div className="mt-3 rounded-lg bg-muted p-3">
                                <div className="relative mb-2">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="Rechercher un service..."
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    className="pl-9"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                  {filteredServices.length === 0 ? (
                                    <p className="py-2 text-center text-sm text-muted-foreground">
                                      Aucun service trouve
                                    </p>
                                  ) : (
                                    filteredServices.map(
                                      (service: {
                                        id: string
                                        name: string
                                        category?: { name: string } | null
                                      }) => (
                                        <button
                                          key={service.id}
                                          onClick={() => handleAssignService(line.id, service.id)}
                                          className="transition-smooth w-full rounded p-2 text-left text-sm hover:bg-primary/10"
                                          disabled={setMatchMutation.isPending}
                                        >
                                          <span className="font-medium">{service.name}</span>
                                          {service.category && (
                                            <span className="ml-2 text-muted-foreground">
                                              {service.category.name}
                                            </span>
                                          )}
                                        </button>
                                      ),
                                    )
                                  )}
                                </div>
                                <div className="mt-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAssigningLine(null)
                                      setServiceSearch('')
                                    }}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            {assigningLine !== line.id && (
                              <div className="mt-3 flex items-center justify-end gap-2">
                                {line.matchStatus === 'PENDING' && (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => setAssigningLine(line.id)}
                                    >
                                      <Link2 className="mr-1 h-3 w-3" />
                                      Assigner
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleIgnoreLine(line.id)}
                                      disabled={ignoreMutation.isPending}
                                    >
                                      <X className="mr-1 h-3 w-3" />
                                      Ignorer
                                    </Button>
                                  </>
                                )}
                                {line.matchStatus === 'AUTO' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleConfirmMatch(line.id)}
                                      disabled={confirmMatchMutation.isPending}
                                    >
                                      <Check className="mr-1 h-3 w-3" />
                                      Confirmer
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setAssigningLine(line.id)}
                                    >
                                      <Edit2 className="mr-1 h-3 w-3" />
                                      Modifier
                                    </Button>
                                  </>
                                )}
                                {(line.matchStatus === 'CONFIRMED' ||
                                  line.matchStatus === 'MANUAL') && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setAssigningLine(line.id)}
                                    >
                                      <Edit2 className="mr-1 h-3 w-3" />
                                      Modifier
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResetMatch(line.id)}
                                      disabled={resetMatchMutation.isPending}
                                    >
                                      <Unlink className="mr-1 h-3 w-3" />
                                      Retirer
                                    </Button>
                                  </>
                                )}
                                {line.matchStatus === 'IGNORED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleResetMatch(line.id)}
                                    disabled={resetMatchMutation.isPending}
                                  >
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Reactiver
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summaries Tab */}
            {activeTab === 'summaries' && (
              <>
                {/* Consolidate Button */}
                {(!summaries || summaries.length === 0) && (
                  <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="p-6 text-center">
                      <PieChart className="mx-auto mb-4 h-12 w-12 text-warning" />
                      <h3 className="mb-2 font-semibold">Consolidation requise</h3>
                      <p className="mb-4 text-muted-foreground">
                        Consolidez les donnees pour voir les resultats d'analyse
                      </p>
                      <Button onClick={handleConsolidate} disabled={consolidateMutation.isPending}>
                        {consolidateMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Consolidation...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Consolider les donnees
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Comparison Table */}
                {summaries && summaries.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center">
                        <PieChart className="mr-2 h-5 w-5 text-primary" />
                        Comparaison detaillee
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConsolidate}
                        disabled={consolidateMutation.isPending}
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${consolidateMutation.isPending ? 'animate-spin' : ''}`}
                        />
                        Recalculer
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2">
                              <th className="px-2 py-3 text-left text-sm font-semibold">
                                Poste de depense
                              </th>
                              <th className="px-2 py-3 text-right text-sm font-semibold">Actuel</th>
                              <th className="px-2 py-3 text-right text-sm font-semibold">
                                Offre Albore
                              </th>
                              <th className="px-2 py-3 text-right text-sm font-semibold">
                                Economie
                              </th>
                              <th className="px-2 py-3 text-center text-sm font-semibold">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaries.map(
                              (summary: {
                                id: string
                                avgMonthly: unknown
                                ourPrice?: unknown
                                customLabel?: string | null
                                matchedService?: { name: string } | null
                              }) => {
                                const current = Number(summary.avgMonthly)
                                const albore = summary.ourPrice ? Number(summary.ourPrice) : current
                                const savings = current - albore

                                return (
                                  <tr
                                    key={summary.id}
                                    className="transition-smooth border-b border-muted hover:bg-muted/50"
                                  >
                                    <td className="px-2 py-4 text-sm">
                                      {summary.matchedService?.name ??
                                        summary.customLabel ??
                                        'Service'}
                                    </td>
                                    <td className="px-2 py-4 text-right text-sm font-medium">
                                      {current.toLocaleString('fr-FR')} €
                                    </td>
                                    <td className="px-2 py-4 text-right text-sm">
                                      {editingItem === summary.id ? (
                                        <div className="flex items-center justify-end space-x-2">
                                          <Input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-24 text-right"
                                            autoFocus
                                          />
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleSaveItem(summary.id)}
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
                                          {albore.toLocaleString('fr-FR')} €
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 py-4 text-right text-sm">
                                      {savings > 0 ? (
                                        <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                          <TrendingDown className="mr-1 h-3 w-3" />-
                                          {savings.toLocaleString('fr-FR')} €
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
                                        title="Editer le prix"
                                      >
                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                      </button>
                                    </td>
                                  </tr>
                                )
                              },
                            )}

                            {/* Total Row */}
                            <tr className="bg-muted font-semibold">
                              <td className="px-2 py-4 text-sm">Total</td>
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
                )}
              </>
            )}
          </div>

          {/* Savings Summary Sidebar */}
          <div className="space-y-6">
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
                      {totals.monthlySavings.toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  <div className="rounded-lg bg-card p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Economie annuelle</p>
                    <p className="text-3xl font-bold text-success">
                      {totals.annualSavings.toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  <div className="rounded-lg bg-card p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Pourcentage d'economie</p>
                    <p className="text-3xl font-bold text-success">{totals.savingsPercentage}%</p>
                  </div>
                </div>

                {/* Visual Bar */}
                {totals.currentTotal > 0 && (
                  <div className="mt-6 rounded-lg bg-card p-4">
                    <p className="mb-3 text-sm text-muted-foreground">Repartition mensuelle</p>
                    <div className="flex h-8 overflow-hidden rounded-lg">
                      <div
                        className="flex items-center justify-center bg-primary text-xs font-medium text-primary-foreground"
                        style={{
                          width: `${(totals.alboreTotal / totals.currentTotal) * 100}%`,
                        }}
                      >
                        {totals.alboreTotal > 50 && `${totals.alboreTotal}€`}
                      </div>
                      <div
                        className="flex items-center justify-center bg-success text-xs font-medium text-success-foreground"
                        style={{
                          width: `${(totals.savingsTotal / totals.currentTotal) * 100}%`,
                        }}
                      >
                        {totals.savingsTotal > 50 && `-${totals.savingsTotal}€`}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate(`/analyses/${analysisId}/proposal`)}
                disabled={!summaries || summaries.length === 0}
              >
                <FileText className="mr-2 h-5 w-5" />
                Generer la proposition
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/analyses/${analysisId}/upload`)}
              >
                Ajouter une facture
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
