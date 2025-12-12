import { z } from 'zod'

export const BillingPatternSchema = z.enum(['FIXED', 'VARIABLE', 'ONE_TIME'])
export type BillingPattern = z.infer<typeof BillingPatternSchema>

export const AnalysisSummarySchema = z.object({
  id: z.string().cuid(),
  analysisId: z.string().cuid(),
  matchedServiceId: z.string().uuid().nullable(),
  customLabel: z.string().nullable(),
  monthsCount: z.number().int(),
  totalHt: z.number(),
  avgMonthly: z.number(),
  minMonthly: z.number(),
  maxMonthly: z.number(),
  // Quantity tracking
  totalQuantity: z.number().nullable(),
  avgQuantity: z.number().nullable(),
  minQuantity: z.number().nullable(),
  maxQuantity: z.number().nullable(),
  avgUnitPrice: z.number().nullable(),
  billingPattern: BillingPatternSchema,
  ourPrice: z.number().nullable(), // Our unit price from service catalog
  ourPriceNote: z.string().nullable(),
  savingAmount: z.number().nullable(), // Monthly saving = (avgUnitPrice - ourPrice) * avgQuantity
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
