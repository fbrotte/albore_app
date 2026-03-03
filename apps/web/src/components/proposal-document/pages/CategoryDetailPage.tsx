import { PageWrapper, PageHeader, CostBanner, DetailTable } from '../shared'
import { GROUP_CONFIG } from '../constants'
import type { CategoryDetailPageProps } from '../types'

export function CategoryDetailPage({
  group,
  analysis,
  recommendation,
  className,
}: CategoryDetailPageProps) {
  const config = GROUP_CONFIG[group.slug]

  // Default analysis and recommendation texts
  const defaultAnalysis = `Notre audit a identifie ${group.services.length} service${
    group.services.length > 1 ? 's' : ''
  } dans la categorie ${group.name}. L'analyse de vos factures revele des opportunites d'optimisation significatives, notamment par la renegociation de vos contrats actuels et l'ajustement de vos forfaits aux besoins reels de votre entreprise.`

  const defaultRecommendation = `Nous recommandons la mise en place de notre solution optimisee qui vous permettra de beneficier d'une reduction de ${group.savingsPercent.toFixed(
    1,
  )}% sur ce poste de depense. Cette optimisation inclut un accompagnement complet pour la transition et un suivi continu de votre facturation.`

  return (
    <PageWrapper className={className}>
      <PageHeader
        title={`Detail : ${group.name}`}
        badge={`${group.services.length} service${group.services.length > 1 ? 's' : ''}`}
      />

      <div className="px-14 py-10">
        {/* Section title with icon */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-[1.1rem] ${config.bgColor}`}
          >
            {config.icon}
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Comparatif des Couts
          </h3>
        </div>

        {/* Cost comparison banner */}
        <CostBanner currentAmount={group.currentTotal} proposedAmount={group.proposedTotal} />

        {/* Detail table */}
        <DetailTable services={group.services} />
      </div>

      {/* Analysis section */}
      <div className="border-t border-[#dce3ed] px-14 py-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f0fe] text-[1.1rem]">
            🔍
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Analyse
          </h3>
        </div>

        <div className="rounded-xl border-l-4 border-[#2b6cb0] bg-[#f4f6f9] p-7">
          <h4 className="mb-3 text-[0.95rem] font-bold text-[#1b2a4a]">Constat</h4>
          <p className="text-[0.88rem] leading-relaxed text-[#2d3748]">
            {analysis || defaultAnalysis}
          </p>
        </div>

        {/* Recommendation box */}
        <div
          className="mt-5 rounded-xl border border-[rgba(43,108,176,0.2)] p-7"
          style={{
            background: 'linear-gradient(135deg, rgba(43,108,176,0.06), rgba(43,108,176,0.02))',
          }}
        >
          <h4 className="mb-2.5 text-[0.95rem] font-bold text-[#1e5494]">
            💡 Recommandation Albore
          </h4>
          <p className="text-[0.88rem] leading-relaxed text-[#2d3748]">
            {recommendation || defaultRecommendation}
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
