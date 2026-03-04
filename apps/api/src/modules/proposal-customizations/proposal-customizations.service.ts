import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LoggerService } from '../logger/logger.service'
import type { UpsertProposalCustomization } from '@template-dev/shared'

@Injectable()
export class ProposalCustomizationsService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async getByAnalysisId(analysisId: string) {
    this.logger.debug(`Getting proposal customizations for analysis ${analysisId}`)

    return this.prisma.proposalCustomization.findMany({
      where: { analysisId },
      orderBy: { sectionKey: 'asc' },
    })
  }

  async upsert(data: UpsertProposalCustomization) {
    this.logger.debug(`Upserting proposal customization for ${data.analysisId}:${data.sectionKey}`)

    return this.prisma.proposalCustomization.upsert({
      where: {
        analysisId_sectionKey: {
          analysisId: data.analysisId,
          sectionKey: data.sectionKey,
        },
      },
      update: {
        customText: data.customText,
      },
      create: {
        analysisId: data.analysisId,
        sectionKey: data.sectionKey,
        customText: data.customText,
      },
    })
  }
}
