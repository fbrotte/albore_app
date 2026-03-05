import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Mail,
  FileText,
  Plus,
  Calendar,
  ArrowRight,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false)
  const [newAnalysisName, setNewAnalysisName] = useState('')

  // Edit client state
  const [isEditingClient, setIsEditingClient] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editEmail, setEditEmail] = useState('')

  // Delete client state
  const [isDeletingClient, setIsDeletingClient] = useState(false)

  // Delete analysis state
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null)

  const { data: client, isLoading: isLoadingClient } = trpc.clients.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  const { data: analyses, isLoading: isLoadingAnalyses } = trpc.analyses.list.useQuery(
    { clientId: id! },
    { enabled: !!id },
  )

  const createAnalysisMutation = trpc.analyses.create.useMutation({
    onSuccess: (analysis) => {
      setIsCreatingAnalysis(false)
      setNewAnalysisName('')
      // Invalidate cache so lists are refreshed everywhere
      utils.analyses.list.invalidate()
      utils.analyses.getDashboardStats.invalidate()
      navigate(`/analyses/${analysis.id}/upload`)
    },
  })

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      setIsEditingClient(false)
      // Invalidate cache
      utils.clients.getById.invalidate({ id: id! })
      utils.clients.list.invalidate()
      utils.analyses.getDashboardStats.invalidate()
    },
  })

  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      // Invalidate cache
      utils.clients.list.invalidate()
      utils.analyses.getDashboardStats.invalidate()
      navigate('/clients')
    },
  })

  const deleteAnalysisMutation = trpc.analyses.delete.useMutation({
    onSuccess: () => {
      setDeletingAnalysisId(null)
      // Invalidate cache
      utils.analyses.list.invalidate()
      utils.analyses.getDashboardStats.invalidate()
    },
  })

  const handleOpenEditClient = () => {
    if (!client) return
    setEditName(client.name)
    setEditCompany(client.company || '')
    setEditEmail(client.contactEmail || '')
    setIsEditingClient(true)
  }

  const handleUpdateClient = () => {
    if (!id || !editName.trim()) return
    updateClientMutation.mutate({
      id,
      data: {
        name: editName.trim(),
        company: editCompany.trim() || undefined,
        contactEmail: editEmail.trim() || undefined,
      },
    })
  }

  const handleDeleteClient = () => {
    if (!id) return
    deleteClientMutation.mutate({ id })
  }

  const handleDeleteAnalysis = () => {
    if (!deletingAnalysisId) return
    deleteAnalysisMutation.mutate({ id: deletingAnalysisId })
  }

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
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleOpenEditClient}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setIsDeletingClient(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsCreatingAnalysis(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle analyse
                </Button>
              </div>
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
                <Card key={analysis.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex flex-1 cursor-pointer items-center space-x-4"
                        onClick={() => navigate(`/analyses/${analysis.id}`)}
                      >
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingAnalysisId(analysis.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ArrowRight
                          className="h-5 w-5 cursor-pointer text-muted-foreground"
                          onClick={() => navigate(`/analyses/${analysis.id}`)}
                        />
                      </div>
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

      {/* Edit Client Dialog */}
      <Dialog open={isEditingClient} onOpenChange={setIsEditingClient}>
        <DialogContent onClose={() => setIsEditingClient(false)}>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>Modifiez les informations du client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nom du client *</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nom du client"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Entreprise</label>
              <Input
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email de contact</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingClient(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdateClient}
              disabled={!editName.trim() || updateClientMutation.isPending}
            >
              {updateClientMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeletingClient} onOpenChange={setIsDeletingClient}>
        <DialogContent onClose={() => setIsDeletingClient(false)}>
          <DialogHeader>
            <DialogTitle>Supprimer le client</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le client "{client?.name}" ? Cette action
              supprimera egalement toutes les analyses associees. Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletingClient(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClient}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Analysis Dialog */}
      <Dialog open={!!deletingAnalysisId} onOpenChange={() => setDeletingAnalysisId(null)}>
        <DialogContent onClose={() => setDeletingAnalysisId(null)}>
          <DialogHeader>
            <DialogTitle>Supprimer l'analyse</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer cette analyse ? Toutes les factures et donnees
              associees seront egalement supprimees. Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAnalysisId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAnalysis}
              disabled={deleteAnalysisMutation.isPending}
            >
              {deleteAnalysisMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
