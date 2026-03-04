import { z } from 'zod'

// Base schema for a proposal customization
export const ProposalCustomizationSchema = z.object({
  id: z.string().cuid(),
  analysisId: z.string().cuid(),
  sectionKey: z.string().min(1),
  customText: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type ProposalCustomization = z.infer<typeof ProposalCustomizationSchema>

// Input schema for getting customizations by analysisId
export const GetProposalCustomizationsSchema = z.object({
  analysisId: z.string().cuid(),
})
export type GetProposalCustomizations = z.infer<typeof GetProposalCustomizationsSchema>

// Input schema for upserting a customization
export const UpsertProposalCustomizationSchema = z.object({
  analysisId: z.string().cuid(),
  sectionKey: z.string().min(1),
  customText: z.string(),
})
export type UpsertProposalCustomization = z.infer<typeof UpsertProposalCustomizationSchema>
