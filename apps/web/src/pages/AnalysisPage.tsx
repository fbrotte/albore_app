import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Upload,
  BarChart3,
  FileOutput,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-muted text-muted-foreground', icon: Clock },
  IMPORTING: { label: 'Import en cours', color: 'bg-warning/10 text-warning', icon: Upload },
  MATCHING: { label: 'Matching', color: 'bg-primary/10 text-primary', icon: BarChart3 },
  REVIEW: { label: 'En revue', color: 'bg-warning/10 text-warning', icon: AlertCircle },
  COMPLETED: { label: 'Termine', color: 'bg-success/10 text-success', icon: CheckCircle },
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: analysis, isLoading } = trpc.analyses.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  const { data: stats } = trpc.analyses.getStats.useQuery({ id: id! }, { enabled: !!id })

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
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const statusInfo = statusConfig[analysis.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/clients/${analysis.clientId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au client
        </Button>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{analysis.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
              >
                <StatusIcon className="mr-1 h-4 w-4" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              Client: <strong>{analysis.client?.name}</strong>
              {analysis.client?.company && ` (${analysis.client.company})`}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate(`/analyses/${id}/upload`)}>
              <Upload className="mr-2 h-4 w-4" />
              Ajouter une facture
            </Button>
            <Button onClick={() => navigate(`/analyses/${id}/results`)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Voir les resultats
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.invoiceCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Factures</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-success/10 p-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(stats?.autoMatchedCount ?? 0) + (stats?.confirmedCount ?? 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Lignes matchees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-warning/10 p-3">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-success/10 p-3">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {(stats?.totalSavings ?? 0).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-sm text-muted-foreground">Economies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Etapes de l'analyse</CardTitle>
            <CardDescription>
              Suivez les etapes pour completer l'analyse de vos factures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Step 1: Upload */}
              <div
                className={`transition-smooth cursor-pointer rounded-lg border-2 p-4 ${
                  analysis.invoices && analysis.invoices.length > 0
                    ? 'border-success bg-success/5'
                    : 'border-primary bg-primary/5 hover:bg-primary/10'
                }`}
                onClick={() => navigate(`/analyses/${id}/upload`)}
              >
                <div className="mb-2 flex items-center space-x-3">
                  <div
                    className={`rounded-full p-2 ${
                      analysis.invoices && analysis.invoices.length > 0
                        ? 'bg-success/20'
                        : 'bg-primary/20'
                    }`}
                  >
                    {analysis.invoices && analysis.invoices.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Upload className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <span className="font-medium">1. Upload</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.invoices && analysis.invoices.length > 0
                    ? `${analysis.invoices.length} facture(s) uploadee(s)`
                    : 'Uploadez vos factures PDF'}
                </p>
              </div>

              {/* Step 2: Extraction */}
              <div
                className={`rounded-lg border-2 p-4 ${
                  stats && stats.lineCount > 0
                    ? 'border-success bg-success/5'
                    : 'border-muted bg-muted/50'
                }`}
              >
                <div className="mb-2 flex items-center space-x-3">
                  <div
                    className={`rounded-full p-2 ${
                      stats && stats.lineCount > 0 ? 'bg-success/20' : 'bg-muted'
                    }`}
                  >
                    {stats && stats.lineCount > 0 ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium">2. Extraction</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats && stats.lineCount > 0
                    ? `${stats.lineCount} lignes extraites`
                    : 'Extraction automatique'}
                </p>
              </div>

              {/* Step 3: Matching */}
              <div
                className={`transition-smooth cursor-pointer rounded-lg border-2 p-4 ${
                  stats && (stats.autoMatchedCount > 0 || stats.confirmedCount > 0)
                    ? 'border-success bg-success/5'
                    : 'border-muted bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => navigate(`/analyses/${id}/results`)}
              >
                <div className="mb-2 flex items-center space-x-3">
                  <div
                    className={`rounded-full p-2 ${
                      stats && (stats.autoMatchedCount > 0 || stats.confirmedCount > 0)
                        ? 'bg-success/20'
                        : 'bg-muted'
                    }`}
                  >
                    {stats && (stats.autoMatchedCount > 0 || stats.confirmedCount > 0) ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium">3. Matching</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats && (stats.autoMatchedCount > 0 || stats.confirmedCount > 0)
                    ? `${stats.autoMatchedCount + stats.confirmedCount} matches`
                    : 'Comparaison tarifaire'}
                </p>
              </div>

              {/* Step 4: Proposal */}
              <div
                className={`transition-smooth cursor-pointer rounded-lg border-2 p-4 ${
                  stats && stats.summaryCount > 0
                    ? 'border-success bg-success/5'
                    : 'border-muted bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => navigate(`/analyses/${id}/proposal`)}
              >
                <div className="mb-2 flex items-center space-x-3">
                  <div
                    className={`rounded-full p-2 ${
                      stats && stats.summaryCount > 0 ? 'bg-success/20' : 'bg-muted'
                    }`}
                  >
                    {stats && stats.summaryCount > 0 ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <FileOutput className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium">4. Proposition</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats && stats.summaryCount > 0 ? 'Proposition prete' : 'Generer la proposition'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        {analysis.invoices && analysis.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Factures uploadees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg bg-muted p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.vendorName} - {invoice.lines?.length ?? 0} lignes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {invoice.totalHt
                          ? `${Number(invoice.totalHt).toLocaleString('fr-FR')} € HT`
                          : '-'}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          invoice.extractionStatus === 'COMPLETED'
                            ? 'bg-success/10 text-success'
                            : invoice.extractionStatus === 'ERROR'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {invoice.extractionStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
