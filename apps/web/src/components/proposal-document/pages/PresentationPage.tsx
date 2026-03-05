import { PageWrapper, PageHeader, EditableText } from '../shared'
import { PRESENTATION_TEXT } from '../constants'
import type { PresentationPageProps } from '../types'

// Page 1: Intro + Expertises
export function PresentationPage({
  className,
  onUpdateSection,
  onResetSection,
  getCustomText,
}: PresentationPageProps) {
  const introSectionKey = 'presentation-intro'

  const handleSaveIntro = (sectionKey: string, text: string) => {
    onUpdateSection?.(sectionKey, text)
  }

  const handleResetIntro = (sectionKey: string) => {
    onResetSection?.(sectionKey, PRESENTATION_TEXT.intro)
  }

  return (
    <PageWrapper className={className}>
      <PageHeader title="Presentation d'Albore Group" />

      {/* Intro + Expertises */}
      <div className="px-14 py-10">
        {onUpdateSection ? (
          <div className="mb-7">
            <EditableText
              sectionKey={introSectionKey}
              defaultText={PRESENTATION_TEXT.intro}
              customText={getCustomText?.(introSectionKey)}
              onSave={handleSaveIntro}
              onReset={handleResetIntro}
              className="text-[1rem] leading-relaxed text-[#2d3748]"
              as="p"
              multiline
            />
          </div>
        ) : (
          <p className="mb-7 text-[1rem] leading-relaxed text-[#2d3748]">
            {getCustomText?.(introSectionKey) || PRESENTATION_TEXT.intro}
          </p>
        )}

        <h3 className="mb-5 font-['Playfair_Display',serif] text-[1.2rem] font-bold text-[#1b2a4a]">
          Nos Expertises
        </h3>

        <div className="grid grid-cols-3 gap-5">
          {PRESENTATION_TEXT.expertises.map((expertise) => (
            <div
              key={expertise.title}
              className="rounded-xl border border-[#dce3ed] bg-[#f4f6f9] p-5"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-[1.2rem]"
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
              <h4 className="mb-2 text-[0.9rem] font-bold text-[#1b2a4a]">{expertise.title}</h4>
              <ul className="list-none space-y-0.5">
                {expertise.items.map((item) => (
                  <li
                    key={item}
                    className="relative py-0.5 pl-4 text-[0.78rem] leading-snug text-[#718096]"
                  >
                    <span className="absolute left-0 text-[0.7rem] text-[#2b6cb0]">→</span>
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

// Page 2: Solutions IP & Impression
export function SolutionsPage({ className }: { className?: string }) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Nos Solutions" />

      {/* Solutions IP & Téléphonie */}
      <div className="border-b border-[#dce3ed] px-14 py-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3e2] text-[1rem]">
            📞
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.15rem] font-bold text-[#1b2a4a]">
            Solutions IP & Telephonie
          </h3>
        </div>

        <div
          className="mb-5 rounded-xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1b2a4a, #2b6cb0)' }}
        >
          <p className="text-[0.85rem] leading-relaxed">
            <strong>Albore est le second operateur telecom corse</strong>{' '}
            {PRESENTATION_TEXT.telecomHighlight.replace(
              'Albore est le second operateur telecom corse ',
              '',
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PRESENTATION_TEXT.telecomColumns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-2 border-b-2 border-[#2b6cb0] pb-1.5 text-[0.8rem] font-bold text-[#1b2a4a]">
                {col.title}
              </h5>
              <ul className="list-none space-y-0.5">
                {col.items.map((item) => (
                  <li key={item} className="relative py-0.5 pl-3 text-[0.75rem] text-[#2d3748]">
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
      <div className="px-14 py-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0e6ff] text-[1rem]">
            🖨️
          </div>
          <h3 className="font-['Playfair_Display',serif] text-[1.15rem] font-bold text-[#1b2a4a]">
            Solutions d'Impression
          </h3>
        </div>

        <div
          className="mb-5 rounded-xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #9f67f5)' }}
        >
          <p className="text-[0.85rem] leading-relaxed">
            <strong>Albore Print Services</strong> —{' '}
            {PRESENTATION_TEXT.printHighlight.replace('Albore Print Services — ', '')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PRESENTATION_TEXT.printColumns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-2 border-b-2 border-[#7c3aed] pb-1.5 text-[0.8rem] font-bold text-[#1b2a4a]">
                {col.title}
              </h5>
              <ul className="list-none space-y-0.5">
                {col.items.map((item) => (
                  <li key={item} className="relative py-0.5 pl-3 text-[0.75rem] text-[#2d3748]">
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
