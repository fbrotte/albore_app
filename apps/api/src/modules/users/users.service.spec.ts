import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('new_hashed_password'),
  compare: vi.fn().mockImplementation((plain) => Promise.resolve(plain === 'correct_password')),
}))

describe('UsersService', () => {
  let service: UsersService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    phone: '06 12 34 56 78',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  describe('findAll', () => {
    it('should return users with phone field', async () => {
      const { password, ...userWithoutPassword } = mockUser
      mockPrismaService.user.findMany.mockResolvedValue([userWithoutPassword])

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('phone', '06 12 34 56 78')
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({ phone: true }),
      })
    })
  })

  describe('findOne', () => {
    it('should return user with phone field', async () => {
      const { password, ...userWithoutPassword } = mockUser
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword)

      const result = await service.findOne('user-123')

      expect(result).toHaveProperty('phone', '06 12 34 56 78')
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.objectContaining({ phone: true }),
      })
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update user with phone', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      const updated = { ...mockUser, phone: '07 00 00 00 00' }
      mockPrismaService.user.update.mockResolvedValue(updated)

      const result = await service.update('user-123', { phone: '07 00 00 00 00' })

      expect(result.phone).toBe('07 00 00 00 00')
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { phone: '07 00 00 00 00' },
        select: expect.objectContaining({ phone: true }),
      })
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.update('nonexistent', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updatePassword', () => {
    it('should update password with correct current password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      mockPrismaService.user.update.mockResolvedValue(mockUser)

      const result = await service.updatePassword('user-123', 'correct_password', 'new_password')

      expect(result).toEqual({ message: 'Password updated successfully' })
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'new_hashed_password' },
      })
    })

    it('should throw UnauthorizedException with wrong current password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)

      await expect(
        service.updatePassword('user-123', 'wrong_password', 'new_password'),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(
        service.updatePassword('nonexistent', 'password', 'new_password'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
