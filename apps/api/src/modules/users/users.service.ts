import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateUser, UpdateUser } from '@template-dev/shared'

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async create(data: CreateUser) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new ConflictException('Un utilisateur avec cet e-mail existe déjà')
    }

    const hashedPassword = await hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async update(id: string, data: UpdateUser) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    await this.prisma.user.delete({ where: { id } })

    return { message: `User ${id} deleted successfully` }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect')
    }

    const hashedPassword = await hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Password updated successfully' }
  }
}
