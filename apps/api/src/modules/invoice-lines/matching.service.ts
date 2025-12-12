import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { LoggerService } from '../logger/logger.service'
import type { MatchCandidate } from '@template-dev/shared'

export interface MatchResult {
  lineId: string
  status: 'AUTO' | 'PENDING' | 'UNMATCHED'
  matchedService?: MatchCandidate
  candidates: MatchCandidate[]
}

@Injectable()
export class MatchingService {
  private readonly AUTO_MATCH_THRESHOLD = 0.85
  private readonly CANDIDATE_THRESHOLD = 0.5
  private readonly MAX_CANDIDATES = 4

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AiService) private aiService: AiService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async matchLine(lineId: string): Promise<MatchResult> {
    const line = await this.prisma.invoiceLine.findUnique({
      where: { id: lineId },
    })

    if (!line) {
      throw new Error(`Line ${lineId} not found`)
    }

    if (!this.aiService.isConfigured()) {
      this.logger.warn('AI service not configured, cannot perform matching')
      return { lineId, status: 'UNMATCHED', candidates: [] }
    }

    // Generate embedding for line description
    const embeddings = await this.aiService.embedding({
      input: line.description,
    })
    const embedding = embeddings[0]

    // Find similar services using pgvector
    const candidates = await this.findSimilarServices(embedding)

    if (candidates.length === 0) {
      await this.prisma.invoiceLine.update({
        where: { id: lineId },
        data: {
          matchStatus: 'PENDING',
          matchCandidates: [],
        },
      })
      return { lineId, status: 'UNMATCHED', candidates: [] }
    }

    const topMatch = candidates[0]

    if (topMatch.score >= this.AUTO_MATCH_THRESHOLD) {
      // Auto-match
      await this.prisma.invoiceLine.update({
        where: { id: lineId },
        data: {
          matchedServiceId: topMatch.serviceId,
          matchStatus: 'AUTO',
          matchConfidence: topMatch.score,
          matchCandidates: candidates,
        },
      })

      this.logger.log(
        `Auto-matched line ${lineId} to service ${topMatch.serviceName} (${topMatch.score.toFixed(3)})`,
      )

      return {
        lineId,
        status: 'AUTO',
        matchedService: topMatch,
        candidates,
      }
    }

    // Store candidates for human review
    await this.prisma.invoiceLine.update({
      where: { id: lineId },
      data: {
        matchStatus: 'PENDING',
        matchCandidates: candidates,
      },
    })

    this.logger.log(
      `Line ${lineId} pending review with ${candidates.length} candidates (best: ${topMatch.score.toFixed(3)})`,
    )

    return {
      lineId,
      status: 'PENDING',
      candidates,
    }
  }

  async matchAllInAnalysis(analysisId: string): Promise<{
    total: number
    autoMatched: number
    pending: number
    results: MatchResult[]
  }> {
    // Get all pending lines in analysis
    const lines = await this.prisma.invoiceLine.findMany({
      where: {
        invoice: { analysisId },
        matchStatus: 'PENDING',
      },
    })

    this.logger.log(`Matching ${lines.length} lines in analysis ${analysisId}`)

    const results: MatchResult[] = []
    let autoMatched = 0
    let pending = 0

    for (const line of lines) {
      try {
        const result = await this.matchLine(line.id)
        results.push(result)

        if (result.status === 'AUTO') {
          autoMatched++
        } else {
          pending++
        }
      } catch (error) {
        this.logger.error(`Failed to match line ${line.id}:`, error)
        results.push({
          lineId: line.id,
          status: 'UNMATCHED',
          candidates: [],
        })
        pending++
      }
    }

    // Update analysis status
    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'MATCHING' },
    })

    return {
      total: lines.length,
      autoMatched,
      pending,
      results,
    }
  }

  private async findSimilarServices(embedding: number[]): Promise<MatchCandidate[]> {
    const embeddingStr = `[${embedding.join(',')}]`

    const results = await this.prisma.$queryRaw<
      { serviceId: string; serviceName: string; score: number }[]
    >`
      SELECT
        id as "serviceId",
        name as "serviceName",
        1 - ("descriptionEmbedding" <=> ${embeddingStr}::vector) as score
      FROM services
      WHERE "isActive" = true
        AND "deletedAt" IS NULL
        AND "descriptionEmbedding" IS NOT NULL
        AND 1 - ("descriptionEmbedding" <=> ${embeddingStr}::vector) >= ${this.CANDIDATE_THRESHOLD}
      ORDER BY score DESC
      LIMIT ${this.MAX_CANDIDATES}
    `

    return results.map((r) => ({
      serviceId: r.serviceId,
      serviceName: r.serviceName,
      score: Number(r.score),
    }))
  }
}
