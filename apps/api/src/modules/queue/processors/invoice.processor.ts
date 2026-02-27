import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Inject, forwardRef } from '@nestjs/common'
import type { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { StorageService } from '../../storage/storage.service'
import { VisionService } from '../../invoices/vision.service'
import { LoggerService } from '../../logger/logger.service'
import type { InvoiceJobData, InvoiceJobProgress } from '../queue.service'
import type { VisionExtractionResult } from '@template-dev/shared'

@Processor('invoice-processing')
export class InvoiceProcessor extends WorkerHost {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(StorageService) private storageService: StorageService,
    @Inject(forwardRef(() => VisionService)) private visionService: VisionService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {
    super()
  }

  async process(
    job: Job<InvoiceJobData>,
  ): Promise<{ success: boolean; extraction?: VisionExtractionResult }> {
    const { invoiceId, filePath, fileName } = job.data

    this.logger.log(`Processing invoice ${invoiceId} (job ${job.id})`)

    try {
      // Update progress: extracting
      await job.updateProgress({
        step: 'extracting',
        message: 'Extraction en cours avec Haiku...',
      } as InvoiceJobProgress)

      // Get file content
      const fileBuffer = await this.storageService.getFile(filePath)

      // Try extraction with Haiku first
      let extraction = await this.visionService.extractInvoice(fileBuffer, fileName, 'haiku')
      let usedModel = 'haiku'

      // Validate extraction
      await job.updateProgress({
        step: 'validating',
        message: 'Validation des donnees...',
      } as InvoiceJobProgress)
      const validationResult = this.validateExtraction(extraction)

      if (!validationResult.isValid) {
        // Retry with Sonnet
        await job.updateProgress({
          step: 'retrying_sonnet',
          message: `Validation echouee (${validationResult.errors.join(', ')}). Nouvelle tentative avec Sonnet...`,
        } as InvoiceJobProgress)

        this.logger.warn(
          `Haiku extraction failed validation for invoice ${invoiceId}: ${validationResult.errors.join(', ')}. Retrying with Sonnet.`,
        )

        extraction = await this.visionService.extractInvoice(fileBuffer, fileName, 'sonnet')
        usedModel = 'sonnet'

        // Validate again (but proceed anyway)
        const secondValidation = this.validateExtraction(extraction)
        if (!secondValidation.isValid) {
          this.logger.warn(
            `Sonnet extraction also has validation issues for invoice ${invoiceId}: ${secondValidation.errors.join(', ')}`,
          )
        }
      }

      // Save extraction results
      await job.updateProgress({
        step: 'saving',
        message: 'Enregistrement des resultats...',
      } as InvoiceJobProgress)

      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          vendorName: extraction.vendor_name || 'Fournisseur inconnu',
          invoiceNumber: extraction.invoice_number,
          invoiceDate: extraction.invoice_date ? new Date(extraction.invoice_date) : null,
          totalHt: extraction.total_ht,
          totalTva: extraction.total_tva,
          totalTtc: extraction.total_ttc,
          extractedRaw: { ...extraction, usedModel } as object,
          extractionStatus: 'COMPLETED',
        },
      })

      // Create invoice lines
      if (extraction.lines && extraction.lines.length > 0) {
        await this.prisma.invoiceLine.createMany({
          data: extraction.lines.map((line) => ({
            invoiceId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unit_price,
            totalHt: line.total_ht,
            periodStart: line.period_start ? new Date(line.period_start) : null,
            periodEnd: line.period_end ? new Date(line.period_end) : null,
            matchStatus: 'PENDING',
          })),
        })
      }

      await job.updateProgress({
        step: 'completed',
        message: 'Extraction terminee',
      } as InvoiceJobProgress)

      this.logger.log(
        `Invoice ${invoiceId} processed successfully with ${extraction.lines?.length ?? 0} lines (model: ${usedModel})`,
      )

      return { success: true, extraction }
    } catch (error) {
      this.logger.error(`Failed to process invoice ${invoiceId}:`, error)

      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          extractionStatus: 'ERROR',
          extractionError: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      await job.updateProgress({
        step: 'failed',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      } as InvoiceJobProgress)

      throw error
    }
  }

  private validateExtraction(extraction: VisionExtractionResult): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Rule 1: Must have vendor_name
    if (!extraction.vendor_name || extraction.vendor_name.trim() === '') {
      errors.push('vendor_name manquant')
    }

    // Rule 2: Must have at least 1 line
    if (!extraction.lines || extraction.lines.length === 0) {
      errors.push('aucune ligne detectee')
    }

    // Rule 3: Sum of lines should match total_ht (+-1 EUR tolerance)
    if (extraction.lines && extraction.lines.length > 0 && extraction.total_ht !== null) {
      const linesSum = extraction.lines.reduce((sum, line) => sum + (line.total_ht ?? 0), 0)
      const difference = Math.abs(linesSum - extraction.total_ht)
      if (difference > 1) {
        errors.push(
          `total mismatch: lignes=${linesSum.toFixed(2)}, total_ht=${extraction.total_ht.toFixed(2)}`,
        )
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<InvoiceJobData>) {
    this.logger.log(`Job ${job.id} completed for invoice ${job.data.invoiceId}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<InvoiceJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed for invoice ${job.data.invoiceId}: ${error.message}`)
  }
}
