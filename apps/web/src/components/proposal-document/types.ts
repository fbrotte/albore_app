// Types for proposal document generation

export interface ProposalClient {
  name: string
  company?: string
  contact?: string
  email?: string
  phone?: string
  address?: string
  logoUrl?: string
}

export interface ProposalAlbore {
  consultant: string
  email: string
  phone: string
}

export interface ServiceSummary {
  id: string
  serviceName: string
  categoryName: string
  categoryId: string
  provider?: string
  description?: string
  currentMonthly: number
  currentAnnual: number
  proposedMonthly: number
  proposedAnnual: number
  savingAmount: number
  savingPercent: number
  quantity?: number
  unitLabel?: string
  unitPrice?: number
  ourPrice?: number
}

export interface CategoryGroup {
  id: string
  name: string
  slug: 'telecom' | 'it' | 'printing'
  icon: string
  color: string
  bgColor: string
  borderColor: string
  services: ServiceSummary[]
  currentTotal: number
  proposedTotal: number
  savingsTotal: number
  savingsPercent: number
}

export interface ProposalTotals {
  currentMonthly: number
  currentAnnual: number
  proposedMonthly: number
  proposedAnnual: number
  savingsMonthly: number
  savingsAnnual: number
  savingsPercent: number
}

export interface ProposalData {
  analysisId: string
  client: ProposalClient
  albore: ProposalAlbore
  date: Date
  groups: CategoryGroup[]
  presentGroups: CategoryGroup[]
  totals: ProposalTotals
  hasGroup: {
    telecom: boolean
    it: boolean
    printing: boolean
  }
}

export interface PageProps {
  className?: string
}

// Editable section props - used by pages that support customization
export interface EditableProps {
  customizations?: Record<string, string>
  onUpdateSection?: (sectionKey: string, text: string) => void
  onResetSection?: (sectionKey: string, defaultText: string) => void
  getCustomText?: (sectionKey: string) => string | undefined
}

export interface CategoryDetailPageProps extends PageProps, EditableProps {
  group: CategoryGroup
  analysis?: string
  recommendation?: string
}

export interface ExpenseOverviewPageProps extends PageProps {
  groups: CategoryGroup[]
}

export interface SynthesisPageProps extends PageProps {
  groups: CategoryGroup[]
  totals: ProposalTotals
}

export interface CoverPageProps extends PageProps, EditableProps {
  client: ProposalClient
  albore: ProposalAlbore
  date: Date
}

export interface SignaturePageProps extends PageProps {
  client: ProposalClient
}

export interface PresentationPageProps extends PageProps, EditableProps {}
