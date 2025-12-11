import { Module, forwardRef } from '@nestjs/common'
import { TrpcService } from './trpc.service'
import { TrpcRouter } from './trpc.router'
import { AuthModule } from '../modules/auth/auth.module'
import { UsersModule } from '../modules/users/users.module'
import { AiModule } from '../modules/ai/ai.module'
import { CatalogModule } from '../modules/catalog/catalog.module'
import { ClientsModule } from '../modules/clients/clients.module'
import { AnalysesModule } from '../modules/analyses/analyses.module'
import { InvoicesModule } from '../modules/invoices/invoices.module'
import { InvoiceLinesModule } from '../modules/invoice-lines/invoice-lines.module'
import { SummariesModule } from '../modules/summaries/summaries.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AiModule),
    forwardRef(() => CatalogModule),
    forwardRef(() => ClientsModule),
    forwardRef(() => AnalysesModule),
    forwardRef(() => InvoicesModule),
    forwardRef(() => InvoiceLinesModule),
    forwardRef(() => SummariesModule),
  ],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
