import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  X,
  Loader2,
  FolderOpen,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { trpc } from '@/lib/trpc'
import type { JobStatus } from '@template-dev/shared'

type FileWithStatus = {
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'retrying'
  progress?: JobStatus['progress']
  error?: string
  invoiceId?: string
}

interface Invoice {
  id: string
  fileName: string
  vendorName?: string | null
  totalHt?: unknown
  extractionStatus: string
  lines?: unknown[] | null
}

interface DataTabProps {
  analysisId: string
  analysis: {
    client?: { name: string } | null
    invoices?: Invoice[] | null
  }
  onProcessingComplete: () => void
  refetchAnalysis: () => void
}

export function DataTab({
  analysisId,
  analysis,
  onProcessingComplete,
  refetchAnalysis,
}: DataTabProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const bulkUploadMutation = trpc.invoices.bulkUpload.useMutation({
    onSuccess: (data) => {
      setBatchId(data.batchId)
      setIsUploading(false)
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'processing' as const,
          invoiceId: data.fileToInvoiceMap[f.file.name],
        })),
      )
    },
    onError: (err) => {
      setError(err.message)
      setIsUploading(false)
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'failed' as const, error: err.message })))
    },
  })

  const batchStatusQuery = trpc.invoices.getBatchStatus.useQuery(
    { batchId: batchId!, analysisId: analysisId! },
    {
      enabled: !!batchId && !!analysisId,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  )

  useEffect(() => {
    if (!batchStatusQuery.data) return

    const { jobs, completedJobs, failedJobs, totalJobs } = batchStatusQuery.data

    setFiles((prev) => {
      const updated = prev.map((f) => {
        const job = jobs.find((j) => j.fileName === f.file.name)
        if (!job) return f

        if (f.status === 'retrying' && job.state === 'failed') return f

        let status: FileWithStatus['status'] = 'processing'
        if (job.state === 'completed') status = 'completed'
        else if (job.state === 'failed') status = 'failed'

        return {
          ...f,
          status,
          progress: job.progress,
          error: job.error || undefined,
          invoiceId: job.invoiceId,
        }
      })

      const retryingCount = updated.filter((f) => f.status === 'retrying').length
      if (completedJobs + failedJobs === totalJobs && totalJobs > 0 && retryingCount === 0) {
        if (failedJobs === 0) {
          setTimeout(() => {
            refetchAnalysis()
            onProcessingComplete()
          }, 1500)
        }
      }

      return updated
    })
  }, [batchStatusQuery.data, onProcessingComplete, refetchAnalysis])

  const matchAllMutation = trpc.invoiceLines.matchAll.useMutation({
    onSuccess: () => {
      onProcessingComplete()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const retryMutation = trpc.invoices.retryInvoice.useMutation({
    onSuccess: (_, variables) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.invoiceId === variables.invoiceId
            ? { ...f, status: 'retrying' as const, error: undefined }
            : f,
        ),
      )
    },
    onError: (err) => {
      setError(`Erreur lors du retry: ${err.message}`)
    },
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf' || file.type.startsWith('image/'),
    )

    if (droppedFiles.length === 0) {
      setError('Format non supporte. Utilisez des fichiers PDF ou images.')
      return
    }

    addFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    e.target.value = ''
  }, [])

  const handleFolderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) => file.type === 'application/pdf' || file.type.startsWith('image/'),
    )
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    } else {
      setError('Aucun fichier PDF ou image trouve dans ce dossier.')
    }
    e.target.value = ''
  }, [])

  const addFiles = (newFiles: File[]) => {
    setError(null)
    const fileWithStatus: FileWithStatus[] = newFiles.map((file) => ({
      file,
      status: 'pending',
    }))

    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name))
      const uniqueNew = fileWithStatus.filter((f) => !existingNames.has(f.file.name))
      return [...prev, ...uniqueNew]
    })
  }

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== fileName))
  }

  const handleUpload = async () => {
    if (files.length === 0 || !analysisId) return

    setIsUploading(true)
    setError(null)
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })))

    const filePromises = files.map(
      (f) =>
        new Promise<{ fileName: string; fileContent: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve({ fileName: f.file.name, fileContent: base64 })
          }
          reader.onerror = reject
          reader.readAsDataURL(f.file)
        }),
    )

    try {
      const filesData = await Promise.all(filePromises)
      bulkUploadMutation.mutate({
        analysisId,
        files: filesData,
      })
    } catch {
      setError('Erreur lors de la lecture des fichiers')
      setIsUploading(false)
    }
  }

  const completedCount = files.filter((f) => f.status === 'completed').length
  const failedCount = files.filter((f) => f.status === 'failed').length
  const processingCount = files.filter((f) => f.status === 'processing').length
  const retryingCount = files.filter((f) => f.status === 'retrying').length
  const isProcessing = batchId && (processingCount > 0 || retryingCount > 0)
  const allDone =
    batchId &&
    completedCount + failedCount === files.length &&
    files.length > 0 &&
    retryingCount === 0

  // Processing View (overlay inside the tab)
  if (isProcessing || allDone) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-bold">
                {allDone ? 'Traitement termine !' : 'Traitement en cours...'}
              </h2>
              <p className="text-muted-foreground">
                {completedCount} / {files.length} documents traites
                {failedCount > 0 && ` (${failedCount} erreur${failedCount > 1 ? 's' : ''})`}
              </p>
            </div>

            {/* Global Progress */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Progression globale</span>
                <span className="font-semibold text-primary">
                  {Math.round(((completedCount + failedCount) / files.length) * 100)}%
                </span>
              </div>
              <ProgressBar
                progress={((completedCount + failedCount) / files.length) * 100}
                color={failedCount > 0 ? 'warning' : 'primary'}
              />
            </div>

            {/* File List with Status */}
            <div className="space-y-3">
              {files.map((f) => (
                <div
                  key={f.file.name}
                  className={`flex items-center justify-between rounded-lg p-4 ${
                    f.status === 'completed'
                      ? 'border border-success/20 bg-success/10'
                      : f.status === 'failed'
                        ? 'border border-destructive/20 bg-destructive/10'
                        : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`rounded-lg p-2 ${
                        f.status === 'completed'
                          ? 'bg-success/20'
                          : f.status === 'failed'
                            ? 'bg-destructive/20'
                            : 'bg-primary/20'
                      }`}
                    >
                      {f.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : f.status === 'failed' ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : f.status === 'processing' || f.status === 'retrying' ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{f.file.name}</p>
                      <p
                        className={`text-sm ${f.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}`}
                      >
                        {f.status === 'retrying'
                          ? 'Nouvelle tentative en cours...'
                          : f.progress?.message ||
                            (f.status === 'completed'
                              ? 'Extraction terminee'
                              : f.status === 'failed'
                                ? f.error || 'Erreur inconnue'
                                : 'En attente...')}
                      </p>
                    </div>
                  </div>
                  {f.status === 'failed' && f.invoiceId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryMutation.mutate({ invoiceId: f.invoiceId! })}
                      disabled={retryMutation.isPending}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reessayer
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Action after completion */}
            {allDone && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    if (analysisId) matchAllMutation.mutate({ analysisId })
                  }}
                  disabled={matchAllMutation.isPending}
                >
                  {matchAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Matching en cours...
                    </>
                  ) : (
                    'Voir les resultats'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`transition-smooth cursor-pointer rounded-xl border-2 border-dashed p-8 text-center ${
              isDragging
                ? 'scale-[1.02] border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              // @ts-expect-error webkitdirectory is not in types
              webkitdirectory=""
              directory=""
              onChange={handleFolderInput}
              className="hidden"
            />

            <div className="flex flex-col items-center space-y-4">
              <div
                className={`transition-smooth ${isDragging ? 'scale-125 text-primary' : 'text-muted-foreground'}`}
              >
                <UploadIcon className="h-12 w-12" />
              </div>
              <div>
                <p className="mb-2 text-xl font-semibold">Deposez vos factures ici</p>
                <p className="text-muted-foreground">ou utilisez les boutons ci-dessous</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="default" size="lg" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="mr-2 h-4 w-4" />
                  Selectionner des fichiers
                </Button>
                <Button variant="outline" size="lg" onClick={() => folderInputRef.current?.click()}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Importer un dossier
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Formats acceptes : PDF, images (max 50 fichiers)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <X className="h-5 w-5 text-destructive" />
              <p className="font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Selected Files List (pending upload) */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  {files.length} fichier{files.length > 1 ? 's' : ''} selectionne
                  {files.length > 1 ? 's' : ''}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  Tout supprimer
                </Button>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {files.map((f) => (
                  <div
                    key={f.file.name}
                    className="flex items-center justify-between rounded-lg bg-muted p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(f.file.size / 1024).toFixed(1)} Ko
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(f.file.name)}
                      className="transition-smooth rounded-lg p-1 hover:bg-muted-foreground/10"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  size="lg"
                  disabled={files.length === 0 || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span>
                        Analyser {files.length} facture{files.length > 1 ? 's' : ''}
                      </span>
                      <UploadIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Invoices List */}
      {analysis.invoices && analysis.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Factures uploadees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg bg-muted p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.vendorName} - {invoice.lines?.length ?? 0} lignes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {invoice.totalHt
                        ? `${Number(invoice.totalHt).toLocaleString('fr-FR')} € HT`
                        : '-'}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        invoice.extractionStatus === 'COMPLETED'
                          ? 'bg-success/10 text-success'
                          : invoice.extractionStatus === 'ERROR'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {invoice.extractionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="mb-3 font-semibold text-primary">Comment fonctionne l'analyse ?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2 text-primary">1.</span>
              <span>Extraction automatique des informations de vos factures</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">2.</span>
              <span>Analyse par intelligence artificielle des postes de depense</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">3.</span>
              <span>Comparaison avec notre base de donnees tarifaire</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">4.</span>
              <span>Generation d'une proposition personnalisee d'optimisation</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
