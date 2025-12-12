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

  async getDashboardStats(userId: string) {
    // Get all clients for this user
    const clients = await this.prisma.client.findMany({
      where: { userId, deletedAt: null },
    })

    const clientIds = clients.map((c) => c.id)

    // Get all analyses with their summaries
    const analyses = await this.prisma.analysis.findMany({
      where: {
        clientId: { in: clientIds },
        deletedAt: null,
      },
      include: {
        client: true,
        summaries: true,
        invoices: true,
        _count: { select: { invoices: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    // Calculate aggregated stats
    const allSummaries = analyses.flatMap((a) => a.summaries)
    const allInvoices = analyses.flatMap((a) => a.invoices)

    const totalSavings = allSummaries.reduce((sum, s) => sum + Number(s.savingAmount ?? 0), 0)

    const savingsPercents = allSummaries
      .filter((s) => s.savingPercent !== null)
      .map((s) => Number(s.savingPercent))

    const averageSavingsPercent =
      savingsPercents.length > 0
        ? savingsPercents.reduce((sum, p) => sum + p, 0) / savingsPercents.length
        : 0

    // Format recent analyses for dashboard
    const recentAnalyses = analyses.map((a) => {
      const analysisSavings = a.summaries.reduce((sum, s) => sum + Number(s.savingAmount ?? 0), 0)
      const analysisTotal = a.summaries.reduce((sum, s) => sum + Number(s.avgMonthly ?? 0), 0)
      const savingsPercent =
        analysisTotal > 0 ? (analysisSavings / (analysisTotal + analysisSavings)) * 100 : 0

      return {
        id: a.id,
        name: a.name,
        status: a.status,
        clientName: a.client.name,
        clientCompany: a.client.company,
        invoiceCount: a._count.invoices,
        totalHt: a.invoices.reduce((sum, inv) => sum + Number(inv.totalHt ?? 0), 0),
        totalSavings: analysisSavings,
        savingsPercent: Math.round(savingsPercent * 10) / 10,
        updatedAt: a.updatedAt,
      }
    })

    return {
      invoicesAnalyzed: allInvoices.length,
      totalSavings: Math.round(totalSavings * 100) / 100,
      averageSavingsPercent: Math.round(averageSavingsPercent * 10) / 10,
      activeClients: clients.length,
      analysesCount: analyses.length,
      recentAnalyses,
    }
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
