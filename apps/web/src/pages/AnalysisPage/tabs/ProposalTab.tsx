import { useRef } from 'react'
import { FileText, Download, Maximize2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ProposalViewer,
  useProposalData,
  useProposalCustomizations,
  type ProposalViewerRef,
} from '@/components/proposal-document'

interface ProposalTabProps {
  analysisId: string
  hasSummaries: boolean
}

export function ProposalTab({ analysisId, hasSummaries }: ProposalTabProps) {
  const viewerRef = useRef<ProposalViewerRef>(null)
  const { data: proposalData, isLoading } = useProposalData(analysisId)
  const { customizations, updateSection, resetSection, isSaving } =
    useProposalCustomizations(analysisId)

  const handleDownloadPdf = () => {
    window.print()
  }

  if (!hasSummaries) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold">Consolidation requise</h3>
          <p className="text-muted-foreground">
            Consolidez d'abord les donnees dans l'onglet "Postes consolides" pour generer la
            proposition.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !proposalData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="print:contents">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-muted p-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium">Document de proposition</span>
          {isSaving && <span className="text-sm text-muted-foreground">(Sauvegarde...)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => viewerRef.current?.openFullscreen()}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Plein ecran
          </Button>
          <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Telecharger PDF
          </Button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="print:contents">
        <ProposalViewer
          ref={viewerRef}
          data={proposalData}
          customizations={customizations}
          onUpdateSection={updateSection}
          onResetSection={resetSection}
        />
      </div>
    </div>
  )
}
