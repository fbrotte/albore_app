import { z } from 'zod'

// === ENUMS ===

export const ExtractionStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'ERROR'])
export type ExtractionStatus = z.infer<typeof ExtractionStatusSchema>

export const MatchStatusSchema = z.enum(['PENDING', 'AUTO', 'CONFIRMED', 'MANUAL', 'IGNORED'])
export type MatchStatus = z.infer<typeof MatchStatusSchema>

// === VISION EXTRACTION SCHEMA ===

export const VisionExtractedLineSchema = z.object({
  description: z.string(),
  quantity: z.number().nullable(),
  unit_price: z.number().nullable(),
  total_ht: z.number(),
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
})
export type VisionExtractedLine = z.infer<typeof VisionExtractedLineSchema>

export const VisionExtractionResultSchema = z.object({
  vendor_name: z.string(),
  invoice_number: z.string().nullable(),
  invoice_date: z.string().nullable(),
  total_ht: z.number().nullable(),
  total_tva: z.number().nullable(),
  total_ttc: z.number().nullable(),
  lines: z.array(VisionExtractedLineSchema),
})
export type VisionExtractionResult = z.infer<typeof VisionExtractionResultSchema>

// === INVOICE ===

export const InvoiceSchema = z.object({
  id: z.string().cuid(),
  analysisId: z.string().cuid(),
  vendorName: z.string(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.date().nullable(),
  totalHt: z.number().nullable(),
  totalTva: z.number().nullable(),
  totalTtc: z.number().nullable(),
  filePath: z.string(),
  fileName: z.string(),
  extractedRaw: z.unknown().nullable(),
  extractionStatus: ExtractionStatusSchema,
  extractionError: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Invoice = z.infer<typeof InvoiceSchema>

export const UploadInvoiceSchema = z.object({
  analysisId: z.string().cuid(),
  fileName: z.string(),
  fileContent: z.string(), // Base64 encoded
})
export type UploadInvoice = z.infer<typeof UploadInvoiceSchema>

// === INVOICE LINE ===

export const MatchCandidateSchema = z.object({
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  score: z.number(),
})
export type MatchCandidate = z.infer<typeof MatchCandidateSchema>

export const InvoiceLineSchema = z.object({
  id: z.string().cuid(),
  invoiceId: z.string().cuid(),
  description: z.string(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  totalHt: z.number(),
  periodStart: z.date().nullable(),
  periodEnd: z.date().nullable(),
  matchedServiceId: z.string().uuid().nullable(),
  matchCandidates: z.array(MatchCandidateSchema).nullable(),
  matchStatus: MatchStatusSchema,
  matchConfidence: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type InvoiceLine = z.infer<typeof InvoiceLineSchema>

export const SetMatchSchema = z.object({
  lineId: z.string().cuid(),
  serviceId: z.string().uuid(),
})
export type SetMatch = z.infer<typeof SetMatchSchema>

export const UpdateInvoiceLineSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().nullable().optional(),
  unitPrice: z.number().nullable().optional(),
  totalHt: z.number().optional(),
})
export type UpdateInvoiceLine = z.infer<typeof UpdateInvoiceLineSchema>
