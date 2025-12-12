import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, FileText, Plus, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false)
  const [newAnalysisName, setNewAnalysisName] = useState('')

  const { data: client, isLoading: isLoadingClient } = trpc.clients.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    refetch: refetchAnalyses,
  } = trpc.analyses.list.useQuery({ clientId: id! }, { enabled: !!id })

  const createAnalysisMutation = trpc.analyses.create.useMutation({
    onSuccess: (analysis) => {
      setIsCreatingAnalysis(false)
      setNewAnalysisName('')
      refetchAnalyses()
      navigate(`/analyses/${analysis.id}/upload`)
    },
  })

  const handleCreateAnalysis = () => {
    if (!newAnalysisName.trim() || !id) return
    createAnalysisMutation.mutate({
      clientId: id,
      name: newAnalysisName.trim(),
    })
  }

  if (isLoadingClient) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <Card>
              <CardContent className="p-6">
                <div className="h-24 rounded bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold">Client non trouve</h3>
              <p className="mb-6 text-muted-foreground">
                Ce client n'existe pas ou vous n'avez pas les droits d'acces
              </p>
              <Button onClick={() => navigate('/clients')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux clients
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux clients
        </Button>

        {/* Client Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold">{client.name}</h1>
                <div className="space-y-1">
                  {client.company && (
                    <div className="flex items-center text-muted-foreground">
                      <Building2 className="mr-2 h-4 w-4" />
                      {client.company}
                    </div>
                  )}
                  {client.contactEmail && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {client.contactEmail}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsCreatingAnalysis(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle analyse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Analysis Form */}
        {isCreatingAnalysis && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Nouvelle analyse</CardTitle>
              <CardDescription>Creez une nouvelle analyse pour ce client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom de l'analyse *</label>
                  <Input
                    placeholder="Ex: Analyse telecom Q4 2024"
                    value={newAnalysisName}
                    onChange={(e) => setNewAnalysisName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCreateAnalysis}
                    disabled={!newAnalysisName.trim() || createAnalysisMutation.isPending}
                  >
                    {createAnalysisMutation.isPending ? 'Creation...' : 'Creer et commencer'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingAnalysis(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyses List */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Analyses</h2>

          {isLoadingAnalyses ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex animate-pulse items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 h-5 w-1/3 rounded bg-muted" />
                        <div className="h-4 w-1/4 rounded bg-muted" />
                      </div>
                      <div className="h-8 w-24 rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyses && analyses.length > 0 ? (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(`/analyses/${analysis.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{analysis.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                analysis.status === 'COMPLETED'
                                  ? 'bg-success/10 text-success'
                                  : analysis.status === 'DRAFT'
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-warning/10 text-warning'
                              }`}
                            >
                              {analysis.status}
                            </span>
                            <span>{analysis._count.invoices} facture(s)</span>
                            <span>
                              Mis a jour le{' '}
                              {new Date(analysis.updatedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Aucune analyse pour ce client</h3>
                <p className="mb-6 text-muted-foreground">
                  Commencez par creer une analyse pour analyser les factures de ce client
                </p>
                <Button onClick={() => setIsCreatingAnalysis(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Creer une analyse
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
