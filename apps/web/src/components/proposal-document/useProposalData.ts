import { useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { CATEGORY_GROUP_MAP, GROUP_CONFIG } from './constants'
import type { ProposalData, CategoryGroup, ServiceSummary, ProposalTotals } from './types'

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

    // Transform summaries into ServiceSummary format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceSummaries: ServiceSummary[] = summaries.map((s: any) => {
      const currentMonthly = Number(s.avgMonthly) || 0
      const proposedMonthly = s.ourPrice ? Number(s.ourPrice) : currentMonthly
      const savingAmount = Number(s.savingAmount) || 0
      const savingPercent = Number(s.savingPercent) || 0

      return {
        id: s.id,
        serviceName: s.matchedService?.name ?? 'Service',
        categoryName: s.matchedService?.category?.name ?? 'Autre',
        categoryId: s.matchedService?.categoryId ?? '',
        provider: undefined, // Could be extracted from invoice data
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
    })

    // Group services by category group
    const groupedServices = new Map<CategoryGroup['slug'], ServiceSummary[]>()

    for (const service of serviceSummaries) {
      const groupSlug = CATEGORY_GROUP_MAP[service.categoryName] ?? 'it'
      if (!groupedServices.has(groupSlug)) {
        groupedServices.set(groupSlug, [])
      }
      groupedServices.get(groupSlug)!.push(service)
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
