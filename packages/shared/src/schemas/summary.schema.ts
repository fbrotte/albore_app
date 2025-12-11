import { z } from 'zod'

export const BillingPatternSchema = z.enum(['FIXED', 'VARIABLE', 'ONE_TIME'])
export type BillingPattern = z.infer<typeof BillingPatternSchema>

export const AnalysisSummarySchema = z.object({
  id: z.string().cuid(),
  analysisId: z.string().cuid(),
  matchedServiceId: z.string().cuid().nullable(),
  customLabel: z.string().nullable(),
  monthsCount: z.number().int(),
  totalHt: z.number(),
  avgMonthly: z.number(),
  minMonthly: z.number(),
  maxMonthly: z.number(),
  billingPattern: BillingPatternSchema,
  ourPrice: z.number().nullable(),
  ourPriceNote: z.string().nullable(),
  savingAmount: z.number().nullable(),
  savingPercent: z.number().nullable(),
  includeInReport: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type AnalysisSummary = z.infer<typeof AnalysisSummarySchema>

export const UpdateSummarySchema = z.object({
  customLabel: z.string().optional(),
  ourPrice: z.number().nonnegative().nullable().optional(),
  ourPriceNote: z.string().optional(),
  includeInReport: z.boolean().optional(),
})
export type UpdateSummary = z.infer<typeof UpdateSummarySchema>
