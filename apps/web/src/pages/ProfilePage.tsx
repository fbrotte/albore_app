import { useState } from 'react'
import { z } from 'zod'
import { useAuthStore, useUser } from '@/stores/auth.store'
import { trpc } from '@/lib/trpc'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Lock, CheckCircle } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().or(z.literal('')),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export default function ProfilePage() {
  const user = useUser()
  const setUser = useAuthStore((s) => s.setUser)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: (updatedUser) => {
      setUser(updatedUser as any)
      setProfileSuccess(true)
      setProfileErrors({})
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (err) => {
      setProfileErrors({ _form: err.message })
    },
  })

  const passwordMutation = trpc.users.updatePassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordErrors({})
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (err) => {
      setPasswordErrors({ _form: err.message })
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(false)
    const result = profileSchema.safeParse({ name, email, phone })
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const issue of result.error.issues) {
        errs[issue.path[0] as string] = issue.message
      }
      setProfileErrors(errs)
      return
    }
    if (!user) return
    setProfileErrors({})
    updateMutation.mutate({
      id: user.id,
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
      },
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)
    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword })
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const issue of result.error.issues) {
        errs[issue.path[0] as string] = issue.message
      }
      setPasswordErrors(errs)
      return
    }
    setPasswordErrors({})
    passwordMutation.mutate({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    })
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Ces informations apparaissent sur les documents de proposition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                {profileErrors.name && (
                  <p className="text-sm text-destructive">{profileErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                />
                {profileErrors.phone && (
                  <p className="text-sm text-destructive">{profileErrors.phone}</p>
                )}
              </div>

              {profileErrors._form && (
                <p className="text-sm text-destructive">{profileErrors._form}</p>
              )}

              {profileSuccess && (
                <p className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Profil mis a jour
                </p>
              )}

              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {passwordErrors._form && (
                <p className="text-sm text-destructive">{passwordErrors._form}</p>
              )}

              {passwordSuccess && (
                <p className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Mot de passe mis a jour
                </p>
              )}

              <Button type="submit" disabled={passwordMutation.isPending}>
                <Lock className="mr-2 h-4 w-4" />
                {passwordMutation.isPending ? 'Mise a jour...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
