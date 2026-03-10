# Page Profil + Infos Consultant — Plan d'implémentation

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page profil utilisateur et utiliser les infos du user connecté dans le document de proposition (au lieu du hardcodé).

**Architecture:** Migration Prisma pour ajouter `phone` au User, mise à jour des schemas Zod partagés, nouvelle page `/profile` avec formulaire (infos + mot de passe), modification du hook `useProposalData` pour consommer le auth store.

**Tech Stack:** Prisma, Zod, tRPC, React, Zustand, shadcn/ui, Tailwind

---

## Chunk 1: Backend — Modèle et API

### Task 1: Migration Prisma — Ajouter `phone` au User

**Files:**

- Modify: `prisma/schema.prisma:23-36`
- Create: `prisma/migrations/YYYYMMDD_add_user_phone/migration.sql` (auto-generated)

- [ ] **Step 1: Modifier le schema Prisma**

Dans `prisma/schema.prisma`, ajouter `phone` au modèle User :

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  phone     String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  refreshTokens RefreshToken[]
  clients       Client[]

  @@map("users")
}
```

- [ ] **Step 2: Créer et appliquer la migration**

Run: `bunx prisma migrate dev --name add_user_phone`
Expected: Migration créée et appliquée avec succès.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add phone field to User model"
```

---

### Task 2: Mettre à jour les schemas Zod partagés

**Files:**

- Modify: `packages/shared/src/schemas/user.schema.ts`
- Modify: `packages/shared/src/schemas/auth.schema.ts`

- [ ] **Step 1: Ajouter `phone` aux schemas User**

Dans `packages/shared/src/schemas/user.schema.ts` :

```typescript
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: UserRoleSchema.optional(),
})
```

- [ ] **Step 2: Ajouter `phone` à AuthResponseSchema**

Dans `packages/shared/src/schemas/auth.schema.ts` :

```typescript
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    phone: z.string().nullable(),
    role: z.enum(['USER', 'ADMIN']),
  }),
})
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas/
git commit -m "feat: add phone to User and AuthResponse schemas"
```

---

### Task 3: Mettre à jour le backend (service Users + Auth)

**Files:**

- Modify: `apps/api/src/modules/users/users.service.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`

- [ ] **Step 1: Ajouter `phone` aux select dans UsersService**

Dans `apps/api/src/modules/users/users.service.ts`, ajouter `phone: true` dans tous les `select` des méthodes `findAll`, `findOne`, et `update` :

```typescript
select: {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
},
```

- [ ] **Step 2: Ajouter `phone` dans AuthService**

Dans `apps/api/src/modules/auth/auth.service.ts` :

Méthode `generateTokens` (ligne 132-141) — ajouter `phone` au return :

```typescript
user: {
  id: user.id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
},
```

Méthode `validateUser` (ligne 144-154) — ajouter `phone` au select :

```typescript
select: {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
},
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/users/ apps/api/src/modules/auth/
git commit -m "feat: include phone in user API responses"
```

---

### Task 4: Ajouter la route `updatePassword`

**Files:**

- Modify: `apps/api/src/modules/users/users.service.ts`
- Modify: `apps/api/src/modules/users/users.trpc.ts`
- Modify: `packages/shared/src/schemas/user.schema.ts`

- [ ] **Step 1: Ajouter le schema Zod `UpdatePasswordSchema`**

Dans `packages/shared/src/schemas/user.schema.ts`, ajouter :

```typescript
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>
```

Vérifier que `UpdatePasswordSchema` est bien exporté dans `packages/shared/src/index.ts` (si un barrel export existe).

- [ ] **Step 2: Ajouter `updatePassword` dans UsersService**

Dans `apps/api/src/modules/users/users.service.ts`, ajouter l'import de `compare` et `hash` depuis `bcryptjs`, et la méthode :

```typescript
import { compare, hash } from 'bcryptjs'
import { UnauthorizedException } from '@nestjs/common'

async updatePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`)
  }

  const isValid = await compare(currentPassword, user.password)
  if (!isValid) {
    throw new UnauthorizedException('Current password is incorrect')
  }

  const hashedPassword = await hash(newPassword, 10)
  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { message: 'Password updated successfully' }
}
```

- [ ] **Step 3: Ajouter la route tRPC `updatePassword`**

Dans `apps/api/src/modules/users/users.trpc.ts`, ajouter l'import `UpdatePasswordSchema` et la route :

```typescript
import { UpdateUserSchema, UpdatePasswordSchema } from '@template-dev/shared'

// Dans le router, après la route delete:
updatePassword: this.trpc.protectedProcedure
  .input(UpdatePasswordSchema)
  .mutation(async ({ input, ctx }) => {
    return await this.usersService.updatePassword(
      ctx.user!.id,
      input.currentPassword,
      input.newPassword,
    )
  }),
```

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/ apps/api/src/modules/users/
git commit -m "feat: add updatePassword endpoint"
```

---

## Chunk 2: Frontend — Auth Store, Page Profil, Proposition

### Task 5: Mettre à jour le Auth Store

**Files:**

