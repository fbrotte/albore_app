import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Edit2,
  X,
  RefreshCw,
  List,
  Search,
  Link2,
  Unlink,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface InvoiceLine {
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
  matchCandidates?: Array<{ serviceId: string; serviceName: string; score: number }> | null
  matchConfidence?: number | null
}

interface ServiceOption {
  id: string
  name: string
  category?: { name: string } | null
}

interface AssignmentTabProps {
  analysisId: string
  invoiceLines: InvoiceLine[] | undefined
  services: ServiceOption[] | undefined
  onAssignService: (lineId: string, serviceId: string) => void
  onResetMatch: (lineId: string) => void
  onIgnoreLine: (lineId: string) => void
  onConfirmMatch: (lineId: string) => void
  onMatchAll: () => void
  isAssigning: boolean
  isResetting: boolean
  isIgnoring: boolean
  isConfirming: boolean
  isMatchingAll: boolean
}

function getMatchStatusBadge(status: string) {
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

function LineWithCandidates({
  line,
  assigningLine,
  setAssigningLine,
  serviceSearch,
  setServiceSearch,
  filteredServices,
  handleAssignService,
  handleIgnoreLine,
  isAssigning,
  isIgnoring,
}: {
  line: InvoiceLine
  assigningLine: string | null
  setAssigningLine: (id: string | null) => void
  serviceSearch: string
  setServiceSearch: (s: string) => void
  filteredServices: ServiceOption[]
  handleAssignService: (lineId: string, serviceId: string) => void
  handleIgnoreLine: (lineId: string) => void
  isAssigning: boolean
  isIgnoring: boolean
}) {
  const candidates = line.matchCandidates ?? []

  return (
    <div className="transition-smooth rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {getMatchStatusBadge(line.matchStatus)}
            <span className="text-xs text-muted-foreground">
              {line.invoice?.invoiceNumber ?? 'Facture'}
            </span>
          </div>
          <p className="mb-2 text-sm font-medium" title={line.description}>
            {line.description}
          </p>

          {assigningLine !== line.id && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.serviceId}
                    onClick={() => handleAssignService(line.id, candidate.serviceId)}
                    disabled={isAssigning}
                    className="transition-smooth inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs hover:border-primary hover:bg-primary/10"
                  >
                    <span className="font-medium">{candidate.serviceName}</span>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {Math.round(candidate.score * 100)}%
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setAssigningLine(line.id)}
                  className="transition-smooth inline-flex items-center gap-1 rounded-full border border-muted px-3 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  <Search className="h-3 w-3" />
                  Autre...
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold">{Number(line.totalHt).toLocaleString('fr-FR')} €</p>
          {line.quantity !== null &&
            line.quantity !== undefined &&
            Number(line.quantity) > 1 &&
            line.unitPrice !== null &&
            line.unitPrice !== undefined && (
              <p className="text-xs text-muted-foreground">
                {Number(line.quantity)} x {Number(line.unitPrice).toLocaleString('fr-FR')} €
              </p>
            )}
        </div>
      </div>

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
              <p className="py-2 text-center text-sm text-muted-foreground">Aucun service trouve</p>
            ) : (
              filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleAssignService(line.id, service.id)}
                  className="transition-smooth w-full rounded p-2 text-left text-sm hover:bg-primary/10"
                  disabled={isAssigning}
                >
                  <span className="font-medium">{service.name}</span>
                  {service.category && (
                    <span className="ml-2 text-muted-foreground">{service.category.name}</span>
                  )}
                </button>
              ))
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

      {assigningLine !== line.id && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIgnoreLine(line.id)}
            disabled={isIgnoring}
          >
            <X className="mr-1 h-3 w-3" />
            Ignorer
          </Button>
        </div>
      )}
    </div>
  )
}

