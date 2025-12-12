import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function CreateAnalysisPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'client' | 'analysis'>('client')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [analysisName, setAnalysisName] = useState('')
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientCompany, setNewClientCompany] = useState('')

  const {
    data: clients,
    isLoading: isLoadingClients,
    refetch: refetchClients,
  } = trpc.clients.list.useQuery()

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: (client) => {
      setSelectedClientId(client.id)
      setIsCreatingClient(false)
      setNewClientName('')
      setNewClientCompany('')
      refetchClients()
      setStep('analysis')
    },
  })

  const createAnalysisMutation = trpc.analyses.create.useMutation({
    onSuccess: (analysis) => {
      navigate(`/analyses/${analysis.id}/upload`)
    },
  })

  const handleCreateClient = () => {
    if (!newClientName.trim()) return
    createClientMutation.mutate({
      name: newClientName.trim(),
      company: newClientCompany.trim() || undefined,
    })
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId)
    setStep('analysis')
  }

  const handleCreateAnalysis = () => {
    if (!analysisName.trim() || !selectedClientId) return
    createAnalysisMutation.mutate({
      clientId: selectedClientId,
      name: analysisName.trim(),
    })
  }

  const selectedClient = clients?.find((c) => c.id === selectedClientId)

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">Nouvelle analyse</h1>
          <p className="text-lg text-muted-foreground">
            Selectionnez un client ou creez-en un nouveau pour commencer l'analyse
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center">
          <div
            className={`flex items-center ${step === 'client' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'client' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Client</span>
          </div>
          <div className="mx-4 h-0.5 w-16 bg-muted" />
          <div
            className={`flex items-center ${step === 'analysis' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'analysis' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Analyse</span>
          </div>
        </div>

        {step === 'client' && (
          <>
            {/* Create New Client */}
            {isCreatingClient ? (
              <Card className="mb-6 border-primary">
                <CardHeader>
                  <CardTitle>Nouveau client</CardTitle>
                  <CardDescription>
                    Ajoutez un nouveau client pour commencer une analyse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nom du client *</label>
                      <Input
                        placeholder="Ex: Jean Dupont"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Entreprise</label>
                      <Input
                        placeholder="Ex: Dupont SAS"
                        value={newClientCompany}
                        onChange={(e) => setNewClientCompany(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleCreateClient}
                        disabled={!newClientName.trim() || createClientMutation.isPending}
                      >
                        {createClientMutation.isPending ? 'Creation...' : 'Creer et continuer'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreatingClient(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Button
                    variant="outline"
                    className="h-16 w-full border-dashed"
                    onClick={() => setIsCreatingClient(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Creer un nouveau client
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Existing Clients */}
            <h2 className="mb-4 text-xl font-semibold">Ou selectionnez un client existant</h2>

            {isLoadingClients ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex animate-pulse items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div className="flex-1">
                          <div className="mb-2 h-4 w-1/3 rounded bg-muted" />
                          <div className="h-3 w-1/4 rounded bg-muted" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : clients && clients.length > 0 ? (
              <div className="space-y-3">
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className="card-hover cursor-pointer"
                    onClick={() => handleSelectClient(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{client.name}</h3>
                            {client.company && (
                              <p className="text-sm text-muted-foreground">{client.company}</p>
                            )}
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
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucun client existant. Creez votre premier client ci-dessus.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {step === 'analysis' && (
          <Card>
            <CardHeader>
              <CardTitle>Creer l'analyse</CardTitle>
              <CardDescription>
                Client selectionne:{' '}
                <strong>
                  {selectedClient?.name}
                  {selectedClient?.company && ` (${selectedClient.company})`}
                </strong>
                <Button
                  variant="link"
                  className="ml-2 h-auto p-0"
                  onClick={() => setStep('client')}
                >
                  Changer
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom de l'analyse *</label>
                  <Input
                    placeholder="Ex: Analyse telecom Q4 2024"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCreateAnalysis}
                    disabled={!analysisName.trim() || createAnalysisMutation.isPending}
                    className="flex items-center"
                  >
                    {createAnalysisMutation.isPending ? (
                      'Creation...'
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Creer et uploader une facture
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setStep('client')}>
                    Retour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
