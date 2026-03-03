import { PageWrapper } from '../shared'
import type { CoverPageProps } from '../types'

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function CoverPage({ client, albore, date }: CoverPageProps) {
  return (
    <PageWrapper className="first:mt-10">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-[#1b2a4a] px-14 py-16">
        {/* Background decorations */}
        <div
          className="absolute -right-20 -top-[100px] h-[450px] w-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(43,108,176,0.2) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-20 left-[15%] h-[350px] w-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(43,108,176,0.1) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex h-full items-center justify-between">
          <div className="flex-1">
            <h1 className="font-['Playfair_Display',serif] text-[3.2rem] font-extrabold leading-tight tracking-tight text-white">
              Plan d'Optimisation
            </h1>
            <p className="mt-3 text-[1.2rem] font-medium uppercase tracking-[0.06em] text-[#5b9bd5]">
              {client.company ?? client.name}
            </p>
          </div>

          <div className="shrink-0 pl-8 text-right">
            <span className="text-[0.85rem] text-white/50">Date</span>
            <strong className="mt-1 block text-[1.05rem] text-white/95">{formatDate(date)}</strong>
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-14">
        {/* Contact cards */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          {/* Client card */}
          <div className="rounded-xl border-l-4 border-[#2b6cb0] bg-[#f4f6f9] p-6">
            <div className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#718096]">
              Client
            </div>
            <div className="mb-1 text-[1.15rem] font-bold text-[#1b2a4a]">{client.name}</div>
            <div className="text-[0.85rem] leading-relaxed text-[#718096]">
              {client.address && (
                <>
                  {client.address}
                  <br />
                </>
              )}
              {client.phone && <>Tel : {client.phone}</>}
            </div>
          </div>

          {/* Albore card */}
          <div className="rounded-xl border-l-4 border-[#0d9668] bg-[#f4f6f9] p-6">
            <div className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#718096]">
              Votre interlocuteur Albore
            </div>
            <div className="mb-1 text-[1.15rem] font-bold text-[#1b2a4a]">{albore.consultant}</div>
            <div className="text-[0.85rem] leading-relaxed text-[#718096]">
              Tel : {albore.phone}
              <br />
              Mail : {albore.email}
            </div>
          </div>
        </div>

        {/* Methodology box */}
        <div
          className="flex items-start gap-4 rounded-xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1b2a4a, #2b6cb0)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-[1.1rem]">
            📐
          </div>
          <div>
            <div className="mb-1.5 text-[0.95rem] font-bold">Notre methodologie</div>
            <p className="text-[0.88rem] leading-relaxed opacity-85">
              Elle distingue clairement les inventaires techniques (equipements, forfaits,
              maintenance, consommations) des analyses et recommandations, permettant une evaluation
              objective des solutions actuelles et proposees avant leur mise en oeuvre.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
