import { PageWrapper, PageHeader } from '../shared'
import { SIGNATURE_TEXT } from '../constants'
import type { SignaturePageProps } from '../types'

export function SignaturePage({ client, className }: SignaturePageProps) {
  return (
    <PageWrapper className={className}>
      <PageHeader title="Validation & Signature" badge="Accord" />

      <div className="px-14 py-10">
        {/* Signature grid */}
        <div className="mb-8 grid grid-cols-2 gap-7">
          {/* Client signature */}
          <div className="rounded-xl border border-[#dce3ed] p-8">
            <h4 className="mb-4 text-[1rem] font-bold text-[#1b2a4a]">
              {SIGNATURE_TEXT.client.title}
            </h4>
            <p className="mb-6 text-[0.85rem] leading-relaxed text-[#718096]">
              {SIGNATURE_TEXT.client.description}
            </p>

            <div className="mb-3 min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Nom et qualite : {client.name}
            </div>
            <div className="mb-3 min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Date :
            </div>
            <div className="min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Signature :
            </div>

            {/* Guarantee box */}
            <div className="mt-4 rounded-lg bg-[#e8f0fe] p-4 text-[0.82rem] font-medium leading-relaxed text-[#1e5494]">
              ✅ {SIGNATURE_TEXT.client.guarantee}
            </div>
          </div>

          {/* Albore signature */}
          <div className="rounded-xl border border-[#dce3ed] p-8">
            <h4 className="mb-4 text-[1rem] font-bold text-[#1b2a4a]">
              {SIGNATURE_TEXT.albore.title}
            </h4>
            <p className="mb-6 text-[0.85rem] leading-relaxed text-[#718096]">
              {SIGNATURE_TEXT.albore.description}
            </p>

            <div className="mb-3 min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Nom et qualite :
            </div>
            <div className="mb-3 min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Date :
            </div>
            <div className="min-h-7 border-b border-[#718096] pb-1 text-[0.85rem] text-[#718096]">
              Signature :
            </div>
          </div>
        </div>

        {/* Legal mentions */}
        <div className="rounded-xl bg-[#f4f6f9] p-6">
          <h4 className="mb-2 text-[0.9rem] font-bold text-[#1b2a4a]">Mentions legales</h4>
          <p className="text-[0.8rem] leading-relaxed text-[#718096]">
            En signant ce document, les parties reconnaissent avoir lu et accepte les termes et
            conditions generales d'Albore Group. Conformement au Code de la consommation, le client
            dispose d'un droit de retractation de 14 jours a compter de la signature du present
            document. Les tarifs presentes sont valables 30 jours a compter de la date d'emission de
            ce document.
          </p>
        </div>
      </div>

      {/* Confidential banner */}
      <div className="bg-[#1b2a4a] py-4 text-center text-[0.75rem] uppercase tracking-[0.15em] text-white/50">
        Document confidentiel - Tous droits reserves Albore Group
      </div>
    </PageWrapper>
  )
}
