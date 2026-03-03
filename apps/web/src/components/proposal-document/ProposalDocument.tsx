import {
  CoverPage,
  PresentationPage,
  ConfidentialityPage,
  ExpenseOverviewPage,
  CategoryDetailPage,
  SynthesisPage,
  ActionPlanPage,
  SignaturePage,
} from './pages'
import type { ProposalData } from './types'

interface ProposalDocumentProps {
  data: ProposalData
}

export function ProposalDocument({ data }: ProposalDocumentProps) {
  const { client, albore, date, presentGroups, totals, hasGroup } = data

  return (
    <div className="proposal-document bg-[#f4f6f9] pb-10">
      {/* Page 1: Cover */}
      <CoverPage client={client} albore={albore} date={date} />

      {/* Page 2: Presentation */}
      <PresentationPage />

      {/* Page 3: Confidentiality */}
      <ConfidentialityPage />

      {/* Page 4: Expense Overview */}
      <ExpenseOverviewPage groups={presentGroups} />

      {/* Pages 5-7: Category Details (conditional) */}
      {hasGroup.telecom && (
        <CategoryDetailPage group={presentGroups.find((g) => g.slug === 'telecom')!} />
      )}

      {hasGroup.it && <CategoryDetailPage group={presentGroups.find((g) => g.slug === 'it')!} />}

      {hasGroup.printing && (
        <CategoryDetailPage group={presentGroups.find((g) => g.slug === 'printing')!} />
      )}

      {/* Page: Synthesis */}
      <SynthesisPage groups={presentGroups} totals={totals} />

      {/* Page: Action Plan */}
      <ActionPlanPage />

      {/* Page: Signature */}
      <SignaturePage client={client} />
    </div>
  )
}
