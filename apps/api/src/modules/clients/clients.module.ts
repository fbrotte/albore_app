import { Module, forwardRef } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsTrpc } from './clients.trpc'
import { TrpcModule } from '../../trpc/trpc.module'

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [ClientsService, ClientsTrpc],
  exports: [ClientsService, ClientsTrpc],
})
export class ClientsModule {}
