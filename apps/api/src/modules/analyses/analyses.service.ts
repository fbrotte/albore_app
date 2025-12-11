import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateAnalysis, UpdateAnalysis } from '@template-dev/shared'

@Injectable()
export class AnalysesService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(clientId: string, userId: string) {
    // Verify client ownership
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, userId, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`)
    }

    return this.prisma.analysis.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { invoices: true, summaries: true } },
      },
    })
  }

  async findById(id: string, userId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: true,
        invoices: {
          include: {
            lines: {
              include: { matchedService: true },
            },
          },
        },
        summaries: {
          include: { matchedService: true },
        },
        _count: { select: { invoices: true, summaries: true } },
      },
    })

    if (!analysis) {
      throw new NotFoundException(`Analysis ${id} not found`)
    }

    // Verify ownership
    if (analysis.client.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return analysis
  }

  async create(userId: string, data: CreateAnalysis) {
    // Verify client ownership
    const client = await this.prisma.client.findFirst({
      where: { id: data.clientId, userId, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException(`Client ${data.clientId} not found`)
    }

    return this.prisma.analysis.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        notes: data.notes,
        status: 'DRAFT',
      },
    })
  }

  async update(id: string, userId: string, data: UpdateAnalysis) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, deletedAt: null },
      include: { client: true },
    })

    if (!analysis) {
      throw new NotFoundException(`Analysis ${id} not found`)
    }

    if (analysis.client.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.analysis.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, deletedAt: null },
      include: { client: true },
    })

    if (!analysis) {
      throw new NotFoundException(`Analysis ${id} not found`)
    }

    if (analysis.client.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.analysis.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async getStats(id: string, userId: string) {
    const analysis = await this.findById(id, userId)

    // Calculate stats
    const invoices = analysis.invoices
    const lines = invoices.flatMap((i) => i.lines)

    const stats = {
      invoiceCount: invoices.length,
      lineCount: lines.length,
      autoMatchedCount: lines.filter((l) => l.matchStatus === 'AUTO').length,
      confirmedCount: lines.filter((l) => l.matchStatus === 'CONFIRMED').length,
      manualCount: lines.filter((l) => l.matchStatus === 'MANUAL').length,
      pendingCount: lines.filter((l) => l.matchStatus === 'PENDING').length,
      ignoredCount: lines.filter((l) => l.matchStatus === 'IGNORED').length,
      totalHt: lines.reduce((sum, l) => sum + Number(l.totalHt), 0),
      summaryCount: analysis.summaries.length,
      totalSavings: analysis.summaries.reduce((sum, s) => sum + Number(s.savingAmount ?? 0), 0),
    }

    return stats
  }

  // Verify user has access to analysis
  async verifyAccess(analysisId: string, userId: string): Promise<void> {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id: analysisId, deletedAt: null },
      include: { client: true },
    })

    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found`)
    }

    if (analysis.client.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }
  }
}
