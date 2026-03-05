import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProposalCustomizations } from './useProposalCustomizations'

// Mock tRPC
const mockRefetch = vi.fn()
const mockMutate = vi.fn()

vi.mock('@/lib/trpc', () => ({
  trpc: {
    proposalCustomizations: {
      get: {
        useQuery: vi.fn(() => ({
          data: undefined,
          isLoading: false,
          refetch: mockRefetch,
        })),
      },
      upsert: {
        useMutation: vi.fn(() => ({
          mutate: mockMutate,
          isPending: false,
        })),
      },
    },
  },
}))

// Import after mock setup
import { trpc } from '@/lib/trpc'

describe('useProposalCustomizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('customizations', () => {
    it('should return empty customizations at startup', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      expect(result.current.customizations).toEqual({})
    })

    it('should transform array to Record<string, string>', () => {
      const mockCustomizations = [
        {
          id: '1',
          analysisId: 'analysis-123',
          sectionKey: 'intro.title',
          customText: 'Custom Title',
        },
        {
          id: '2',
          analysisId: 'analysis-123',
          sectionKey: 'synthesis.summary',
          customText: 'Custom Summary',
        },
      ]

      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: mockCustomizations,
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      expect(result.current.customizations).toEqual({
        'intro.title': 'Custom Title',
        'synthesis.summary': 'Custom Summary',
      })
    })
  })

  describe('updateSection', () => {
    it('should call mutation with correct parameters', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      vi.mocked(trpc.proposalCustomizations.upsert.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof trpc.proposalCustomizations.upsert.useMutation>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      act(() => {
        result.current.updateSection('intro.title', 'New Title Text')
      })

      expect(mockMutate).toHaveBeenCalledWith({
        analysisId: 'analysis-123',
        sectionKey: 'intro.title',
        customText: 'New Title Text',
      })
    })
  })

  describe('getText', () => {
    it('should return custom text if it exists', () => {
      const mockCustomizations = [
        {
          id: '1',
          analysisId: 'analysis-123',
          sectionKey: 'intro.title',
          customText: 'Custom Title',
        },
      ]

      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: mockCustomizations,
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      const text = result.current.getText('intro.title', 'Default Title')

      expect(text).toBe('Custom Title')
    })

    it('should return default text if custom text does not exist', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      const text = result.current.getText('intro.title', 'Default Title')

      expect(text).toBe('Default Title')
    })

    it('should return default text if custom text is empty string', () => {
      const mockCustomizations = [
        { id: '1', analysisId: 'analysis-123', sectionKey: 'intro.title', customText: '' },
      ]

      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: mockCustomizations,
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      const text = result.current.getText('intro.title', 'Default Title')

      expect(text).toBe('Default Title')
    })

    it('should return default text if custom text is only whitespace', () => {
      const mockCustomizations = [
        { id: '1', analysisId: 'analysis-123', sectionKey: 'intro.title', customText: '   ' },
      ]

      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: mockCustomizations,
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      const text = result.current.getText('intro.title', 'Default Title')

      expect(text).toBe('Default Title')
    })
  })

  describe('resetSection', () => {
    it('should call mutation with empty string to reset', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      vi.mocked(trpc.proposalCustomizations.upsert.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof trpc.proposalCustomizations.upsert.useMutation>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      act(() => {
        result.current.resetSection('intro.title', 'Default Title')
      })

      expect(mockMutate).toHaveBeenCalledWith({
        analysisId: 'analysis-123',
        sectionKey: 'intro.title',
        customText: '',
      })
    })
  })

  describe('loading states', () => {
    it('should expose isLoading from query', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      expect(result.current.isLoading).toBe(true)
    })

    it('should expose isSaving from mutation', () => {
      vi.mocked(trpc.proposalCustomizations.get.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: mockRefetch,
      } as ReturnType<typeof trpc.proposalCustomizations.get.useQuery>)

      vi.mocked(trpc.proposalCustomizations.upsert.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as unknown as ReturnType<typeof trpc.proposalCustomizations.upsert.useMutation>)

      const { result } = renderHook(() => useProposalCustomizations('analysis-123'))

      expect(result.current.isSaving).toBe(true)
    })
  })
})
