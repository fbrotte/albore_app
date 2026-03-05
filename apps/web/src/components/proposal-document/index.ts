// Barrel export for proposal document components
export { ProposalDocument } from './ProposalDocument'
export { ProposalViewer, type ProposalViewerRef } from './ProposalViewer'
export { useProposalData } from './useProposalData'
export { useProposalCustomizations } from './useProposalCustomizations'

// Types
export type {
  ProposalData,
  ProposalClient,
  ProposalAlbore,
  ProposalTotals,
  CategoryGroup,
  ServiceSummary,
} from './types'

// Pages (for advanced use cases)
export {
  CoverPage,
  PresentationPage,
  ConfidentialityPage,
  ExpenseOverviewPage,
  CategoryDetailPage,
  SynthesisPage,
  ActionPlanPage,
  SignaturePage,
} from './pages'

// Shared components (for reuse)
export { PageWrapper, PageHeader, CostBanner, DetailTable, SavingsBanner } from './shared'
