import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateClient, UpdateClient } from '@template-dev/shared'

@Injectable()
export class ClientsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { analyses: { where: { deletedAt: null } } } },
      },
    })
  }

  async findById(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        analyses: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!client) {
      throw new NotFoundException(`Client ${id} not found`)
    }

    return client
  }

  async create(userId: string, data: CreateClient) {
    return this.prisma.client.create({
      data: {
        userId,
        name: data.name,
        company: data.company,
        contactEmail: data.contactEmail,
        notes: data.notes,
      },
    })
  }

  async update(id: string, data: UpdateClient) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException(`Client ${id} not found`)
    }

    return this.prisma.client.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundException(`Client ${id} not found`)
    }

    const now = new Date()

    // Soft delete client and all its analyses in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Soft delete all analyses for this client
      await tx.analysis.updateMany({
        where: { clientId: id, deletedAt: null },
        data: { deletedAt: now },
      })

      // Soft delete the client
      return tx.client.update({
        where: { id },
        data: { deletedAt: now },
      })
    })
  }
}
