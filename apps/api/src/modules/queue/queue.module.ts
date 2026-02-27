import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'
import { QueueService } from './queue.service'
import { InvoiceProcessor } from './processors/invoice.processor'
import { InvoicesModule } from '../invoices/invoices.module'
import { StorageModule } from '../storage/storage.module'
import { PrismaModule } from '../prisma/prisma.module'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL') || 'redis://localhost:6379'
        const url = new URL(redisUrl)
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
          },
        }
      },
    }),
    BullModule.registerQueue({ name: 'invoice-processing' }),
    forwardRef(() => InvoicesModule),
    StorageModule,
    PrismaModule,
    LoggerModule,
  ],
  providers: [QueueService, InvoiceProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
