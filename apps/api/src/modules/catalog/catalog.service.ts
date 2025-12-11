import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { LoggerService } from '../logger/logger.service'
import type {
  CreateCategory,
  UpdateCategory,
  CreateService,
  UpdateService,
  CreatePricingTier,
  UpdatePricingTier,
} from '@template-dev/shared'

@Injectable()
export class CatalogService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AiService) private aiService: AiService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  // === CATEGORIES ===

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { services: { where: { deletedAt: null } } } },
      },
    })
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        services: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`)
    }

    return category
  }

  async createCategory(data: CreateCategory) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        displayOrder: data.displayOrder ?? 0,
      },
    })
  }

  async updateCategory(id: string, data: UpdateCategory) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    })

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`)
    }

    return this.prisma.category.update({
      where: { id },
      data,
    })
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    })

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`)
    }

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // === SERVICES ===

  async findAllServices(categoryId?: string) {
    return this.prisma.service.findMany({
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
      },
      orderBy: { name: 'asc' },
      include: {
        category: true,
        pricingTiers: { orderBy: { minQuantity: 'asc' } },
      },
    })
  }

  async findServiceById(id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        pricingTiers: { orderBy: { minQuantity: 'asc' } },
      },
    })

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`)
    }

    return service
  }

  async createService(data: CreateService) {
    // Generate embedding for semantic description
    let embeddingArray: number[] | null = null

    try {
      if (this.aiService.isConfigured()) {
        const embeddings = await this.aiService.embedding({
          input: data.semanticDescription,
        })
        embeddingArray = embeddings[0]
        this.logger.log(`Generated embedding for service: ${data.name}`)
      } else {
        this.logger.warn('AI not configured, skipping embedding generation')
      }
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error)
    }

    // Create service with raw SQL for vector field
    if (embeddingArray) {
      const embeddingStr = `[${embeddingArray.join(',')}]`

      const result = await this.prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO services (
          id, category_id, name, semantic_description, description_embedding,
          unit_type, unit_label, pricing_type, base_price, billing_type,
          is_active, created_at, updated_at
        )
        VALUES (
          gen_random_uuid()::text,
          ${data.categoryId},
          ${data.name},
          ${data.semanticDescription},
          ${embeddingStr}::vector,
          ${data.unitType}::"UnitType",
          ${data.unitLabel},
          ${data.pricingType}::"PricingType",
          ${data.basePrice},
          ${data.billingType}::"BillingType",
          ${data.isActive ?? true},
          NOW(),
          NOW()
        )
        RETURNING id
      `

      return this.findServiceById(result[0].id)
    }

    // Fallback without embedding
    const service = await this.prisma.service.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        semanticDescription: data.semanticDescription,
        unitType: data.unitType,
        unitLabel: data.unitLabel,
        pricingType: data.pricingType,
        basePrice: data.basePrice,
        billingType: data.billingType,
        isActive: data.isActive ?? true,
      },
      include: {
        category: true,
        pricingTiers: true,
      },
    })

    return service
  }

  async updateService(id: string, data: UpdateService) {
    const service = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
    })

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`)
    }

    // If semantic description changed, regenerate embedding
    if (data.semanticDescription && data.semanticDescription !== service.semanticDescription) {
      try {
        if (this.aiService.isConfigured()) {
          const embeddings = await this.aiService.embedding({
            input: data.semanticDescription,
          })
          const embeddingStr = `[${embeddings[0].join(',')}]`

          await this.prisma.$executeRaw`
            UPDATE services
            SET
              description_embedding = ${embeddingStr}::vector,
              semantic_description = ${data.semanticDescription},
              updated_at = NOW()
            WHERE id = ${id}
          `

          this.logger.log(`Updated embedding for service: ${id}`)
        }
      } catch (error) {
        this.logger.error('Failed to update embedding:', error)
      }
    }

    // Update other fields
    const { semanticDescription: _, ...updateData } = data

    return this.prisma.service.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.semanticDescription && { semanticDescription: data.semanticDescription }),
      },
      include: {
        category: true,
        pricingTiers: true,
      },
    })
  }

  async deleteService(id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
    })

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`)
    }

    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // === PRICING TIERS ===

  async findPricingTiers(serviceId: string) {
    return this.prisma.pricingTier.findMany({
      where: { serviceId },
      orderBy: { minQuantity: 'asc' },
    })
  }

  async createPricingTier(data: CreatePricingTier) {
    const service = await this.prisma.service.findFirst({
      where: { id: data.serviceId, deletedAt: null },
    })

    if (!service) {
      throw new NotFoundException(`Service ${data.serviceId} not found`)
    }

    return this.prisma.pricingTier.create({ data })
  }

  async updatePricingTier(id: string, data: UpdatePricingTier) {
    const tier = await this.prisma.pricingTier.findUnique({ where: { id } })

    if (!tier) {
      throw new NotFoundException(`Pricing tier ${id} not found`)
    }

    return this.prisma.pricingTier.update({
      where: { id },
      data,
    })
  }

  async deletePricingTier(id: string) {
    const tier = await this.prisma.pricingTier.findUnique({ where: { id } })

    if (!tier) {
      throw new NotFoundException(`Pricing tier ${id} not found`)
    }

    await this.prisma.pricingTier.delete({ where: { id } })
    return { success: true }
  }

  // === HELPER: Calculate price based on tiers ===

  async calculatePrice(serviceId: string, quantity: number): Promise<number> {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null },
      include: { pricingTiers: { orderBy: { minQuantity: 'asc' } } },
    })

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`)
    }

    // If no tiers, use base price
    if (service.pricingTiers.length === 0) {
      return Number(service.basePrice) * quantity
    }

    // Find applicable tier
    const tier = service.pricingTiers.find(
      (t) => quantity >= t.minQuantity && (t.maxQuantity === null || quantity <= t.maxQuantity),
    )

    if (tier) {
      return Number(tier.unitPrice) * quantity
    }

    // Default to base price if no tier matches
    return Number(service.basePrice) * quantity
  }
}
