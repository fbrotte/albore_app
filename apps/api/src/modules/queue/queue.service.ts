import { Injectable, Inject } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue, Job } from 'bullmq'
import { LoggerService } from '../logger/logger.service'

export interface InvoiceJobData {
  invoiceId: string
  analysisId: string
  userId: string
  fileName: string
  filePath: string
  batchId: string
  totalInBatch: number
  indexInBatch: number
}

export interface InvoiceJobProgress {
  step: 'extracting' | 'validating' | 'retrying_sonnet' | 'saving' | 'completed' | 'failed'
  message: string
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('invoice-processing') private invoiceQueue: Queue<InvoiceJobData>,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async addInvoiceJob(data: InvoiceJobData): Promise<Job<InvoiceJobData>> {
    const job = await this.invoiceQueue.add('process-invoice', data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 },
    })
    this.logger.log(`Added invoice job ${job.id} for invoice ${data.invoiceId}`)
    return job
  }

  async addBulkInvoiceJobs(jobs: InvoiceJobData[]): Promise<Job<InvoiceJobData>[]> {
    const bulkJobs = jobs.map((data) => ({
      name: 'process-invoice',
      data,
      opts: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    }))

    const addedJobs = await this.invoiceQueue.addBulk(bulkJobs)
    this.logger.log(`Added ${addedJobs.length} invoice jobs in bulk`)
    return addedJobs
  }

  async getJobStatus(jobId: string): Promise<{
    id: string
    state: string
    progress: InvoiceJobProgress | null
    failedReason: string | null
  } | null> {
    const job = await this.invoiceQueue.getJob(jobId)
    if (!job) return null

    const state = await job.getState()
    return {
      id: job.id!,
      state,
      progress: (job.progress as InvoiceJobProgress) || null,
      failedReason: job.failedReason ?? null,
    }
  }

  async getJobsByBatchId(batchId: string): Promise<
    Array<{
      id: string
      state: string
      invoiceId: string
      fileName: string
      progress: InvoiceJobProgress | null
    }>
  > {
    const [waiting, active, completed, failed] = await Promise.all([
      this.invoiceQueue.getWaiting(),
      this.invoiceQueue.getActive(),
      this.invoiceQueue.getCompleted(),
      this.invoiceQueue.getFailed(),
    ])

    const allJobs = [...waiting, ...active, ...completed, ...failed]
    const batchJobs = allJobs.filter((job) => job.data.batchId === batchId)

    return Promise.all(
      batchJobs.map(async (job) => ({
        id: job.id!,
        state: await job.getState(),
        invoiceId: job.data.invoiceId,
        fileName: job.data.fileName,
        progress: (job.progress as InvoiceJobProgress) || null,
      })),
    )
  }
}
