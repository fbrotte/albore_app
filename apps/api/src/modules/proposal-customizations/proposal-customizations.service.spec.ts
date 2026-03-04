import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { ProposalCustomizationsService } from './proposal-customizations.service'
import { PrismaService } from '../prisma/prisma.service'
import { LoggerService } from '../logger/logger.service'

describe('ProposalCustomizationsService', () => {
  let service: ProposalCustomizationsService

  const mockProposalCustomization = {
    id: 'cust-123',
    analysisId: 'analysis-456',
    sectionKey: 'presentation.intro',
    customText: 'Custom introduction text',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    proposalCustomization: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  }

  const mockLoggerService = {
    debug: vi.fn(),
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalCustomizationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile()

    service = module.get<ProposalCustomizationsService>(ProposalCustomizationsService)
  })

  describe('getByAnalysisId', () => {
    it('should return an empty array if no customizations exist', async () => {
      mockPrismaService.proposalCustomization.findMany.mockResolvedValue([])

      const result = await service.getByAnalysisId('analysis-456')

      expect(result).toEqual([])
      expect(mockPrismaService.proposalCustomization.findMany).toHaveBeenCalledWith({
        where: { analysisId: 'analysis-456' },
        orderBy: { sectionKey: 'asc' },
      })
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Getting proposal customizations for analysis analysis-456',
      )
    })

    it('should return existing customizations', async () => {
      const customizations = [
        mockProposalCustomization,
        { ...mockProposalCustomization, id: 'cust-124', sectionKey: 'synthesis.summary' },
      ]
      mockPrismaService.proposalCustomization.findMany.mockResolvedValue(customizations)

      const result = await service.getByAnalysisId('analysis-456')

      expect(result).toEqual(customizations)
      expect(result).toHaveLength(2)
      expect(mockPrismaService.proposalCustomization.findMany).toHaveBeenCalledWith({
        where: { analysisId: 'analysis-456' },
        orderBy: { sectionKey: 'asc' },
      })
    })
  })

  describe('upsert', () => {
    it('should create a new customization', async () => {
      const newCustomization = {
        analysisId: 'analysis-456',
        sectionKey: 'presentation.intro',
        customText: 'New custom text',
      }
      mockPrismaService.proposalCustomization.upsert.mockResolvedValue({
        ...mockProposalCustomization,
        customText: 'New custom text',
      })

      const result = await service.upsert(newCustomization)

      expect(result.customText).toBe('New custom text')
      expect(mockPrismaService.proposalCustomization.upsert).toHaveBeenCalledWith({
        where: {
          analysisId_sectionKey: {
            analysisId: 'analysis-456',
            sectionKey: 'presentation.intro',
          },
        },
        update: {
          customText: 'New custom text',
        },
        create: {
          analysisId: 'analysis-456',
          sectionKey: 'presentation.intro',
          customText: 'New custom text',
        },
      })
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Upserting proposal customization for analysis-456:presentation.intro',
      )
    })

    it('should update an existing customization', async () => {
      const updateData = {
        analysisId: 'analysis-456',
        sectionKey: 'presentation.intro',
        customText: 'Updated custom text',
      }
      mockPrismaService.proposalCustomization.upsert.mockResolvedValue({
        ...mockProposalCustomization,
        customText: 'Updated custom text',
        updatedAt: new Date(),
      })

      const result = await service.upsert(updateData)

      expect(result.customText).toBe('Updated custom text')
      expect(mockPrismaService.proposalCustomization.upsert).toHaveBeenCalledWith({
        where: {
          analysisId_sectionKey: {
            analysisId: 'analysis-456',
            sectionKey: 'presentation.intro',
          },
        },
        update: {
          customText: 'Updated custom text',
        },
        create: {
          analysisId: 'analysis-456',
          sectionKey: 'presentation.intro',
          customText: 'Updated custom text',
        },
      })
    })
  })
})
