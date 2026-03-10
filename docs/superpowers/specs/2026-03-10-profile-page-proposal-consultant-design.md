# Page Profil + Infos consultant dans la proposition

## Objectif

Permettre aux utilisateurs de modifier leurs informations de profil (nom, email, téléphone, mot de passe) et utiliser ces infos dans le document de proposition à la place des données hardcodées.

## Changements

### 1. Modèle de données

- Ajouter `phone String?` au modèle `User` dans Prisma

### 2. Backend

- Mettre à jour `UpdateUserSchema` pour inclure `phone`
- Mettre à jour `UserSchema` et `AuthResponseSchema` pour inclure `phone`
- Mettre à jour `UsersService` : inclure `phone` dans les select
- Mettre à jour `AuthService.generateTokens` et `validateUser` : inclure `phone`
- Ajouter route `updatePassword` dans `UsersTrpc` (ancien mdp + nouveau mdp)

### 3. Frontend - Auth Store

- Ajouter `phone` à l'interface `User` dans `auth.store.ts`

### 4. Frontend - Page Profil (`/profile`)

- Formulaire : Nom, Email, Téléphone
- Section changement de mot de passe : ancien + nouveau + confirmation
- Accessible depuis le header (clic sur le nom d'utilisateur)

### 5. Document de proposition

- Modifier `useProposalData.ts` : remplacer les infos hardcodées par celles de `useAuthStore`
