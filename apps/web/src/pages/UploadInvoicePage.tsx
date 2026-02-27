import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  X,
  ArrowLeft,
  Loader2,
  FolderOpen,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
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

export default function UploadInvoicePage() {
  const { id: analysisId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const { data: analysis } = trpc.analyses.getById.useQuery(
    { id: analysisId! },
    { enabled: !!analysisId },
  )

  const bulkUploadMutation = trpc.invoices.bulkUpload.useMutation({
    onSuccess: (data) => {
      setBatchId(data.batchId)
      setIsUploading(false)
      // Update all files to processing status and assign invoiceIds
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

  // Poll for batch status
  const batchStatusQuery = trpc.invoices.getBatchStatus.useQuery(
    { batchId: batchId!, analysisId: analysisId! },
    {
      enabled: !!batchId && !!analysisId,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  )

  // Update file statuses based on batch status
  useEffect(() => {
    if (!batchStatusQuery.data) return

    const { jobs, completedJobs, failedJobs, totalJobs } = batchStatusQuery.data

    // Update individual file statuses
    setFiles((prev) => {
      const updated = prev.map((f) => {
        const job = jobs.find((j) => j.fileName === f.file.name)
        if (!job) return f

        // Don't update if currently retrying (wait for new job to appear)
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

      // Check if all jobs are done (excluding retrying)
      const retryingCount = updated.filter((f) => f.status === 'retrying').length
      if (completedJobs + failedJobs === totalJobs && totalJobs > 0 && retryingCount === 0) {
        // All done - navigate to results after a short delay (only if no failures)
        if (failedJobs === 0) {
          setTimeout(() => {
            navigate(`/analyses/${analysisId}/results`)
          }, 1500)
        }
      }

      return updated
    })
  }, [batchStatusQuery.data, analysisId, navigate])

  const matchAllMutation = trpc.invoiceLines.matchAll.useMutation({
    onSuccess: () => {
      navigate(`/analyses/${analysisId}/results`)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const retryMutation = trpc.invoices.retryInvoice.useMutation({
    onSuccess: (_, variables) => {
      // Mark the file as retrying
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
    // Reset input
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
    // Reset input
    e.target.value = ''
  }, [])

  const addFiles = (newFiles: File[]) => {
    setError(null)
    const fileWithStatus: FileWithStatus[] = newFiles.map((file) => ({
      file,
      status: 'pending',
    }))

    setFiles((prev) => {
      // Avoid duplicates by filename
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

    // Convert all files to base64
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

  // Processing View
  if (isProcessing || allDone) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold">
              {allDone ? 'Traitement termine !' : 'Traitement en cours...'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {completedCount} / {files.length} documents traites
              {failedCount > 0 && ` (${failedCount} erreur${failedCount > 1 ? 's' : ''})`}
            </p>
          </div>

          {/* Global Progress */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4">
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
            </CardContent>
          </Card>

          {/* File List with Status */}
          <Card>
            <CardContent className="p-6">
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
                    {/* Retry button for failed files */}
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
            </CardContent>
          </Card>

          {/* Action after completion */}
          {allDone && (
            <div className="mt-6 flex justify-center space-x-4">
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
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/analyses/${analysisId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour a l'analyse
        </Button>

        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">Importer des factures</h1>
          <p className="text-lg text-muted-foreground">
            {analysis?.client?.name && (
              <>
                Client: <strong>{analysis.client.name}</strong> -{' '}
              </>
            )}
            Deposez vos factures PDF pour decouvrir vos economies potentielles
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Drag & Drop Zone */}
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
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => folderInputRef.current?.click()}
                  >
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

            {/* Selected Files List */}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={() => navigate(`/analyses/${analysisId}`)}>
            Retour
          </Button>
          <Button
            size="lg"
            disabled={files.length === 0 || isUploading}
            onClick={handleUpload}
            className="flex items-center space-x-2"
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
                <UploadIcon className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
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
    </AppLayout>
  )
}
