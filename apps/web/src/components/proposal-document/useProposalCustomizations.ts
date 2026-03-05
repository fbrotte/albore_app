import { trpc } from '@/lib/trpc'
import { useCallback, useMemo } from 'react'

export function useProposalCustomizations(analysisId: string) {
  // Récupère les customizations via tRPC
  const {
    data: customizationsArray,
    isLoading,
    refetch,
  } = trpc.proposalCustomizations.get.useQuery({ analysisId }, { enabled: !!analysisId })

  // Mutation pour upsert
  const upsertMutation = trpc.proposalCustomizations.upsert.useMutation({
    onSuccess: () => refetch(),
  })

  // Transforme le tableau en objet { [sectionKey]: customText }
  const customizations = useMemo(() => {
    if (!customizationsArray) return {}
    return customizationsArray.reduce(
      (acc, item) => {
        acc[item.sectionKey] = item.customText
        return acc
      },
      {} as Record<string, string>,
    )
  }, [customizationsArray])

  // Fonction pour mettre à jour une section
  const updateSection = useCallback(
    (sectionKey: string, text: string) => {
      upsertMutation.mutate({ analysisId, sectionKey, customText: text })
    },
    [analysisId, upsertMutation],
  )

  // Fonction pour reset une section (supprime la customization)
  // Note: pour l'instant on remet juste le texte par défaut via upsert
  // On pourrait ajouter un endpoint delete si nécessaire
  const resetSection = useCallback(
    (_sectionKey: string, _defaultText: string) => {
      // Pour reset, on supprime la customization
      // Comme on n'a pas de delete endpoint, on met une string vide
      // Le composant EditableText utilisera defaultText si customText est vide
      upsertMutation.mutate({ analysisId, sectionKey: _sectionKey, customText: '' })
    },
    [analysisId, upsertMutation],
  )

  // Helper pour obtenir le texte d'une section (custom ou default)
  const getText = useCallback(
    (sectionKey: string, defaultText: string): string => {
      const custom = customizations[sectionKey]
      return custom && custom.trim() !== '' ? custom : defaultText
    },
    [customizations],
  )

  return {
    customizations,
    updateSection,
    resetSection,
    getText,
    isLoading,
    isSaving: upsertMutation.isPending,
  }
}
