import { PageWrapper, PageHeader } from '../shared'
import { CONFIDENTIALITY_TEXT } from '../constants'
import type { PageProps } from '../types'

export function ConfidentialityPage({ className }: PageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader
        title="Clause de Confidentialite"
        badge="Document confidentiel"
        className="bg-gradient-to-br from-[#1b2a4a] to-[#2d1a3e]"
      />

      <div className="px-14 py-10">
        {/* Intro */}
        <p className="mb-7 text-[0.88rem] leading-relaxed text-[#2d3748]">
          {CONFIDENTIALITY_TEXT.intro}
        </p>

        {/* Sections */}
        {CONFIDENTIALITY_TEXT.sections.map((section) => (
          <div key={section.title} className="mb-7 last:mb-0">
            <h4 className="mb-2.5 border-b border-[#dce3ed] pb-1.5 font-['Playfair_Display',serif] text-[1.05rem] font-bold text-[#1b2a4a]">
              {section.title}
            </h4>
            <p className="text-[0.88rem] leading-relaxed text-[#2d3748]">{section.content}</p>
          </div>
        ))}

        {/* Allowed actions */}
        <div className="mb-7">
          <h4 className="mb-2.5 border-b border-[#dce3ed] pb-1.5 font-['Playfair_Display',serif] text-[1.05rem] font-bold text-[#1b2a4a]">
            Utilisation autorisee
          </h4>
          <ul className="mt-2.5 list-none">
            {[
              'Consultation interne par les personnes habilitees',
              'Archivage securise a des fins de reference',
              'Partage avec les decideurs concernes',
            ].map((item) => (
              <li
                key={item}
                className="relative py-1.5 pl-6 text-[0.86rem] leading-relaxed text-[#2d3748]"
              >
                <span className="absolute left-0 font-bold text-[#2b6cb0]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Forbidden actions */}
        <div className="mb-7">
          <h4 className="mb-2.5 border-b border-[#dce3ed] pb-1.5 font-['Playfair_Display',serif] text-[1.05rem] font-bold text-[#1b2a4a]">
            Utilisation interdite
          </h4>
          <ul className="mt-2.5 list-none">
            {[
              'Reproduction ou diffusion a des tiers non autorises',
              'Utilisation a des fins commerciales ou concurrentielles',
              'Modification ou alteration du contenu',
            ].map((item) => (
              <li
                key={item}
                className="relative py-1.5 pl-6 text-[0.86rem] leading-relaxed text-[#2d3748]"
              >
                <span className="absolute left-0 font-bold text-[#dc3545]">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning box */}
        <div className="mt-7 rounded-xl border border-[#f0d48a] bg-[#fef3e2] p-5 text-[0.9rem] font-semibold leading-relaxed text-[#7c5a00]">
          ⚠️ {CONFIDENTIALITY_TEXT.warning}
        </div>
      </div>
    </PageWrapper>
  )
}
