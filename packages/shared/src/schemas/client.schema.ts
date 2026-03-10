import { z } from 'zod'

export const ClientSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string(),
  company: z.string().nullable(),
  contactEmail: z.string().email().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})
export type Client = z.infer<typeof ClientSchema>

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  company: z.string().optional(),
  contactEmail: z.string().email('Email invalide').optional(),
  notes: z.string().optional(),
})
export type CreateClient = z.infer<typeof CreateClientSchema>

export const UpdateClientSchema = CreateClientSchema.partial()
export type UpdateClient = z.infer<typeof UpdateClientSchema>
