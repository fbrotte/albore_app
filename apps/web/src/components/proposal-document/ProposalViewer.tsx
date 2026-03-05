import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CoverPage,
  PresentationPage,
  SolutionsPage,
  ConfidentialityPage,
  ExpenseOverviewPage,
  CategoryDetailPage,
  SynthesisPage,
  ActionPlanPage,
  SignaturePage,
} from './pages'
import type { ProposalData } from './types'

interface ProposalViewerProps {
  data: ProposalData
  customizations?: Record<string, string>
  onUpdateSection?: (sectionKey: string, text: string) => void
  onResetSection?: (sectionKey: string, defaultText: string) => void
}

interface PageItem {
  id: string
  label: string
  component: ReactNode
}

// A4 dimensions in pixels (at 96 DPI: 210mm = 793.7px, 297mm = 1122.5px)
const A4_WIDTH_PX = 793.7
const A4_HEIGHT_PX = 1122.5

export interface ProposalViewerRef {
  openFullscreen: () => void
}

export const ProposalViewer = forwardRef<ProposalViewerRef, ProposalViewerProps>(
  function ProposalViewer({ data, customizations, onUpdateSection, onResetSection }, ref) {
    const [currentPage, setCurrentPage] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [fullscreenScale, setFullscreenScale] = useState(1)
    const { client, albore, date, presentGroups, totals, hasGroup } = data

    // Expose openFullscreen to parent via ref
    useImperativeHandle(ref, () => ({
      openFullscreen: () => setIsFullscreen(true),
    }))

    // Calculate optimal scale for fullscreen mode
    useEffect(() => {
      if (!isFullscreen) return

      const calculateScale = () => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        // Leave some padding (80px horizontal, 70px vertical for UI elements)
        const availableWidth = viewportWidth - 160
        const availableHeight = viewportHeight - 70

        const scaleX = availableWidth / A4_WIDTH_PX
        const scaleY = availableHeight / A4_HEIGHT_PX
        // Use the smaller scale to fit both dimensions
        setFullscreenScale(Math.min(scaleX, scaleY, 1.2)) // Cap at 1.2 to not make it too big
      }

      calculateScale()
      window.addEventListener('resize', calculateScale)
      return () => window.removeEventListener('resize', calculateScale)
    }, [isFullscreen])

    // Helper to get customized text or default
    const getCustomText = (sectionKey: string): string | undefined => {
      if (!customizations) return undefined
      const custom = customizations[sectionKey]
      return custom && custom.trim() !== '' ? custom : undefined
    }

    // Build pages array
    const pages = useMemo<PageItem[]>(() => {
      const items: PageItem[] = [
        {
          id: 'cover',
          label: 'Couverture',
          component: (
            <CoverPage
              client={client}
              albore={albore}
              date={date}
              customizations={customizations}
              onUpdateSection={onUpdateSection}
              onResetSection={onResetSection}
              getCustomText={getCustomText}
            />
          ),
        },
        {
          id: 'presentation',
          label: 'Presentation',
          component: (
            <PresentationPage
              customizations={customizations}
              onUpdateSection={onUpdateSection}
              onResetSection={onResetSection}
              getCustomText={getCustomText}
            />
          ),
        },
        {
          id: 'solutions',
          label: 'Solutions',
          component: <SolutionsPage />,
        },
        {
          id: 'confidentiality',
          label: 'Confidentialite',
          component: <ConfidentialityPage />,
        },
        {
          id: 'expenses',
          label: 'Depenses',
          component: <ExpenseOverviewPage groups={presentGroups} />,
        },
      ]

      // Add conditional category pages
      if (hasGroup.telecom) {
        const group = presentGroups.find((g) => g.slug === 'telecom')!
        items.push({
          id: 'telecom',
          label: 'Telecom',
          component: (
            <CategoryDetailPage
              group={group}
              customizations={customizations}
              onUpdateSection={onUpdateSection}
              onResetSection={onResetSection}
              getCustomText={getCustomText}
            />
          ),
        })
      }

      if (hasGroup.it) {
        const group = presentGroups.find((g) => g.slug === 'it')!
        items.push({
          id: 'it',
          label: 'IT',
          component: (
            <CategoryDetailPage
              group={group}
              customizations={customizations}
              onUpdateSection={onUpdateSection}
              onResetSection={onResetSection}
              getCustomText={getCustomText}
            />
          ),
        })
      }

      if (hasGroup.printing) {
        const group = presentGroups.find((g) => g.slug === 'printing')!
        items.push({
          id: 'printing',
          label: 'Impression',
          component: (
            <CategoryDetailPage
              group={group}
              customizations={customizations}
              onUpdateSection={onUpdateSection}
              onResetSection={onResetSection}
              getCustomText={getCustomText}
            />
          ),
        })
      }

      // Add final pages
      items.push(
        {
          id: 'synthesis',
          label: 'Synthese',
          component: <SynthesisPage groups={presentGroups} totals={totals} />,
        },
        {
          id: 'action-plan',
          label: "Plan d'action",
          component: <ActionPlanPage />,
        },
        {
          id: 'signature',
          label: 'Signature',
          component: <SignaturePage client={client} />,
        },
      )

      return items
    }, [
      client,
      albore,
      date,
      presentGroups,
      totals,
      hasGroup,
      customizations,
      onUpdateSection,
      onResetSection,
    ])

    const totalPages = pages.length
    const canGoPrev = currentPage > 0
    const canGoNext = currentPage < totalPages - 1

    const goToPrev = useCallback(() => {
      if (currentPage > 0) setCurrentPage((p) => p - 1)
    }, [currentPage])

    const goToNext = useCallback(() => {
      if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1)
    }, [currentPage, totalPages])

    const closeFullscreen = () => setIsFullscreen(false)

    // Keyboard navigation
    useEffect(() => {
      if (!isFullscreen) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeFullscreen()
        } else if (e.key === 'ArrowLeft') {
          goToPrev()
        } else if (e.key === 'ArrowRight') {
          goToNext()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }, [isFullscreen, goToPrev, goToNext])

    // Navigation arrows component (reused in both views)
    const NavigationArrows = ({ variant = 'normal' }: { variant?: 'normal' | 'fullscreen' }) => {
      const isFs = variant === 'fullscreen'

      const handlePrevClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        goToPrev()
      }

      const handleNextClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        goToNext()
      }

      return (
        <>
          <button
            onClick={handlePrevClick}
            disabled={!canGoPrev}
            className={cn(
              'absolute top-1/2 z-20 -translate-y-1/2',
              'flex items-center justify-center rounded-full',
              'transition-all hover:scale-110',
              'disabled:opacity-30 disabled:hover:scale-100',
              isFs
                ? 'left-4 h-14 w-14 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                : 'left-0 h-12 w-12 -translate-x-1/2 bg-white shadow-lg hover:shadow-xl',
            )}
            aria-label="Page precedente"
          >
            <ChevronLeft className={cn('text-gray-700', isFs ? 'h-8 w-8 text-white' : 'h-6 w-6')} />
          </button>

          <button
            onClick={handleNextClick}
            disabled={!canGoNext}
            className={cn(
              'absolute top-1/2 z-20 -translate-y-1/2',
              'flex items-center justify-center rounded-full',
              'transition-all hover:scale-110',
              'disabled:opacity-30 disabled:hover:scale-100',
              isFs
                ? 'right-4 h-14 w-14 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                : 'right-0 h-12 w-12 translate-x-1/2 bg-white shadow-lg hover:shadow-xl',
            )}
            aria-label="Page suivante"
          >
            <ChevronRight
              className={cn('text-gray-700', isFs ? 'h-8 w-8 text-white' : 'h-6 w-6')}
            />
          </button>
        </>
      )
    }

    // Pagination component (reused in both views)
    const Pagination = ({ variant = 'normal' }: { variant?: 'normal' | 'fullscreen' }) => {
      const isFs = variant === 'fullscreen'
      return (
        <div className={cn('flex items-center justify-center gap-4', isFs && 'gap-6')}>
          {/* Page dots */}
          <div className="flex items-center gap-2">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all',
                  index === currentPage
                    ? cn('w-8', isFs ? 'bg-white' : 'bg-primary')
                    : cn(isFs ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-300 hover:bg-gray-400'),
                )}
                aria-label={`Aller a la page ${index + 1}: ${page.label}`}
              />
            ))}
          </div>

          {/* Page counter */}
          <span className={cn('text-sm', isFs ? 'text-white/70' : 'text-muted-foreground')}>
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )
    }

    return (
      <>
        {/* Screen view - paginated */}
        <div className="relative print:hidden">
          <NavigationArrows />

          {/* Current page */}
          <div>{pages[currentPage]?.component}</div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center">
            <Pagination />
          </div>
        </div>

        {/* Fullscreen overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className={cn(
                'absolute right-4 top-4 z-50',
                'flex h-10 w-10 items-center justify-center rounded-full',
                'bg-white/10 text-white backdrop-blur-sm',
                'transition-all hover:bg-white/20',
              )}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation arrows */}
            <NavigationArrows variant="fullscreen" />

            {/* Page container - dynamically scaled to fill viewport */}
            <div className="flex h-full w-full items-center justify-center">
              <div
                className="origin-center transition-transform duration-200"
                style={{ transform: `scale(${fullscreenScale})` }}
              >
                {pages[currentPage]?.component}
              </div>
            </div>

            {/* Pagination at bottom - more compact */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <Pagination variant="fullscreen" />
            </div>
          </div>
        )}

        {/* Print view - all pages */}
        <div className="proposal-document hidden bg-[#f4f6f9] print:block">
          {pages.map((page) => (
            <div key={page.id}>{page.component}</div>
          ))}
        </div>
      </>
    )
  },
)
