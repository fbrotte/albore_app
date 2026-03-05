import { ArrowLeft, Upload, BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-muted text-muted-foreground', icon: Clock },
  IMPORTING: { label: 'Import en cours', color: 'bg-warning/10 text-warning', icon: Upload },
  MATCHING: { label: 'Matching', color: 'bg-primary/10 text-primary', icon: BarChart3 },
  REVIEW: { label: 'En revue', color: 'bg-warning/10 text-warning', icon: AlertCircle },
  COMPLETED: { label: 'Termine', color: 'bg-success/10 text-success', icon: CheckCircle },
}

interface AnalysisHeaderProps {
  analysis: {
    name: string
    status: string
    clientId: string
    client?: { name: string; company?: string | null } | null
  }
  onBackToClient: () => void
}

export function AnalysisHeader({ analysis, onBackToClient }: AnalysisHeaderProps) {
  const statusInfo =
    statusConfig[analysis.status as keyof typeof statusConfig] ?? statusConfig.DRAFT
  const StatusIcon = statusInfo.icon

  return (
    <div className="mb-6">
      <Button variant="ghost" className="mb-4" onClick={onBackToClient}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au client
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{analysis.name}</h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
            >
              <StatusIcon className="mr-1 h-4 w-4" />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-muted-foreground">
            Client: <strong>{analysis.client?.name}</strong>
            {analysis.client?.company && ` (${analysis.client.company})`}
          </p>
        </div>
      </div>
    </div>
  )
}
