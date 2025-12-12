import { Injectable, Inject, type OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class EmbeddingService implements OnModuleInit {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AiService) private aiService: AiService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  onModuleInit() {
    // Register the callback with PrismaService for middleware-like behavior
    this.prisma.registerEmbeddingCallback(this.regenerateEmbedding.bind(this))
  }

  /**
   * Generate embedding text from name and semantic description
   */
  buildEmbeddingText(name: string, semanticDescription: string): string {
    return `${name}. ${semanticDescription}`
  }

  /**
   * Generate embedding vector for given text
   * Returns null if AI is not configured
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.aiService.isConfigured()) {
      this.logger.warn('AI not configured, skipping embedding generation')
      return null
    }

    try {
      const embeddings = await this.aiService.embedding({ input: text })
      return embeddings[0]
    } catch (error: unknown) {
      this.logger.error(
        'Failed to generate embedding:',
        error instanceof Error ? error.message : error,
      )
      return null
    }
  }

  /**
   * Regenerate embedding for a service by ID
   * This method is called by the middleware callback
   */
  async regenerateEmbedding(
    serviceId: string,
    name: string,
    semanticDescription: string,
  ): Promise<void> {
    const embeddingText = this.buildEmbeddingText(name, semanticDescription)
    const embedding = await this.generateEmbedding(embeddingText)

    if (embedding) {
      const embeddingStr = `[${embedding.join(',')}]`
      await this.prisma.$executeRaw`
        UPDATE services
        SET
          description_embedding = ${embeddingStr}::vector,
          updated_at = NOW()
        WHERE id = ${serviceId}
      `
      this.logger.log(`Regenerated embedding for service: ${serviceId}`)
    }
  }

  /**
   * Check if embedding needs regeneration based on field changes
   */
  needsEmbeddingRegeneration(
    currentName: string,
    currentDescription: string,
    newName?: string,
    newDescription?: string,
  ): boolean {
    const nameChanged = newName !== undefined && newName !== currentName
    const descChanged = newDescription !== undefined && newDescription !== currentDescription
    return nameChanged || descChanged
  }
}
