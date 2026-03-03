import { PageWrapper, PageHeader } from '../shared'
import { ACTION_PLAN_STEPS } from '../constants'
import type { PageProps } from '../types'

export function ActionPlanPage({ className }: PageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Plan d'Action" badge="Prochaines etapes" />

      <div className="px-14 py-10">
        {/* Section title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f0fe] text-[1.1rem]">
            📅
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Calendrier de Mise en Oeuvre
          </h3>
        </div>

        <p className="mb-6 text-[0.92rem] leading-relaxed text-[#2d3748]">
          Voici le calendrier previsionnel pour la mise en place de votre optimisation. Chaque etape
          est accompagnee par notre equipe pour garantir une transition sans accroc.
        </p>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute bottom-2 left-3.5 top-2 w-0.5 bg-[#dce3ed]" />

          {ACTION_PLAN_STEPS.map((step, idx) => (
            <div
              key={step.period}
              className={`relative mb-7 rounded-lg bg-[#f4f6f9] p-5 ${
                idx === ACTION_PLAN_STEPS.length - 1 ? 'mb-0' : ''
              }`}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-6 top-[26px] h-3 w-3 rounded-full border-[3px] border-white bg-[#2b6cb0]"
                style={{ boxShadow: '0 0 0 2px #2b6cb0' }}
              />

              {/* Period badge */}
              <span className="mb-2 inline-block rounded-xl bg-[#e8f0fe] px-3 py-0.5 text-[0.75rem] font-bold text-[#1e5494]">
                {step.period}
              </span>

              <h4 className="mb-1.5 text-[0.95rem] font-bold text-[#1b2a4a]">{step.title}</h4>
              <p className="text-[0.85rem] leading-relaxed text-[#718096]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional info */}
      <div className="border-t border-[#dce3ed] px-14 py-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f8f2] text-[1.1rem]">
            ✅
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Nos Garanties
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-5">
            <div className="mb-2 text-[1.2rem]">🔒</div>
            <h4 className="mb-1 text-[0.85rem] font-bold text-[#1b2a4a]">Sans engagement</h4>
            <p className="text-[0.8rem] leading-snug text-[#718096]">
              Aucun frais si nous ne trouvons pas d'economies
            </p>
          </div>

          <div className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-5">
            <div className="mb-2 text-[1.2rem]">⚡</div>
            <h4 className="mb-1 text-[0.85rem] font-bold text-[#1b2a4a]">Transition fluide</h4>
            <p className="text-[0.8rem] leading-snug text-[#718096]">
              Pas d'interruption de service garantie
            </p>
          </div>

          <div className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-5">
            <div className="mb-2 text-[1.2rem]">📞</div>
            <h4 className="mb-1 text-[0.85rem] font-bold text-[#1b2a4a]">Support dedie</h4>
            <p className="text-[0.8rem] leading-snug text-[#718096]">
              Un interlocuteur unique a votre ecoute
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
