import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  X,
  ArrowLeft,
  Loader2,
  FileSearch,
  Brain,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { trpc } from '@/lib/trpc'

type AnalysisStep = {
  id: number
  text: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const analysisSteps: AnalysisStep[] = [
  { id: 0, text: 'Extraction du texte en cours...', icon: FileSearch, color: 'text-blue-600' },
  {
    id: 1,
    text: 'Analyse par intelligence artificielle...',
    icon: Brain,
    color: 'text-purple-600',
  },
  {
    id: 2,
    text: 'Identification des postes de depense...',
    icon: TrendingUp,
    color: 'text-orange-600',
  },
  {
    id: 3,
    text: 'Comparaison avec les grilles tarifaires...',
    icon: CheckCircle,
    color: 'text-green-600',
  },
]

export default function UploadInvoicePage() {
  const { id: analysisId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { data: analysis } = trpc.analyses.getById.useQuery(
    { id: analysisId! },
    { enabled: !!analysisId },
  )

  const uploadMutation = trpc.invoices.upload.useMutation({
    onSuccess: async () => {
      setUploadComplete(true)
      setIsUploading(false)
      // Start analysis animation
      setIsAnalyzing(true)
    },
    onError: (err) => {
      setError(err.message)
      setIsUploading(false)
    },
  })

  const matchAllMutation = trpc.invoiceLines.matchAll.useMutation({
    onSuccess: () => {
      // Navigate to results after matching
      navigate(`/analyses/${analysisId}/results`)
    },
    onError: (err) => {
      setError(err.message)
      setIsAnalyzing(false)
    },
  })

  // Analysis progress animation
  useEffect(() => {
    if (!isAnalyzing) return

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          // Trigger matching when progress complete
          if (analysisId) {
            matchAllMutation.mutate({ analysisId })
          }
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 1250)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [isAnalyzing, analysisId])

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
    const droppedFile = e.dataTransfer.files[0]
    if (
      droppedFile &&
      (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/'))
    ) {
      handleFile(droppedFile)
    } else {
      setError('Format non supporte. Utilisez un fichier PDF ou une image.')
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    simulateUpload(selectedFile)
  }

  const simulateUpload = async (uploadedFile: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress for UX
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]

      // Upload to backend
      if (analysisId) {
        uploadMutation.mutate({
          analysisId,
          fileName: uploadedFile.name,
          fileContent: base64,
        })
      }

      clearInterval(interval)
      setUploadProgress(100)
    }
    reader.readAsDataURL(uploadedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadComplete(false)
    setError(null)
  }

  // Analysis Loading View
  if (isAnalyzing) {
    const CurrentIcon = analysisSteps[currentStep].icon

    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <Card>
              <CardContent className="p-8 text-center">
                {/* Animated Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75" />
                    <div className="relative rounded-full bg-primary/10 p-8">
                      <CurrentIcon
                        className={`h-16 w-16 ${analysisSteps[currentStep].color} animate-pulse`}
                      />
                    </div>
                  </div>
                </div>

                <h1 className="mb-4 text-3xl font-bold">Analyse en cours...</h1>

                <div className="mb-8 h-8">
                  <p className="animate-pulse text-lg text-muted-foreground">
                    {analysisSteps[currentStep].text}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold text-primary">{analysisProgress}%</span>
                  </div>
                  <ProgressBar progress={analysisProgress} color="primary" />
                </div>

                {/* Steps List */}
                <div className="space-y-3">
                  {analysisSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep

                    return (
                      <div
                        key={step.id}
                        className={`transition-smooth flex items-center space-x-3 rounded-lg p-3 ${
                          isCurrent
                            ? 'border border-primary/20 bg-primary/10'
                            : isCompleted
                              ? 'border border-success/20 bg-success/10'
                              : 'bg-muted'
                        }`}
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            isCurrent ? 'bg-primary/20' : isCompleted ? 'bg-success/20' : 'bg-muted'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <StepIcon
                              className={`h-5 w-5 ${isCurrent ? step.color : 'text-muted-foreground'}`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isCurrent || isCompleted ? 'font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {step.text}
                        </span>
                        {isCurrent && (
                          <Loader2 className="ml-auto h-5 w-5 animate-spin text-primary" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    L'analyse prend generalement entre 10 et 30 secondes. Merci de patienter...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <h1 className="mb-4 text-4xl font-bold">Analyser une nouvelle facture</h1>
          <p className="text-lg text-muted-foreground">
            {analysis?.client?.name && (
              <>
                Client: <strong>{analysis.client.name}</strong> -{' '}
              </>
            )}
            Deposez votre facture PDF pour decouvrir vos economies potentielles
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Drag & Drop Zone */}
            {!file && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`transition-smooth cursor-pointer rounded-xl border-2 border-dashed p-12 text-center ${
                  isDragging
                    ? 'scale-[1.02] border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className={`transition-smooth ${isDragging ? 'scale-125 text-primary' : 'text-muted-foreground'}`}
                    >
                      <UploadIcon className="h-16 w-16" />
                    </div>
                    <div>
                      <p className="mb-2 text-xl font-semibold">Deposez votre facture PDF ici</p>
                      <p className="text-muted-foreground">
                        ou cliquez pour selectionner un fichier
                      </p>
                    </div>
                    <Button variant="default" size="lg">
                      Selectionner un fichier
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Formats acceptes : PDF, images (max 10 Mo)
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* File Selected */}
            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`rounded-lg p-3 ${uploadComplete ? 'bg-success/20' : 'bg-primary/20'}`}
                    >
                      {uploadComplete ? (
                        <CheckCircle className="h-8 w-8 text-success" />
                      ) : (
                        <FileText className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} Ko
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={handleRemoveFile}
                      className="transition-smooth rounded-lg p-2 hover:bg-muted-foreground/10"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upload en cours...</span>
                      <span className="font-semibold text-primary">{uploadProgress}%</span>
                    </div>
                    <ProgressBar progress={uploadProgress} color="primary" />
                  </div>
                )}

                {/* Success Message */}
                {uploadComplete && (
                  <div className="flex items-center space-x-2 rounded-lg border border-success/20 bg-success/10 p-4">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p className="font-medium text-success">Fichier telecharge avec succes !</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <X className="h-5 w-5 text-destructive" />
                    <p className="font-medium text-destructive">{error}</p>
                  </div>
                )}
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
            disabled={!uploadComplete || isAnalyzing}
            onClick={() => setIsAnalyzing(true)}
            className="flex items-center space-x-2"
          >
            <span>Analyser cette facture</span>
            <FileText className="h-5 w-5" />
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="mb-3 font-semibold text-primary">Comment fonctionne l'analyse ?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2 text-primary">1.</span>
                <span>Extraction automatique des informations de votre facture</span>
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
