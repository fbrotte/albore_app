import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { AnalysesService } from '../analyses/analyses.service'
import { VisionService } from './vision.service'
import { LoggerService } from '../logger/logger.service'
import type { VisionExtractionResult } from '@template-dev/shared'

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(StorageService) private storageService: StorageService,
    @Inject(AnalysesService) private analysesService: AnalysesService,
    @Inject(VisionService) private visionService: VisionService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async findAll(analysisId: string) {
    return this.prisma.invoice.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { lines: true } },
      },
    })
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: {
          include: { matchedService: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`)
    }

    return invoice
  }

  async upload(
    analysisId: string,
    userId: string,
    fileName: string,
    fileContent: string,
  ): Promise<{
    invoice: Awaited<ReturnType<typeof this.findById>>
    extraction: VisionExtractionResult
  }> {
    // Verify access
    await this.analysesService.verifyAccess(analysisId, userId)

    // Decode base64 content
    const fileBuffer = Buffer.from(fileContent, 'base64')

    // Save file
    const filePath = await this.storageService.saveFile(userId, analysisId, fileName, fileBuffer)

    // Create invoice record with PROCESSING status
    const invoice = await this.prisma.invoice.create({
      data: {
        analysisId,
        vendorName: "En cours d'extraction...",
        filePath,
        fileName,
        extractionStatus: 'PROCESSING',
      },
    })

    try {
      // Extract data using Vision
      const extraction = await this.visionService.extractInvoice(fileBuffer, fileName)

      // Update invoice with extracted data
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          vendorName: extraction.vendor_name,
          invoiceNumber: extraction.invoice_number,
          invoiceDate: extraction.invoice_date ? new Date(extraction.invoice_date) : null,
          totalHt: extraction.total_ht,
          totalTva: extraction.total_tva,
          totalTtc: extraction.total_ttc,
          extractedRaw: extraction as object,
          extractionStatus: 'COMPLETED',
        },
      })

      // Create invoice lines
      if (extraction.lines && extraction.lines.length > 0) {
        await this.prisma.invoiceLine.createMany({
          data: extraction.lines.map((line) => ({
            invoiceId: invoice.id,
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

      // Update analysis status
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'IMPORTING' },
      })

      this.logger.log(
        `Invoice ${invoice.id} extracted successfully with ${extraction.lines?.length ?? 0} lines`,
      )

      return {
        invoice: await this.findById(invoice.id),
        extraction,
      }
    } catch (error) {
      // Update invoice with error
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          extractionStatus: 'ERROR',
          extractionError: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  async reprocess(id: string, userId: string) {
    const invoice = await this.findById(id)

    // Verify access through analysis
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: invoice.analysisId },
      include: { client: true },
    })

    if (!analysis || analysis.client.userId !== userId) {
      throw new NotFoundException(`Invoice ${id} not found`)
    }

    // Get file content
    const fileBuffer = await this.storageService.getFile(invoice.filePath)

    // Update status
    await this.prisma.invoice.update({
      where: { id },
      data: { extractionStatus: 'PROCESSING', extractionError: null },
    })

    try {
      // Re-extract
      const extraction = await this.visionService.extractInvoice(fileBuffer, invoice.fileName)

      // Delete existing lines
      await this.prisma.invoiceLine.deleteMany({ where: { invoiceId: id } })

      // Update invoice
      await this.prisma.invoice.update({
        where: { id },
        data: {
          vendorName: extraction.vendor_name,
          invoiceNumber: extraction.invoice_number,
          invoiceDate: extraction.invoice_date ? new Date(extraction.invoice_date) : null,
          totalHt: extraction.total_ht,
          totalTva: extraction.total_tva,
          totalTtc: extraction.total_ttc,
          extractedRaw: extraction as object,
          extractionStatus: 'COMPLETED',
        },
      })

      // Create new lines
      if (extraction.lines && extraction.lines.length > 0) {
        await this.prisma.invoiceLine.createMany({
          data: extraction.lines.map((line) => ({
            invoiceId: id,
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

      return {
        invoice: await this.findById(id),
        extraction,
      }
    } catch (error) {
      await this.prisma.invoice.update({
        where: { id },
        data: {
          extractionStatus: 'ERROR',
          extractionError: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  async delete(id: string, userId: string) {
    const invoice = await this.findById(id)

    // Verify access
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: invoice.analysisId },
      include: { client: true },
    })

    if (!analysis || analysis.client.userId !== userId) {
      throw new NotFoundException(`Invoice ${id} not found`)
    }

    // Delete file
    try {
      await this.storageService.deleteFile(invoice.filePath)
    } catch (error) {
      this.logger.warn(`Failed to delete file for invoice ${id}:`, error)
    }

    // Delete invoice (lines will cascade)
    await this.prisma.invoice.delete({ where: { id } })

    return { success: true }
  }
}
