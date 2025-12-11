import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CatalogService } from '../catalog/catalog.service'
import { LoggerService } from '../logger/logger.service'
import type { BillingPattern, UpdateSummary } from '@template-dev/shared'
import type { Decimal } from '@prisma/client/runtime/library'

interface LineWithPeriod {
  totalHt: Decimal
  periodStart: Date | null
  periodEnd: Date | null
  invoiceDate: Date | null
}

@Injectable()
export class SummariesService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(CatalogService) private catalogService: CatalogService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async findByAnalysis(analysisId: string) {
    return this.prisma.analysisSummary.findMany({
      where: { analysisId },
      orderBy: { totalHt: 'desc' },
      include: { matchedService: { include: { category: true } } },
    })
  }

  async findById(id: string) {
    const summary = await this.prisma.analysisSummary.findUnique({
      where: { id },
      include: { matchedService: { include: { category: true } } },
    })

    if (!summary) {
      throw new NotFoundException(`Summary ${id} not found`)
    }

    return summary
  }

  async consolidate(analysisId: string) {
    this.logger.log(`Consolidating analysis ${analysisId}`)

    // Get all matched lines grouped by service
    const matchedLines = await this.prisma.invoiceLine.findMany({
      where: {
        invoice: { analysisId },
        matchStatus: { in: ['AUTO', 'CONFIRMED', 'MANUAL'] },
        matchedServiceId: { not: null },
      },
      include: {
        invoice: true,
        matchedService: true,
      },
    })

    // Group by service
    const groupedByService = new Map<string, typeof matchedLines>()

    for (const line of matchedLines) {
      const serviceId = line.matchedServiceId!
      if (!groupedByService.has(serviceId)) {
        groupedByService.set(serviceId, [])
      }
      groupedByService.get(serviceId)!.push(line)
    }

    this.logger.log(`Found ${groupedByService.size} service groups`)

    // Get existing summaries to preserve ourPrice
    const existingSummaries = await this.prisma.analysisSummary.findMany({
      where: { analysisId },
    })

    const existingByService = new Map(existingSummaries.map((s) => [s.matchedServiceId, s]))

    // Delete existing summaries
    await this.prisma.analysisSummary.deleteMany({ where: { analysisId } })

    // Create new summaries
    type SummaryWithService = Awaited<ReturnType<typeof this.findById>>
    const summaries: SummaryWithService[] = []

    for (const [serviceId, lines] of groupedByService) {
      const linesWithPeriod: LineWithPeriod[] = lines.map((l) => ({
        totalHt: l.totalHt,
        periodStart: l.periodStart,
        periodEnd: l.periodEnd,
        invoiceDate: l.invoice.invoiceDate,
      }))

      const totalHt = lines.reduce((sum, l) => sum + Number(l.totalHt), 0)
      const monthsCount = this.calculateMonthsCount(linesWithPeriod)
      const avgMonthly = monthsCount > 0 ? totalHt / monthsCount : totalHt

      const monthlyAmounts = this.calculateMonthlyAmounts(linesWithPeriod, monthsCount)
      const minMonthly = Math.min(...monthlyAmounts)
      const maxMonthly = Math.max(...monthlyAmounts)

      const billingPattern = this.detectBillingPattern(monthlyAmounts, monthsCount)

      // Get service pricing
      const service = lines[0].matchedService!
      let ourPrice: number | null = null

      // Preserve existing ourPrice if available
      const existing = existingByService.get(serviceId)
      if (existing?.ourPrice) {
        ourPrice = Number(existing.ourPrice)
      }

      // Calculate savings
      let savingAmount: number | null = null
      let savingPercent: number | null = null

      if (ourPrice !== null && avgMonthly > 0) {
        savingAmount = avgMonthly - ourPrice
        savingPercent = (savingAmount / avgMonthly) * 100
      }

      const summary = await this.prisma.analysisSummary.create({
        data: {
          analysisId,
          matchedServiceId: serviceId,
          monthsCount,
          totalHt,
          avgMonthly,
          minMonthly,
          maxMonthly,
          billingPattern,
          ourPrice,
          ourPriceNote: existing?.ourPriceNote,
          savingAmount,
          savingPercent,
          includeInReport: existing?.includeInReport ?? true,
        },
        include: { matchedService: { include: { category: true } } },
      })

      summaries.push(summary)
    }

    // Update analysis status
    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'REVIEW' },
    })

    this.logger.log(`Created ${summaries.length} summaries`)

    return summaries
  }

  async update(id: string, data: UpdateSummary) {
    const summary = await this.findById(id)

    // Recalculate savings if ourPrice changed
    let savingAmount: number | null = summary.savingAmount ? Number(summary.savingAmount) : null
    let savingPercent: number | null = summary.savingPercent ? Number(summary.savingPercent) : null

    if (data.ourPrice !== undefined) {
      const avgMonthly = Number(summary.avgMonthly)
      if (data.ourPrice !== null && avgMonthly > 0) {
        savingAmount = avgMonthly - data.ourPrice
        savingPercent = (savingAmount / avgMonthly) * 100
      } else {
        savingAmount = null
        savingPercent = null
      }
    }

    return this.prisma.analysisSummary.update({
      where: { id },
      data: {
        ...data,
        savingAmount,
        savingPercent,
      },
      include: { matchedService: { include: { category: true } } },
    })
  }

  private calculateMonthsCount(lines: LineWithPeriod[]): number {
    // Find date range from periods or invoice dates
    const dates: Date[] = []

    for (const line of lines) {
      if (line.periodStart) dates.push(line.periodStart)
      if (line.periodEnd) dates.push(line.periodEnd)
      if (line.invoiceDate) dates.push(line.invoiceDate)
    }

    if (dates.length === 0) {
      return lines.length // Assume 1 month per line if no dates
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    const monthsDiff =
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) +
      1

    return Math.max(1, monthsDiff)
  }

  private calculateMonthlyAmounts(lines: LineWithPeriod[], monthsCount: number): number[] {
    if (lines.length === 1) {
      return [Number(lines[0].totalHt)]
    }

    // Simple distribution: sum / months for each line
    // In a real implementation, you'd distribute by actual periods
    return lines.map((l) => Number(l.totalHt))
  }

  private detectBillingPattern(monthlyAmounts: number[], monthsCount: number): BillingPattern {
    if (monthsCount === 1 || monthlyAmounts.length === 1) {
      return 'ONE_TIME'
    }

    if (monthlyAmounts.length < 2) {
      return 'FIXED'
    }

    const avg = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length
    const variance =
      monthlyAmounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / monthlyAmounts.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = avg > 0 ? stdDev / avg : 0

    // If variation is less than 5%, consider it fixed
    if (coefficientOfVariation < 0.05) {
      return 'FIXED'
    }

    return 'VARIABLE'
  }
}
