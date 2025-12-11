import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MatchingService } from './matching.service'
import type { UpdateInvoiceLine } from '@template-dev/shared'

@Injectable()
export class InvoiceLinesService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(MatchingService) private matchingService: MatchingService,
  ) {}

  async findByInvoice(invoiceId: string) {
    return this.prisma.invoiceLine.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'asc' },
      include: { matchedService: true },
    })
  }

  async findByAnalysis(analysisId: string) {
    return this.prisma.invoiceLine.findMany({
      where: { invoice: { analysisId } },
      orderBy: [{ invoice: { createdAt: 'asc' } }, { createdAt: 'asc' }],
      include: { matchedService: true },
    })
  }

  async findById(id: string) {
    const line = await this.prisma.invoiceLine.findUnique({
      where: { id },
      include: {
        invoice: {
          include: { analysis: { include: { client: true } } },
        },
        matchedService: true,
      },
    })

    if (!line) {
      throw new NotFoundException(`Invoice line ${id} not found`)
    }

    return line
  }

  async matchLine(lineId: string) {
    return this.matchingService.matchLine(lineId)
  }

  async matchAllInAnalysis(analysisId: string) {
    return this.matchingService.matchAllInAnalysis(analysisId)
  }

  async setMatch(lineId: string, serviceId: string) {
    const line = await this.prisma.invoiceLine.findUnique({ where: { id: lineId } })

    if (!line) {
      throw new NotFoundException(`Invoice line ${lineId} not found`)
    }

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null },
    })

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`)
    }

    return this.prisma.invoiceLine.update({
      where: { id: lineId },
      data: {
        matchedServiceId: serviceId,
        matchStatus: 'MANUAL',
        matchConfidence: 1.0, // Manual match = 100% confidence
      },
      include: { matchedService: true },
    })
  }

  async confirmMatch(lineId: string) {
    const line = await this.prisma.invoiceLine.findUnique({ where: { id: lineId } })

    if (!line) {
      throw new NotFoundException(`Invoice line ${lineId} not found`)
    }

    if (!line.matchedServiceId) {
      throw new Error('Cannot confirm match without a matched service')
    }

    return this.prisma.invoiceLine.update({
      where: { id: lineId },
      data: { matchStatus: 'CONFIRMED' },
      include: { matchedService: true },
    })
  }

  async ignore(lineId: string) {
    const line = await this.prisma.invoiceLine.findUnique({ where: { id: lineId } })

    if (!line) {
      throw new NotFoundException(`Invoice line ${lineId} not found`)
    }

    return this.prisma.invoiceLine.update({
      where: { id: lineId },
      data: {
        matchedServiceId: null,
        matchStatus: 'IGNORED',
        matchConfidence: null,
      },
      include: { matchedService: true },
    })
  }

  async resetMatch(lineId: string) {
    const line = await this.prisma.invoiceLine.findUnique({ where: { id: lineId } })

    if (!line) {
      throw new NotFoundException(`Invoice line ${lineId} not found`)
    }

    return this.prisma.invoiceLine.update({
      where: { id: lineId },
      data: {
        matchedServiceId: null,
        matchStatus: 'PENDING',
        matchConfidence: null,
      },
      include: { matchedService: true },
    })
  }

  async update(lineId: string, data: UpdateInvoiceLine) {
    const line = await this.prisma.invoiceLine.findUnique({ where: { id: lineId } })

    if (!line) {
      throw new NotFoundException(`Invoice line ${lineId} not found`)
    }

    return this.prisma.invoiceLine.update({
      where: { id: lineId },
      data,
      include: { matchedService: true },
    })
  }
}
