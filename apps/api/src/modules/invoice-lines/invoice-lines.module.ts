import { Module, forwardRef } from '@nestjs/common'
import { InvoiceLinesService } from './invoice-lines.service'
import { InvoiceLinesTrpc } from './invoice-lines.trpc'
import { MatchingService } from './matching.service'
import { TrpcModule } from '../../trpc/trpc.module'
import { AiModule } from '../ai/ai.module'
import { AnalysesModule } from '../analyses/analyses.module'

@Module({
  imports: [forwardRef(() => TrpcModule), AiModule, forwardRef(() => AnalysesModule)],
  providers: [InvoiceLinesService, InvoiceLinesTrpc, MatchingService],
  exports: [InvoiceLinesService, InvoiceLinesTrpc, MatchingService],
})
export class InvoiceLinesModule {}
