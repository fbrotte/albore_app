import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { TrpcService } from '../../trpc/trpc.service'
import { InvoicesService } from './invoices.service'
import { AnalysesService } from '../analyses/analyses.service'
import { UploadInvoiceSchema, BulkUploadInvoiceSchema } from '@template-dev/shared'

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

      // === BULK UPLOAD ENDPOINTS ===

      bulkUpload: this.trpc.protectedProcedure
        .input(BulkUploadInvoiceSchema)
        .mutation(async ({ input, ctx }) => {
          const batchId = uuidv4()
          const results = await this.invoicesService.createBulkInvoices(
            input.analysisId,
            ctx.user!.userId,
            input.files,
            batchId,
          )

          // Return mapping of fileName to invoiceId for frontend
          const fileToInvoiceMap: Record<string, string> = {}
          input.files.forEach((file, index) => {
            fileToInvoiceMap[file.fileName] = results[index].invoiceId
          })

          return {
            batchId,
            invoiceIds: results.map((r) => r.invoiceId),
            jobIds: results.map((r) => r.jobId),
            fileToInvoiceMap,
          }
        }),

      getBatchStatus: this.trpc.protectedProcedure
        .input(
          z.object({
            batchId: z.string().uuid(),
            analysisId: z.string().cuid(),
          }),
        )
        .query(async ({ input, ctx }) => {
          await this.analysesService.verifyAccess(input.analysisId, ctx.user!.userId)
          return this.invoicesService.getBatchStatus(input.batchId, input.analysisId)
        }),

      retryInvoice: this.trpc.protectedProcedure
        .input(z.object({ invoiceId: z.string().cuid() }))
        .mutation(async ({ input, ctx }) => {
          return this.invoicesService.retryInvoice(input.invoiceId, ctx.user!.userId)
        }),
    })
  }
}
