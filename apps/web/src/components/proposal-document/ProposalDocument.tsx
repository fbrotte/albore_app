import {
  CoverPage,
  PresentationPage,
  SolutionsPage,
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
  customizations?: Record<string, string>
  onUpdateSection?: (sectionKey: string, text: string) => void
  onResetSection?: (sectionKey: string, defaultText: string) => void
}

export function ProposalDocument({
  data,
  customizations,
  onUpdateSection,
  onResetSection,
}: ProposalDocumentProps) {
  const { client, albore, date, presentGroups, totals, hasGroup } = data

  // Helper to get customized text or default
  const getCustomText = (sectionKey: string): string | undefined => {
    if (!customizations) return undefined
    const custom = customizations[sectionKey]
    return custom && custom.trim() !== '' ? custom : undefined
  }

  return (
    <div className="proposal-document bg-[#f4f6f9] pb-10">
      {/* Page 1: Cover */}
      <CoverPage
        client={client}
        albore={albore}
        date={date}
        customizations={customizations}
        onUpdateSection={onUpdateSection}
        onResetSection={onResetSection}
        getCustomText={getCustomText}
      />

      {/* Page 2: Presentation (Intro + Expertises) */}
      <PresentationPage
        customizations={customizations}
        onUpdateSection={onUpdateSection}
        onResetSection={onResetSection}
        getCustomText={getCustomText}
      />

      {/* Page 3: Solutions (IP & Impression) */}
      <SolutionsPage />

      {/* Page 4: Confidentiality */}
      <ConfidentialityPage />

      {/* Page 5: Expense Overview */}
      <ExpenseOverviewPage groups={presentGroups} />

      {/* Pages 6+: Category Details (conditional) */}
      {hasGroup.telecom && (
        <CategoryDetailPage
          group={presentGroups.find((g) => g.slug === 'telecom')!}
          customizations={customizations}
          onUpdateSection={onUpdateSection}
          onResetSection={onResetSection}
          getCustomText={getCustomText}
        />
      )}

      {hasGroup.it && (
        <CategoryDetailPage
          group={presentGroups.find((g) => g.slug === 'it')!}
          customizations={customizations}
          onUpdateSection={onUpdateSection}
          onResetSection={onResetSection}
          getCustomText={getCustomText}
        />
      )}

      {hasGroup.printing && (
        <CategoryDetailPage
          group={presentGroups.find((g) => g.slug === 'printing')!}
          customizations={customizations}
          onUpdateSection={onUpdateSection}
          onResetSection={onResetSection}
          getCustomText={getCustomText}
        />
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
