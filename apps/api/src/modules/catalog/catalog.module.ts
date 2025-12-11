import { Module, forwardRef } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { CatalogTrpc } from './catalog.trpc'
import { TrpcModule } from '../../trpc/trpc.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [forwardRef(() => TrpcModule), AiModule],
  providers: [CatalogService, CatalogTrpc],
  exports: [CatalogService, CatalogTrpc],
})
export class CatalogModule {}
