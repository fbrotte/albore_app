import { z } from 'zod'

export const AnalysisStatusSchema = z.enum([
  'DRAFT',
  'IMPORTING',
  'MATCHING',
  'REVIEW',
  'COMPLETED',
])
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>

export const AnalysisSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string(),
  status: AnalysisStatusSchema,
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})
export type Analysis = z.infer<typeof AnalysisSchema>

export const CreateAnalysisSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1, 'Le nom est requis'),
  notes: z.string().optional(),
})
export type CreateAnalysis = z.infer<typeof CreateAnalysisSchema>

export const UpdateAnalysisSchema = z.object({
  name: z.string().min(1).optional(),
  status: AnalysisStatusSchema.optional(),
  notes: z.string().optional(),
})
export type UpdateAnalysis = z.infer<typeof UpdateAnalysisSchema>