function LineCard({
  line,
  assigningLine,
  setAssigningLine,
  serviceSearch,
  setServiceSearch,
  filteredServices,
  handleAssignService,
  handleIgnoreLine,
  handleConfirmMatch,
  handleResetMatch,
  isAssigning,
  isIgnoring,
  isConfirming,
  isResetting,
}: {
  line: InvoiceLine
  assigningLine: string | null
  setAssigningLine: (id: string | null) => void
  serviceSearch: string
  setServiceSearch: (s: string) => void
  filteredServices: ServiceOption[]
  handleAssignService: (lineId: string, serviceId: string) => void
  handleIgnoreLine: (lineId: string) => void
  handleConfirmMatch: (lineId: string) => void
  handleResetMatch: (lineId: string) => void
  isAssigning: boolean
  isIgnoring: boolean
  isConfirming: boolean
  isResetting: boolean
}) {
  return (
    <div
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
            {line.matchConfidence && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {Math.round(line.matchConfidence * 100)}%
              </span>
            )}
          </div>
          <p className="mb-1 truncate text-sm font-medium" title={line.description}>
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
          <p className="font-semibold">{Number(line.totalHt).toLocaleString('fr-FR')} €</p>
          {line.quantity !== null &&
            line.quantity !== undefined &&
            Number(line.quantity) > 1 &&
            line.unitPrice !== null &&
            line.unitPrice !== undefined && (
              <p className="text-xs text-muted-foreground">
                {Number(line.quantity)} x {Number(line.unitPrice).toLocaleString('fr-FR')} €
              </p>
            )}
        </div>
      </div>

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
              <p className="py-2 text-center text-sm text-muted-foreground">Aucun service trouve</p>
            ) : (
              filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleAssignService(line.id, service.id)}
                  className="transition-smooth w-full rounded p-2 text-left text-sm hover:bg-primary/10"
                  disabled={isAssigning}
                >
                  <span className="font-medium">{service.name}</span>
                  {service.category && (
                    <span className="ml-2 text-muted-foreground">{service.category.name}</span>
                  )}
                </button>
              ))
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

      {assigningLine !== line.id && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {line.matchStatus === 'PENDING' && (
            <>
              <Button variant="default" size="sm" onClick={() => setAssigningLine(line.id)}>
                <Link2 className="mr-1 h-3 w-3" />
                Assigner
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleIgnoreLine(line.id)}
                disabled={isIgnoring}
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
                disabled={isConfirming}
              >
                <Check className="mr-1 h-3 w-3" />
                Confirmer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAssigningLine(line.id)}>
                <Edit2 className="mr-1 h-3 w-3" />
                Modifier
              </Button>
            </>
          )}
          {(line.matchStatus === 'CONFIRMED' || line.matchStatus === 'MANUAL') && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setAssigningLine(line.id)}>
                <Edit2 className="mr-1 h-3 w-3" />
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetMatch(line.id)}
                disabled={isResetting}
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
              disabled={isResetting}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Reactiver
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function AssignmentTab({
  analysisId,
  invoiceLines,
  services,
  onAssignService,
  onResetMatch,
  onIgnoreLine,
  onConfirmMatch,
  onMatchAll,
  isAssigning,
  isResetting,
  isIgnoring,
  isConfirming,
  isMatchingAll,
}: AssignmentTabProps) {
  const [assigningLine, setAssigningLine] = useState<string | null>(null)
  const [serviceSearch, setServiceSearch] = useState('')
  const hasMatchedRef = useRef(false)
  const lastAnalysisIdRef = useRef(analysisId)

  // Check if there are pending lines that need matching (no candidates)
  const pendingWithoutCandidates = useMemo(() => {
    if (!invoiceLines) return 0
    return invoiceLines.filter(
      (l) => l.matchStatus === 'PENDING' && (!l.matchCandidates || l.matchCandidates.length === 0),
    ).length
  }, [invoiceLines])

  // Auto-trigger matching on mount if there are pending lines without candidates
  useEffect(() => {
    // Reset if analysis changed
    if (lastAnalysisIdRef.current !== analysisId) {
      hasMatchedRef.current = false
      lastAnalysisIdRef.current = analysisId
    }

    // Only match once per tab visit, and only if needed
    if (
      !hasMatchedRef.current &&
      !isMatchingAll &&
      invoiceLines &&
      invoiceLines.length > 0 &&
      pendingWithoutCandidates > 0
    ) {
      hasMatchedRef.current = true
      onMatchAll()
    }
  }, [analysisId, invoiceLines, pendingWithoutCandidates, isMatchingAll, onMatchAll])

  const filteredServices = useMemo((): ServiceOption[] => {
    if (!services) return []
    if (!serviceSearch.trim()) return services
    const search = serviceSearch.toLowerCase()
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(search) || s.category?.name.toLowerCase().includes(search),
    )
  }, [services, serviceSearch])

  const lineStats = useMemo(() => {
    if (!invoiceLines) return { total: 0, matched: 0, unmatched: 0, ignored: 0 }
    const matched = invoiceLines.filter(
      (l) =>
        l.matchStatus === 'AUTO' || l.matchStatus === 'CONFIRMED' || l.matchStatus === 'MANUAL',
    ).length
    const ignored = invoiceLines.filter((l) => l.matchStatus === 'IGNORED').length
    return {
      total: invoiceLines.length,
      matched,
      unmatched: invoiceLines.length - matched - ignored,
      ignored,
    }
  }, [invoiceLines])

  const groupedLines = useMemo((): {
    matched: InvoiceLine[]
    withCandidates: InvoiceLine[]
    withoutCandidates: InvoiceLine[]
    ignored: InvoiceLine[]
  } => {
    if (!invoiceLines)
      return { matched: [], withCandidates: [], withoutCandidates: [], ignored: [] }

    const matched = invoiceLines.filter(
      (l) =>
        l.matchStatus === 'AUTO' || l.matchStatus === 'CONFIRMED' || l.matchStatus === 'MANUAL',
    )
    const ignored = invoiceLines.filter((l) => l.matchStatus === 'IGNORED')
    const pending = invoiceLines.filter((l) => l.matchStatus === 'PENDING')

    const withCandidates = pending.filter((l) => l.matchCandidates && l.matchCandidates.length > 0)
    const withoutCandidates = pending.filter(
      (l) => !l.matchCandidates || l.matchCandidates.length === 0,
    )

    return { matched, withCandidates, withoutCandidates, ignored }
  }, [invoiceLines])

  const handleAssignService = (lineId: string, serviceId: string) => {
    onAssignService(lineId, serviceId)
    setAssigningLine(null)
    setServiceSearch('')
  }

  // Loading state while matching
  if (isMatchingAll) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Sparkles className="mb-4 h-12 w-12 animate-pulse text-primary" />
          <h3 className="mb-2 font-semibold">Analyse en cours...</h3>
          <p className="text-muted-foreground">Recherche des correspondances pour vos lignes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Lignes extraites des factures
          </div>
          <div className="flex items-center space-x-2 text-sm font-normal">
            <span className="text-success">{lineStats.matched} assignees</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-destructive">{lineStats.unmatched} a assigner</span>
            {lineStats.ignored > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{lineStats.ignored} ignorees</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!invoiceLines || invoiceLines.length === 0 ? (
          <div className="py-8 text-center">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune ligne de facture extraite</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Uploadez des factures dans l'onglet "Donnees" pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedLines.withCandidates.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center text-sm font-medium text-warning">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggestions disponibles ({groupedLines.withCandidates.length})
                </h4>
                <div className="space-y-3">
                  {groupedLines.withCandidates.map((line) => (
                    <LineWithCandidates
                      key={line.id}
                      line={line}
                      assigningLine={assigningLine}
                      setAssigningLine={setAssigningLine}
                      serviceSearch={serviceSearch}
                      setServiceSearch={setServiceSearch}
                      filteredServices={filteredServices}
                      handleAssignService={handleAssignService}
                      handleIgnoreLine={onIgnoreLine}
                      isAssigning={isAssigning}
                      isIgnoring={isIgnoring}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedLines.withoutCandidates.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center text-sm font-medium text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Assignation manuelle requise ({groupedLines.withoutCandidates.length})
                </h4>
                <div className="space-y-3">
                  {groupedLines.withoutCandidates.map((line) => (
                    <LineCard
                      key={line.id}
                      line={line}
                      assigningLine={assigningLine}
                      setAssigningLine={setAssigningLine}
                      serviceSearch={serviceSearch}
                      setServiceSearch={setServiceSearch}
                      filteredServices={filteredServices}
                      handleAssignService={handleAssignService}
                      handleIgnoreLine={onIgnoreLine}
                      handleConfirmMatch={onConfirmMatch}
                      handleResetMatch={onResetMatch}
                      isAssigning={isAssigning}
                      isIgnoring={isIgnoring}
                      isConfirming={isConfirming}
                      isResetting={isResetting}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedLines.matched.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center text-sm font-medium text-success">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Lignes assignees ({groupedLines.matched.length})
                </h4>
                <div className="space-y-3">
                  {groupedLines.matched.map((line) => (
                    <LineCard
                      key={line.id}
                      line={line}
                      assigningLine={assigningLine}
                      setAssigningLine={setAssigningLine}
                      serviceSearch={serviceSearch}
                      setServiceSearch={setServiceSearch}
                      filteredServices={filteredServices}
                      handleAssignService={handleAssignService}
                      handleIgnoreLine={onIgnoreLine}
                      handleConfirmMatch={onConfirmMatch}
                      handleResetMatch={onResetMatch}
                      isAssigning={isAssigning}
                      isIgnoring={isIgnoring}
                      isConfirming={isConfirming}
                      isResetting={isResetting}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedLines.ignored.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center text-sm font-medium text-muted-foreground">
                  <X className="mr-2 h-4 w-4" />
                  Lignes ignorees ({groupedLines.ignored.length})
                </h4>
                <div className="space-y-3">
                  {groupedLines.ignored.map((line) => (
                    <LineCard
                      key={line.id}
                      line={line}
                      assigningLine={assigningLine}
                      setAssigningLine={setAssigningLine}
                      serviceSearch={serviceSearch}
                      setServiceSearch={setServiceSearch}
                      filteredServices={filteredServices}
                      handleAssignService={handleAssignService}
                      handleIgnoreLine={onIgnoreLine}
                      handleConfirmMatch={onConfirmMatch}
                      handleResetMatch={onResetMatch}
                      isAssigning={isAssigning}
                      isIgnoring={isIgnoring}
                      isConfirming={isConfirming}
                      isResetting={isResetting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