- Modify: `apps/web/src/stores/auth.store.ts`

- [ ] **Step 1: Ajouter `phone` à l'interface User**

```typescript
interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: 'USER' | 'ADMIN'
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/stores/auth.store.ts
git commit -m "feat: add phone to auth store User interface"
```

---

### Task 6: Créer la page Profil

**Files:**

- Create: `apps/web/src/pages/ProfilePage.tsx`
- Modify: `apps/web/src/App.tsx` (ajouter route `/profile`)
- Modify: `apps/web/src/components/layout/AppHeader.tsx` (lien vers profil)

- [ ] **Step 1: Créer le composant ProfilePage**

Créer `apps/web/src/pages/ProfilePage.tsx` :

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore, useUser } from '@/stores/auth.store'
import { trpc } from '@/lib/trpc'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, Lock } from 'lucide-react'

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

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const user = useUser()
  const setUser = useAuthStore((s) => s.setUser)
  const { toast } = useToast()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: (updatedUser) => {
      setUser(updatedUser as any)
      toast({ title: 'Profil mis à jour' })
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })

  const passwordMutation = trpc.users.updatePassword.useMutation({
    onSuccess: () => {
      toast({ title: 'Mot de passe mis à jour' })
      passwordForm.reset()
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })

  const onProfileSubmit = (data: ProfileForm) => {
    if (!user) return
    updateMutation.mutate({
      id: user.id,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
      },
    })
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
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
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" {...profileForm.register('name')} />
                {profileForm.formState.errors.name && (
                  <p className="text-destructive text-sm">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...profileForm.register('email')} />
                {profileForm.formState.errors.email && (
                  <p className="text-destructive text-sm">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" {...profileForm.register('phone')} />
                {profileForm.formState.errors.phone && (
                  <p className="text-destructive text-sm">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

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
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register('currentPassword')}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={passwordMutation.isPending}>
                <Lock className="mr-2 h-4 w-4" />
                {passwordMutation.isPending ? 'Mise à jour...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Ajouter la route `/profile` dans App.tsx**

Dans `apps/web/src/App.tsx`, ajouter l'import et la route :

```tsx
import ProfilePage from './pages/ProfilePage'

// Après la route /services :
;<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: Ajouter le lien profil dans AppHeader**

Dans `apps/web/src/components/layout/AppHeader.tsx`, rendre le nom de l'utilisateur cliquable :

Remplacer :

```tsx
<span className="text-muted-foreground text-sm">
  {user?.name} ({user?.role})
</span>
```

Par :

```tsx
<button
  onClick={() => navigate('/profile')}
  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
>
  {user?.name} ({user?.role})
</button>
```

Ajouter l'import `User` (icône lucide) si besoin — mais ici on réutilise simplement le texte existant comme lien cliquable.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/ProfilePage.tsx apps/web/src/App.tsx apps/web/src/components/layout/AppHeader.tsx
git commit -m "feat: add profile page with name, email, phone, password update"
```

---

### Task 7: Utiliser les infos utilisateur dans le document de proposition

**Files:**

- Modify: `apps/web/src/components/proposal-document/useProposalData.ts`

- [ ] **Step 1: Remplacer les infos hardcodées**

Dans `apps/web/src/components/proposal-document/useProposalData.ts`, importer `useUser` et remplacer le bloc `albore` hardcodé :

```typescript
import { useUser } from '@/stores/auth.store'

export function useProposalData(analysisId: string | undefined) {
  const user = useUser()
  // ... existing queries ...

  const proposalData = useMemo<ProposalData | null>(() => {
    if (!analysis || !summaries) return null

    // ... existing logic ...

    return {
      // ... existing fields ...
      albore: {
        consultant: user?.name ?? 'Consultant Albore',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
      },
      // ... rest ...
    }
  }, [analysis, summaries, analysisId, user])

  // ... rest ...
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/proposal-document/useProposalData.ts
git commit -m "feat: use connected user info in proposal document instead of hardcoded values"
```

---

### Task 8: Vérifier l'export du schema partagé

**Files:**

- Possibly modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Vérifier que `UpdatePasswordSchema` est exporté**

Vérifier que `packages/shared/src/index.ts` (ou le barrel export principal) exporte bien `UpdatePasswordSchema` et `UpdatePassword`. Si un barrel export existe et que les autres schemas user sont déjà exportés, ajouter les nouveaux exports.

- [ ] **Step 2: Commit si nécessaire**

```bash
git add packages/shared/src/
git commit -m "feat: export UpdatePasswordSchema from shared package"
```

---

## Vérification finale

- [ ] **Lancer `make dev`** et vérifier que l'app démarre
- [ ] **Lancer `make lint`** et corriger les erreurs éventuelles
- [ ] **Tester manuellement** :
  1. Se connecter
  2. Cliquer sur son nom dans le header → page `/profile`
  3. Modifier nom, email, téléphone → enregistrer → toast de succès
  4. Changer le mot de passe → succès
  5. Aller sur une analyse → étape Proposition → vérifier que les infos consultant sont celles du profil
