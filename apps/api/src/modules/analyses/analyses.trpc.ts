import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { AnalysesService } from './analyses.service'
import { CreateAnalysisSchema, UpdateAnalysisSchema } from '@template-dev/shared'

@Injectable()
export class AnalysesTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(AnalysesService) private readonly analysesService: AnalysesService,
  ) {
    this.router = this.trpc.router({
      list: this.trpc.protectedProcedure
        .input(z.object({ clientId: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.analysesService.findAll(input.clientId)
        }),

      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.analysesService.findById(input.id)
        }),

      create: this.trpc.protectedProcedure
        .input(CreateAnalysisSchema)
        .mutation(async ({ input }) => {
          return this.analysesService.create(input)
        }),

      update: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid(), data: UpdateAnalysisSchema }))
        .mutation(async ({ input }) => {
          return this.analysesService.update(input.id, input.data)
        }),

      delete: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.analysesService.delete(input.id)
        }),

      getStats: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.analysesService.getStats(input.id)
        }),

      getDashboardStats: this.trpc.protectedProcedure.query(async () => {
        return this.analysesService.getDashboardStats()
      }),
    })
  }
}
