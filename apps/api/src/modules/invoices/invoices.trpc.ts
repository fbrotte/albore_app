import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { InvoicesService } from './invoices.service'
import { AnalysesService } from '../analyses/analyses.service'
import { UploadInvoiceSchema } from '@template-dev/shared'

@Injectable()
export class InvoicesTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(InvoicesService) private readonly invoicesService: InvoicesService,
    @Inject(AnalysesService) private readonly analysesService: AnalysesService,
  ) {
    this.router = this.trpc.router({
      list: this.trpc.protectedProcedure
        .input(z.object({ analysisId: z.string().cuid() }))
        .query(async ({ input, ctx }) => {
          // Verify access
          await this.analysesService.verifyAccess(input.analysisId, ctx.user!.userId)
          return this.invoicesService.findAll(input.analysisId)
        }),

      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.invoicesService.findById(input.id)
        }),

      upload: this.trpc.protectedProcedure
        .input(UploadInvoiceSchema)
        .mutation(async ({ input, ctx }) => {
          return this.invoicesService.upload(
            input.analysisId,
            ctx.user!.userId,
            input.fileName,
            input.fileContent,
          )
        }),

      reprocess: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(async ({ input, ctx }) => {
          return this.invoicesService.reprocess(input.id, ctx.user!.userId)
        }),

      delete: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(async ({ input, ctx }) => {
          return this.invoicesService.delete(input.id, ctx.user!.userId)
        }),
    })
  }
}
