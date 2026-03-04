import { Module, forwardRef } from '@nestjs/common'
import { ProposalCustomizationsService } from './proposal-customizations.service'
import { ProposalCustomizationsTrpc } from './proposal-customizations.trpc'
import { TrpcModule } from '../../trpc/trpc.module'
import { AnalysesModule } from '../analyses/analyses.module'

@Module({
  imports: [forwardRef(() => TrpcModule), forwardRef(() => AnalysesModule)],
  providers: [ProposalCustomizationsService, ProposalCustomizationsTrpc],
  exports: [ProposalCustomizationsService, ProposalCustomizationsTrpc],
})
export class ProposalCustomizationsModule {}
