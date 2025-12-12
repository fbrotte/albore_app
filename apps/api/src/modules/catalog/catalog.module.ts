import { Module, forwardRef } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { CatalogTrpc } from './catalog.trpc'
import { EmbeddingService } from './embedding.service'
import { TrpcModule } from '../../trpc/trpc.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [forwardRef(() => TrpcModule), AiModule],
  providers: [CatalogService, CatalogTrpc, EmbeddingService],
  exports: [CatalogService, CatalogTrpc, EmbeddingService],
})
export class CatalogModule {}
