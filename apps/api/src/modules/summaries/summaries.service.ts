import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CatalogService } from '../catalog/catalog.service'
import { LoggerService } from '../logger/logger.service'
import type { BillingPattern, UpdateSummary } from '@template-dev/shared'
import type { Decimal } from '@prisma/client/runtime/library'

interface LineWithPeriod {
  totalHt: Decimal
  quantity: Decimal | null
  unitPrice: Decimal | null
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
        quantity: l.quantity,
        unitPrice: l.unitPrice,
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

      // Calculate quantities
      const quantityStats = this.calculateQuantityStats(linesWithPeriod, monthsCount)

      // Get service pricing
      const service = lines[0].matchedService!

      // Preserve existing ourPrice if available, otherwise use service basePrice (unit price)
      const existing = existingByService.get(serviceId)
      let ourPrice: number | null = null

      if (existing?.ourPrice) {
        // Preserve manually set price
        ourPrice = Number(existing.ourPrice)
      } else if (service.basePrice) {
        // Default to service catalog unit price
        ourPrice = Number(service.basePrice)
      }

      // Calculate savings based on unit prices and quantities
      let savingAmount: number | null = null
      let savingPercent: number | null = null

      if (ourPrice !== null && quantityStats.avgQuantity && quantityStats.avgUnitPrice) {
        // Calculate monthly saving: (current unit price - our unit price) * avg quantity
        const unitPriceDiff = quantityStats.avgUnitPrice - ourPrice
        savingAmount = unitPriceDiff * quantityStats.avgQuantity
        // Percent saving on the monthly amount
        if (avgMonthly > 0) {
          savingPercent = (savingAmount / avgMonthly) * 100
        }
      } else if (ourPrice !== null && avgMonthly > 0) {
        // Fallback: if no quantity info, compare total amounts (less accurate)
        // This assumes ourPrice represents a comparable monthly total
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
          totalQuantity: quantityStats.totalQuantity,
          avgQuantity: quantityStats.avgQuantity,
          minQuantity: quantityStats.minQuantity,
          maxQuantity: quantityStats.maxQuantity,
          avgUnitPrice: quantityStats.avgUnitPrice,
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
      const avgQuantity = summary.avgQuantity ? Number(summary.avgQuantity) : null
      const avgUnitPrice = summary.avgUnitPrice ? Number(summary.avgUnitPrice) : null

      if (data.ourPrice !== null && avgQuantity && avgUnitPrice) {
        // Calculate saving based on unit price difference
        const unitPriceDiff = avgUnitPrice - data.ourPrice
        savingAmount = unitPriceDiff * avgQuantity
        if (avgMonthly > 0) {
          savingPercent = (savingAmount / avgMonthly) * 100
        }
      } else if (data.ourPrice !== null && avgMonthly > 0) {
        // Fallback: compare total amounts
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

  private calculateMonthlyAmounts(lines: LineWithPeriod[], _monthsCount: number): number[] {
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

  private calculateQuantityStats(
    lines: LineWithPeriod[],
    monthsCount: number,
  ): {
    totalQuantity: number | null
    avgQuantity: number | null
    minQuantity: number | null
    maxQuantity: number | null
    avgUnitPrice: number | null
  } {
    // Extract quantities from lines that have them
    const quantities = lines.filter((l) => l.quantity !== null).map((l) => Number(l.quantity))

    if (quantities.length === 0) {
      // No quantity info available - try to infer from totalHt and unitPrice
      const linesWithUnitPrice = lines.filter(
        (l) => l.unitPrice !== null && Number(l.unitPrice) > 0,
      )

      if (linesWithUnitPrice.length > 0) {
        // Calculate implied quantities from totalHt / unitPrice
        const impliedQuantities = linesWithUnitPrice.map((l) => {
          const total = Number(l.totalHt)
          const unit = Number(l.unitPrice)
          return total / unit
        })

        const totalQuantity = impliedQuantities.reduce((sum, q) => sum + q, 0)
        const avgQuantity = totalQuantity / monthsCount
        const totalHt = lines.reduce((sum, l) => sum + Number(l.totalHt), 0)
        const avgUnitPrice = totalQuantity > 0 ? totalHt / totalQuantity : null

        return {
          totalQuantity,
          avgQuantity,
          minQuantity: Math.min(...impliedQuantities),
          maxQuantity: Math.max(...impliedQuantities),
          avgUnitPrice,
        }
      }

      return {
        totalQuantity: null,
        avgQuantity: null,
        minQuantity: null,
        maxQuantity: null,
        avgUnitPrice: null,
      }
    }

    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
    const avgQuantity = totalQuantity / monthsCount
    const minQuantity = Math.min(...quantities)
    const maxQuantity = Math.max(...quantities)

    // Calculate average unit price from total amount / total quantity
    const totalHt = lines.reduce((sum, l) => sum + Number(l.totalHt), 0)
    const avgUnitPrice = totalQuantity > 0 ? totalHt / totalQuantity : null

    return {
      totalQuantity,
      avgQuantity,
      minQuantity,
      maxQuantity,
      avgUnitPrice,
    }
  }
}
