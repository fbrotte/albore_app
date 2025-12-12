import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Building2, Mail, ArrowRight, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientCompany, setNewClientCompany] = useState('')

  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery()

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      setIsCreating(false)
      setNewClientName('')
      setNewClientCompany('')
      refetch()
    },
  })

  const handleCreateClient = () => {
    if (!newClientName.trim()) return
    createClientMutation.mutate({
      name: newClientName.trim(),
      company: newClientCompany.trim() || undefined,
    })
  }

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.company?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Gerez vos clients et leurs analyses</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Client Modal/Card */}
        {isCreating && (
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
                    {createClientMutation.isPending ? 'Creation...' : 'Creer le client'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                        <div className="h-4 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients && filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="card-hover cursor-pointer"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{client.name}</h3>
                        {client.company && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building2 className="mr-1 h-4 w-4" />
                            {client.company}
                          </div>
                        )}
                        {client.contactEmail && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="mr-1 h-4 w-4" />
                            {client.contactEmail}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="mt-4 flex justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">
                      Cree le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {search ? 'Aucun client trouve' : 'Aucun client pour le moment'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {search
                  ? 'Essayez avec un autre terme de recherche'
                  : 'Commencez par ajouter votre premier client'}
              </p>
              {!search && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un client
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
