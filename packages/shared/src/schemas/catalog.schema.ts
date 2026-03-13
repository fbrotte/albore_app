import { z } from 'zod'

// === ENUMS ===

export const UnitTypeSchema = z.enum(['UNIT', 'HOUR', 'MONTH', 'USER', 'LINE', 'DEVICE'])
export type UnitType = z.infer<typeof UnitTypeSchema>

export const PricingTypeSchema = z.enum(['FIXED', 'PER_UNIT', 'TIERED', 'VOLUME'])
export type PricingType = z.infer<typeof PricingTypeSchema>

export const BillingTypeSchema = z.enum(['RECURRING', 'ONE_TIME', 'USAGE'])
export type BillingType = z.infer<typeof BillingTypeSchema>

export const ProposalGroupSchema = z.enum(['TELECOM', 'IT', 'PRINTING'])
export type ProposalGroup = z.infer<typeof ProposalGroupSchema>

// === CATEGORY ===

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  proposalGroup: ProposalGroupSchema,
  displayOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})
export type Category = z.infer<typeof CategorySchema>

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().optional(),
})
export type CreateCategory = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>

// === SERVICE ===

export const ServiceSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string(),
  semanticDescription: z.string(),
  unitType: UnitTypeSchema,
  unitLabel: z.string(),
  pricingType: PricingTypeSchema,
  basePrice: z.number(),
  billingType: BillingTypeSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})
export type Service = z.infer<typeof ServiceSchema>

export const CreateServiceSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1, 'Le nom est requis'),
  semanticDescription: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  unitType: UnitTypeSchema,
  unitLabel: z.string().min(1, "Le libellé de l'unité est requis"),
  pricingType: PricingTypeSchema,
  basePrice: z.number().nonnegative('Le prix doit être positif ou nul'),
  billingType: BillingTypeSchema,
  isActive: z.boolean().optional(),
})
export type CreateService = z.infer<typeof CreateServiceSchema>

export const UpdateServiceSchema = CreateServiceSchema.partial()
export type UpdateService = z.infer<typeof UpdateServiceSchema>

// === PRICING TIER ===

export const PricingTierSchema = z.object({
  id: z.string().min(1),
  serviceId: z.string().min(1),
  minQuantity: z.number().int(),
  maxQuantity: z.number().int().nullable(),
  unitPrice: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type PricingTier = z.infer<typeof PricingTierSchema>

export const CreatePricingTierSchema = z.object({
  serviceId: z.string().min(1),
  minQuantity: z.number().int().min(0),
  maxQuantity: z.number().int().optional(),
  unitPrice: z.number().nonnegative(),
})
export type CreatePricingTier = z.infer<typeof CreatePricingTierSchema>

export const UpdatePricingTierSchema = CreatePricingTierSchema.omit({ serviceId: true }).partial()
export type UpdatePricingTier = z.infer<typeof UpdatePricingTierSchema>
