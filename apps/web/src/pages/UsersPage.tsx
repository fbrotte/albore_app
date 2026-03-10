import { useState } from 'react'
import { UserPlus, Plus, Shield, Mail, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function UsersPage() {
  const utils = trpc.useUtils()
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { data: users, isLoading } = trpc.users.list.useQuery()

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      setIsCreating(false)
      setName('')
      setEmail('')
      setPassword('')
      setError('')
      utils.users.list.invalidate()
    },
    onError: (err) => {
      setError(err.message || 'Erreur lors de la creation')
    },
  })

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate()
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createMutation.mutate({
      email: email.trim(),
      password,
      name: name.trim() || undefined,
    })
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground">Gerez les comptes utilisateurs</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Nouvel utilisateur</CardTitle>
              <CardDescription>Creez un nouveau compte utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom</label>
                  <Input
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">E-mail *</label>
                  <Input
                    type="email"
                    placeholder="jean@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Mot de passe *</label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creation...' : 'Creer le compte'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
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
        ) : users && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name || 'Sans nom'}</span>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Supprimer cet utilisateur ?')) {
                          deleteMutation.mutate({ id: user.id })
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun utilisateur</h3>
              <p className="mb-6 text-muted-foreground">
                Commencez par creer le premier utilisateur
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Creer un utilisateur
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
