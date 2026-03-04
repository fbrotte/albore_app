import { Injectable, Inject } from '@nestjs/common'
import { TrpcService } from '../../trpc/trpc.service'
import { ProposalCustomizationsService } from './proposal-customizations.service'
import { AnalysesService } from '../analyses/analyses.service'
import {
  GetProposalCustomizationsSchema,
  UpsertProposalCustomizationSchema,
} from '@template-dev/shared'

@Injectable()
export class ProposalCustomizationsTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(ProposalCustomizationsService)
    private readonly proposalCustomizationsService: ProposalCustomizationsService,
    @Inject(AnalysesService) private readonly analysesService: AnalysesService,
  ) {
    this.router = this.trpc.router({
      get: this.trpc.protectedProcedure
        .input(GetProposalCustomizationsSchema)
        .query(async ({ input, ctx }) => {
          // Verify the user has access to this analysis
          await this.analysesService.verifyAccess(input.analysisId, ctx.user!.userId)
          return this.proposalCustomizationsService.getByAnalysisId(input.analysisId)
        }),

      upsert: this.trpc.protectedProcedure
        .input(UpsertProposalCustomizationSchema)
        .mutation(async ({ input, ctx }) => {
          // Verify the user has access to this analysis
          await this.analysesService.verifyAccess(input.analysisId, ctx.user!.userId)
          return this.proposalCustomizationsService.upsert(input)
        }),
    })
  }
}
