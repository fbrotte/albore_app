import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { EnvSchema } from '@template-dev/shared'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './modules/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { AiModule } from './modules/ai/ai.module'
import { LangfuseModule } from './modules/langfuse'
import { PythonModule } from './modules/python/python.module'
import { LoggerModule } from './modules/logger/logger.module'
import { QueueModule } from './modules/queue/queue.module'
import { TrpcModule } from './trpc/trpc.module'
// Invoice Analysis modules
import { StorageModule } from './modules/storage/storage.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { ClientsModule } from './modules/clients/clients.module'
import { AnalysesModule } from './modules/analyses/analyses.module'
import { InvoicesModule } from './modules/invoices/invoices.module'
import { InvoiceLinesModule } from './modules/invoice-lines/invoice-lines.module'
import { SummariesModule } from './modules/summaries/summaries.module'
import { ProposalCustomizationsModule } from './modules/proposal-customizations/proposal-customizations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        try {
          return EnvSchema.parse(config)
        } catch (error) {
          console.error('Invalid environment variables:', error)
          process.exit(1)
        }
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    LangfuseModule,
    AiModule,
    PythonModule,
    QueueModule,
    TrpcModule,
    // Invoice Analysis modules
    StorageModule,
    CatalogModule,
    ClientsModule,
    AnalysesModule,
    InvoicesModule,
    InvoiceLinesModule,
    SummariesModule,
    ProposalCustomizationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
