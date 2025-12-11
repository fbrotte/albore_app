import { Module, forwardRef } from '@nestjs/common'
import { SummariesService } from './summaries.service'
import { SummariesTrpc } from './summaries.trpc'
import { TrpcModule } from '../../trpc/trpc.module'
import { AnalysesModule } from '../analyses/analyses.module'
import { CatalogModule } from '../catalog/catalog.module'

@Module({
  imports: [forwardRef(() => TrpcModule), forwardRef(() => AnalysesModule), CatalogModule],
  providers: [SummariesService, SummariesTrpc],
  exports: [SummariesService, SummariesTrpc],
})
export class SummariesModule {}
