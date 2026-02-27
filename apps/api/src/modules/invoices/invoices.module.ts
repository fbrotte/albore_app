import { Module, forwardRef } from '@nestjs/common'
import { InvoicesService } from './invoices.service'
import { InvoicesTrpc } from './invoices.trpc'
import { VisionService } from './vision.service'
import { TrpcModule } from '../../trpc/trpc.module'
import { AiModule } from '../ai/ai.module'
import { AnalysesModule } from '../analyses/analyses.module'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [
    forwardRef(() => TrpcModule),
    AiModule,
    forwardRef(() => AnalysesModule),
    forwardRef(() => QueueModule),
  ],
  providers: [InvoicesService, InvoicesTrpc, VisionService],
  exports: [InvoicesService, InvoicesTrpc, VisionService],
})
export class InvoicesModule {}
