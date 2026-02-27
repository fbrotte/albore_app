import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import * as pino from 'pino'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { getQueueToken } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import { AppModule } from './app.module'
import { TrpcRouter } from './trpc/trpc.router'

async function bootstrap() {
  const logger = pino.default({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  })

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  const configService = app.get(ConfigService)
  const port = configService.get('PORT', 8012)

  // CORS
  app.enableCors({
    origin: ['http://localhost:8013'],
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Template Dev API')
    .setDescription('Full-stack template API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  const cleanedDocument = cleanupOpenApiDoc(document)
  SwaggerModule.setup('api/docs', app, cleanedDocument)

  // tRPC
  const trpc = app.get(TrpcRouter)
  await trpc.applyMiddleware(app)

  // Bull Board (Queue monitoring UI)
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const invoiceQueue = app.get<Queue>(getQueueToken('invoice-processing'))

  createBullBoard({
    queues: [new BullMQAdapter(invoiceQueue)],
    serverAdapter,
  })

  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.use('/admin/queues', serverAdapter.getRouter())

  await app.listen(port)

  Logger.log(`Application is running on: http://localhost:${port}/api`)
  Logger.log(`Swagger documentation: http://localhost:${port}/api/docs`)
  Logger.log(`tRPC endpoint: http://localhost:${port}/trpc`)
  Logger.log(`Bull Board (Queue UI): http://localhost:${port}/admin/queues`)
}

bootstrap()
