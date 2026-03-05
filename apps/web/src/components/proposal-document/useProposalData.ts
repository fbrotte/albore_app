import { useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { GROUP_CONFIG } from './constants'
import type { ProposalData, CategoryGroup, ServiceSummary, ProposalTotals } from './types'

// Fallback mapping for categories without proposalGroup set
const CATEGORY_GROUP_FALLBACK: Record<string, CategoryGroup['slug']> = {
  'Téléphonie Mobile': 'telecom',
  'Téléphonie Fixe': 'telecom',
  'Internet & Réseau': 'telecom',
  'Cloud & Hébergement': 'it',
  'Logiciels & Licences': 'it',
  Matériel: 'it',
  Impression: 'printing',
}

export function useProposalData(analysisId: string | undefined) {
  const { data: analysis, isLoading: isLoadingAnalysis } = trpc.analyses.getById.useQuery(
    { id: analysisId! },
    { enabled: !!analysisId },
  )

  const { data: summaries, isLoading: isLoadingSummaries } = trpc.summaries.list.useQuery(
    { analysisId: analysisId! },
    { enabled: !!analysisId },
  )

  const proposalData = useMemo<ProposalData | null>(() => {
    if (!analysis || !summaries) return null

    // Transform summaries into ServiceSummary format and group by proposal group
    const groupedServices = new Map<CategoryGroup['slug'], ServiceSummary[]>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of summaries as any[]) {
      const currentMonthly = Number(s.avgMonthly) || 0
      const proposedMonthly = s.ourPrice ? Number(s.ourPrice) : currentMonthly
      const savingAmount = Number(s.savingAmount) || 0
      const savingPercent = Number(s.savingPercent) || 0

      const serviceSummary: ServiceSummary = {
        id: s.id,
        serviceName: s.matchedService?.name ?? 'Service',
        categoryName: s.matchedService?.category?.name ?? 'Autre',
        categoryId: s.matchedService?.categoryId ?? '',
        provider: undefined,
        description: s.matchedService?.semanticDescription,
        currentMonthly,
        currentAnnual: currentMonthly * 12,
        proposedMonthly,
        proposedAnnual: proposedMonthly * 12,
        savingAmount,
        savingPercent,
        quantity: s.avgQuantity ? Number(s.avgQuantity) : undefined,
        unitLabel: s.matchedService?.unitLabel,
        unitPrice: s.avgUnitPrice ? Number(s.avgUnitPrice) : undefined,
        ourPrice: s.ourPrice ? Number(s.ourPrice) : undefined,
      }

      // Use proposalGroup from DB, fallback to name-based mapping, then default to 'it'
      const dbGroup = s.matchedService?.category?.proposalGroup?.toLowerCase() as
        | CategoryGroup['slug']
        | undefined
      const categoryName = s.matchedService?.category?.name ?? ''
      const groupSlug: CategoryGroup['slug'] =
        dbGroup ?? CATEGORY_GROUP_FALLBACK[categoryName] ?? 'it'

      if (!groupedServices.has(groupSlug)) {
        groupedServices.set(groupSlug, [])
      }
      groupedServices.get(groupSlug)!.push(serviceSummary)
    }

    // Build category groups
    const groups: CategoryGroup[] = []
    const groupOrder: CategoryGroup['slug'][] = ['telecom', 'it', 'printing']

    for (const slug of groupOrder) {
      const services = groupedServices.get(slug) ?? []
      if (services.length === 0) continue

      const config = GROUP_CONFIG[slug]
      const currentTotal = services.reduce((sum, s) => sum + s.currentMonthly, 0)
      const proposedTotal = services.reduce((sum, s) => sum + s.proposedMonthly, 0)
      const savingsTotal = services.reduce((sum, s) => sum + s.savingAmount, 0)
      const savingsPercent = currentTotal > 0 ? (savingsTotal / currentTotal) * 100 : 0

      groups.push({
        id: slug,
        name: config.name,
        slug,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        services,
        currentTotal,
        proposedTotal,
        savingsTotal,
        savingsPercent,
      })
    }

    // Calculate overall totals
    const totals: ProposalTotals = {
      currentMonthly: groups.reduce((sum, g) => sum + g.currentTotal, 0),
      currentAnnual: groups.reduce((sum, g) => sum + g.currentTotal * 12, 0),
      proposedMonthly: groups.reduce((sum, g) => sum + g.proposedTotal, 0),
      proposedAnnual: groups.reduce((sum, g) => sum + g.proposedTotal * 12, 0),
      savingsMonthly: groups.reduce((sum, g) => sum + g.savingsTotal, 0),
      savingsAnnual: groups.reduce((sum, g) => sum + g.savingsTotal * 12, 0),
      savingsPercent: 0,
    }
    totals.savingsPercent =
      totals.currentMonthly > 0 ? (totals.savingsMonthly / totals.currentMonthly) * 100 : 0

    // Build hasGroup flags
    const hasGroup = {
      telecom: groups.some((g) => g.slug === 'telecom'),
      it: groups.some((g) => g.slug === 'it'),
      printing: groups.some((g) => g.slug === 'printing'),
    }

    return {
      analysisId: analysisId!,
      client: {
        name: analysis.client?.name ?? 'Client',
        company: analysis.client?.company ?? analysis.name,
        contact: analysis.client?.contactEmail ?? undefined,
        email: analysis.client?.contactEmail ?? undefined,
        phone: undefined, // Pas de champ phone dans le modèle Client
        address: undefined, // Pas de champ address dans le modèle Client
        logoUrl: undefined,
      },
      albore: {
        consultant: 'Richard BERTONCINI',
        email: 'bertoncini@alboregroup.com',
        phone: '06 50 01 51 03',
      },
      date: new Date(),
      groups,
      presentGroups: groups.filter((g) => g.services.length > 0),
      totals,
      hasGroup,
    }
  }, [analysis, summaries, analysisId])

  return {
    data: proposalData,
    isLoading: isLoadingAnalysis || isLoadingSummaries,
    analysis,
    summaries,
  }
}
