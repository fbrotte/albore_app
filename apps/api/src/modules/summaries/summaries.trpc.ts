import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { SummariesService } from './summaries.service'
import { AnalysesService } from '../analyses/analyses.service'
import { UpdateSummarySchema } from '@template-dev/shared'

@Injectable()
export class SummariesTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(SummariesService) private readonly summariesService: SummariesService,
    @Inject(AnalysesService) private readonly analysesService: AnalysesService,
  ) {
    this.router = this.trpc.router({
      list: this.trpc.protectedProcedure
        .input(z.object({ analysisId: z.string().min(1) }))
        .query(async ({ input }) => {
          await this.analysesService.verifyAccess(input.analysisId)
          return this.summariesService.findByAnalysis(input.analysisId)
        }),

      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ input }) => {
          return this.summariesService.findById(input.id)
        }),

      consolidate: this.trpc.protectedProcedure
        .input(z.object({ analysisId: z.string().min(1) }))
        .mutation(async ({ input }) => {
          await this.analysesService.verifyAccess(input.analysisId)
          return this.summariesService.consolidate(input.analysisId)
        }),

      update: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().min(1), data: UpdateSummarySchema }))
        .mutation(async ({ input }) => {
          return this.summariesService.update(input.id, input.data)
        }),
    })
  }
}
