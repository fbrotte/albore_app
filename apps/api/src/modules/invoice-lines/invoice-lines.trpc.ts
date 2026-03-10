import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { InvoiceLinesService } from './invoice-lines.service'
import { AnalysesService } from '../analyses/analyses.service'
import { SetMatchSchema, UpdateInvoiceLineSchema } from '@template-dev/shared'

@Injectable()
export class InvoiceLinesTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(InvoiceLinesService) private readonly invoiceLinesService: InvoiceLinesService,
    @Inject(AnalysesService) private readonly analysesService: AnalysesService,
  ) {
    this.router = this.trpc.router({
      list: this.trpc.protectedProcedure
        .input(z.object({ invoiceId: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.invoiceLinesService.findByInvoice(input.invoiceId)
        }),

      listByAnalysis: this.trpc.protectedProcedure
        .input(z.object({ analysisId: z.string().cuid() }))
        .query(async ({ input }) => {
          await this.analysesService.verifyAccess(input.analysisId)
          return this.invoiceLinesService.findByAnalysis(input.analysisId)
        }),

      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.invoiceLinesService.findById(input.id)
        }),

      match: this.trpc.protectedProcedure
        .input(z.object({ lineId: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.invoiceLinesService.matchLine(input.lineId)
        }),

      matchAll: this.trpc.protectedProcedure
        .input(z.object({ analysisId: z.string().cuid() }))
        .mutation(async ({ input }) => {
          await this.analysesService.verifyAccess(input.analysisId)
          return this.invoiceLinesService.matchAllInAnalysis(input.analysisId)
        }),

      setMatch: this.trpc.protectedProcedure.input(SetMatchSchema).mutation(async ({ input }) => {
        return this.invoiceLinesService.setMatch(input.lineId, input.serviceId)
      }),

      confirmMatch: this.trpc.protectedProcedure
        .input(z.object({ lineId: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.invoiceLinesService.confirmMatch(input.lineId)
        }),

      ignore: this.trpc.protectedProcedure
        .input(z.object({ lineId: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.invoiceLinesService.ignore(input.lineId)
        }),

      resetMatch: this.trpc.protectedProcedure
        .input(z.object({ lineId: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.invoiceLinesService.resetMatch(input.lineId)
        }),

      update: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid(), data: UpdateInvoiceLineSchema }))
        .mutation(async ({ input }) => {
          return this.invoiceLinesService.update(input.id, input.data)
        }),
    })
  }
}
