import { PageWrapper, PageHeader } from '../shared'
import { PRESENTATION_TEXT } from '../constants'
import type { PageProps } from '../types'

export function PresentationPage({ className }: PageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Presentation d'Albore Group" />

      {/* Intro + Expertises */}
      <div className="border-b border-[#dce3ed] px-14 py-10">
        <p className="mb-7 text-[1rem] leading-relaxed text-[#2d3748]">{PRESENTATION_TEXT.intro}</p>

        <div className="grid grid-cols-3 gap-5">
          {PRESENTATION_TEXT.expertises.map((expertise) => (
            <div
              key={expertise.title}
              className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl text-[1.3rem]"
                style={{
                  background:
                    expertise.icon === '🤝'
                      ? 'linear-gradient(135deg, #2b6cb0, #5b9bd5)'
                      : expertise.icon === '💰'
                        ? 'linear-gradient(135deg, #c77c14, #e8a543)'
                        : 'linear-gradient(135deg, #7c3aed, #9f67f5)',
                }}
              >
                {expertise.icon}
              </div>
              <h4 className="mb-3 text-[0.92rem] font-bold text-[#1b2a4a]">{expertise.title}</h4>
              <ul className="list-none space-y-0.5">
                {expertise.items.map((item) => (
                  <li
                    key={item}
                    className="relative py-0.5 pl-4 text-[0.82rem] leading-relaxed text-[#718096]"
                  >
                    <span className="absolute left-0 text-[0.75rem] text-[#2b6cb0]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions IP & Téléphonie */}
      <div className="border-b border-[#dce3ed] px-14 py-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef3e2] text-[1.1rem]">
            📞
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Solutions IP & Telephonie
          </h3>
        </div>

        <div
          className="mb-6 rounded-xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1b2a4a, #2b6cb0)' }}
        >
          <p className="text-[0.92rem] leading-relaxed">
            <strong>Albore est le second operateur telecom corse</strong>{' '}
            {PRESENTATION_TEXT.telecomHighlight.replace(
              'Albore est le second operateur telecom corse ',
              '',
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {PRESENTATION_TEXT.telecomColumns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-2.5 border-b-2 border-[#2b6cb0] pb-2 text-[0.85rem] font-bold text-[#1b2a4a]">
                {col.title}
              </h5>
              <ul className="list-none space-y-1">
                {col.items.map((item) => (
                  <li key={item} className="relative py-1 pl-4 text-[0.82rem] text-[#2d3748]">
                    <span className="absolute left-0 font-bold text-[#2b6cb0]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions d'Impression */}
      <div className="px-14 py-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0e6ff] text-[1.1rem]">
            🖨️
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.3rem] font-bold text-[#1b2a4a]">
            Solutions d'Impression
          </h3>
        </div>

        <div
          className="mb-6 rounded-xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #9f67f5)' }}
        >
          <p className="text-[0.92rem] leading-relaxed">
            <strong>Albore Print Services</strong> —{' '}
            {PRESENTATION_TEXT.printHighlight.replace('Albore Print Services — ', '')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {PRESENTATION_TEXT.printColumns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-2.5 border-b-2 border-[#7c3aed] pb-2 text-[0.85rem] font-bold text-[#1b2a4a]">
                {col.title}
              </h5>
              <ul className="list-none space-y-1">
                {col.items.map((item) => (
                  <li key={item} className="relative py-1 pl-4 text-[0.82rem] text-[#2d3748]">
                    <span className="absolute left-0 font-bold text-[#7c3aed]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
