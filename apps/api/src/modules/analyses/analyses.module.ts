import { Module, forwardRef } from '@nestjs/common'
import { AnalysesService } from './analyses.service'
import { AnalysesTrpc } from './analyses.trpc'
import { TrpcModule } from '../../trpc/trpc.module'

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [AnalysesService, AnalysesTrpc],
  exports: [AnalysesService, AnalysesTrpc],
})
export class AnalysesModule {}
