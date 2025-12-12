import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { CatalogService } from './catalog.service'
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateServiceSchema,
  UpdateServiceSchema,
  CreatePricingTierSchema,
  UpdatePricingTierSchema,
} from '@template-dev/shared'

@Injectable()
export class CatalogTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(CatalogService) private readonly catalogService: CatalogService,
  ) {
    this.router = this.trpc.router({
      // === CATEGORIES ===

      categories: this.trpc.router({
        list: this.trpc.protectedProcedure.query(async () => {
          return this.catalogService.findAllCategories()
        }),

        getById: this.trpc.protectedProcedure
          .input(z.object({ id: z.string().cuid() }))
          .query(async ({ input }) => {
            return this.catalogService.findCategoryById(input.id)
          }),

        create: this.trpc.adminProcedure.input(CreateCategorySchema).mutation(async ({ input }) => {
          return this.catalogService.createCategory(input)
        }),

        update: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid(), data: UpdateCategorySchema }))
          .mutation(async ({ input }) => {
            return this.catalogService.updateCategory(input.id, input.data)
          }),

        delete: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid() }))
          .mutation(async ({ input }) => {
            return this.catalogService.deleteCategory(input.id)
          }),
      }),

      // === SERVICES ===

      services: this.trpc.router({
        list: this.trpc.protectedProcedure
          .input(z.object({ categoryId: z.string().cuid().optional() }).optional())
          .query(async ({ input }) => {
            return this.catalogService.findAllServices(input?.categoryId)
          }),

        getById: this.trpc.protectedProcedure
          .input(z.object({ id: z.string().cuid() }))
          .query(async ({ input }) => {
            return this.catalogService.findServiceById(input.id)
          }),

        create: this.trpc.adminProcedure.input(CreateServiceSchema).mutation(async ({ input }) => {
          return this.catalogService.createService(input)
        }),

        update: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid(), data: UpdateServiceSchema }))
          .mutation(async ({ input }) => {
            return this.catalogService.updateService(input.id, input.data)
          }),

        delete: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid() }))
          .mutation(async ({ input }) => {
            return this.catalogService.deleteService(input.id)
          }),

        calculatePrice: this.trpc.protectedProcedure
          .input(z.object({ serviceId: z.string().uuid(), quantity: z.number().positive() }))
          .query(async ({ input }) => {
            return this.catalogService.calculatePrice(input.serviceId, input.quantity)
          }),
      }),

      // === PRICING TIERS ===

      pricingTiers: this.trpc.router({
        list: this.trpc.protectedProcedure
          .input(z.object({ serviceId: z.string().uuid() }))
          .query(async ({ input }) => {
            return this.catalogService.findPricingTiers(input.serviceId)
          }),

        create: this.trpc.adminProcedure
          .input(CreatePricingTierSchema)
          .mutation(async ({ input }) => {
            return this.catalogService.createPricingTier(input)
          }),

        update: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid(), data: UpdatePricingTierSchema }))
          .mutation(async ({ input }) => {
            return this.catalogService.updatePricingTier(input.id, input.data)
          }),

        delete: this.trpc.adminProcedure
          .input(z.object({ id: z.string().cuid() }))
          .mutation(async ({ input }) => {
            return this.catalogService.deletePricingTier(input.id)
          }),
      }),
    })
  }
}
