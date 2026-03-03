import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProposalDocument, useProposalData } from '@/components/proposal-document'

export default function ProposalDocumentPage() {
  const { id: analysisId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useProposalData(analysisId)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // For now, trigger print which can be saved as PDF
    window.print()
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-[600px] rounded-[20px] bg-muted" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Impossible de charger les donnees de la proposition.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(`/analyses/${analysisId}/results`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux resultats
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Toolbar - hidden when printing */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/analyses/${analysisId}/proposal`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Document de Proposition</h1>
              <p className="text-sm text-muted-foreground">
                {data.client.company ?? data.client.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Telecharger PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document */}
      <ProposalDocument data={data} />
    </AppLayout>
  )
}
