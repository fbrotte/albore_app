import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Download,
  Edit2,
  X,
  Check,
  FileText,
  ArrowLeft,
  Sparkles,
  Home,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

export default function ProposalPage() {
  const { id: analysisId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingIntro, setIsEditingIntro] = useState(false)
  const [isEditingConclusion, setIsEditingConclusion] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [title, setTitle] = useState("PROPOSITION D'OPTIMISATION DES COUTS")
  const [intro, setIntro] = useState(
    "Nous avons analyse votre facture actuelle et identifie plusieurs opportunites d'optimisation qui vous permettront de reduire significativement vos couts tout en maintenant, voire en ameliorant, la qualite de vos services.",
  )
  const [conclusion, setConclusion] = useState(
    "Notre equipe se tient a votre disposition pour vous accompagner dans la mise en place de cette optimisation. Nous garantissons une transition fluide sans interruption de service. Contactez-nous des aujourd'hui pour beneficier de ces economies substantielles.",
  )

  const { data: analysis, isLoading } = trpc.analyses.getById.useQuery(
    { id: analysisId! },
    { enabled: !!analysisId },
  )

  const { data: summaries } = trpc.summaries.list.useQuery(
    { analysisId: analysisId! },
    { enabled: !!analysisId },
  )

  // Calculate totals
  const totals = useMemo(() => {
    if (!summaries || summaries.length === 0) {
      return {
        currentTotal: 0,
        alboreTotal: 0,
        savingsTotal: 0,
        savingsPercentage: 0,
        monthlySavings: 0,
        annualSavings: 0,
      }
    }

    const currentTotal = summaries.reduce((sum, s) => sum + Number(s.avgMonthly), 0)
    const alboreTotal = summaries.reduce(
      (sum, s) => sum + (s.ourPrice ? Number(s.ourPrice) : Number(s.avgMonthly)),
      0,
    )
    const savingsTotal = summaries.reduce((sum, s) => sum + Number(s.savingAmount ?? 0), 0)
    const savingsPercentage = currentTotal > 0 ? (savingsTotal / currentTotal) * 100 : 0

    return {
      currentTotal: Math.round(currentTotal * 100) / 100,
      alboreTotal: Math.round(alboreTotal * 100) / 100,
      savingsTotal: Math.round(savingsTotal * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 10) / 10,
      monthlySavings: Math.round(savingsTotal * 100) / 100,
      annualSavings: Math.round(savingsTotal * 12 * 100) / 100,
    }
  }, [summaries])

  // Format items for display
  const items = useMemo(() => {
    if (!summaries) return []
    return summaries.map((s) => ({
      id: s.id,
      label: s.matchedService?.name ?? s.customLabel ?? 'Service',
      current: Number(s.avgMonthly),
      albore: s.ourPrice ? Number(s.ourPrice) : Number(s.avgMonthly),
      savings: Number(s.savingAmount ?? 0),
    }))
  }, [summaries])

  const handleDownload = () => {
    // Show success modal
    setShowSuccess(true)
  }

  const EditableSection = ({
    value,
    onChange,
    isEditing,
    setIsEditing,
    multiline = false,
  }: {
    value: string
    onChange: (v: string) => void
    isEditing: boolean
    setIsEditing: (v: boolean) => void
    multiline?: boolean
  }) => {
    if (isEditing) {
      return (
        <div className="relative">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-lg border-2 border-primary p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              autoFocus
            />
          ) : (
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="text-2xl font-bold"
              autoFocus
            />
          )}
          <div className="mt-2 flex space-x-2">
            <Button size="sm" onClick={() => setIsEditing(false)}>
              <Check className="mr-1 h-4 w-4" />
              Valider
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-1 h-4 w-4" />
              Annuler
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative">
        {multiline ? (
          <p className="leading-relaxed text-muted-foreground">{value}</p>
        ) : (
          <h2 className="mb-6 text-2xl font-bold">{value}</h2>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="transition-smooth absolute -right-10 top-0 rounded-lg bg-primary/10 p-2 opacity-0 hover:bg-primary/20 group-hover:opacity-100"
          title="Editer"
        >
          <Edit2 className="h-4 w-4 text-primary" />
        </button>
      </div>
    )
  }

  // Success Modal
  if (showSuccess) {
    return (
      <AppLayout>
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
          {/* Sparkles Animation */}
          <div className="pointer-events-none absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce-slow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              >
                <Sparkles
                  className="text-warning"
                  style={{
                    width: `${Math.random() * 20 + 10}px`,
                    height: `${Math.random() * 20 + 10}px`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="z-10 w-full max-w-2xl px-4">
            <Card>
              <CardContent className="p-8 text-center">
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-success/20" />
                    <div className="relative rounded-full bg-success/10 p-6">
                      <CheckCircle className="h-20 w-20 animate-bounce-slow text-success" />
                    </div>
                  </div>
                </div>

                <h1 className="mb-4 text-4xl font-bold">Proposition generee avec succes !</h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  Le document est pret a etre partage avec votre client
                </p>

                {/* File Info */}
                <div className="mb-8 rounded-lg border border-success/20 bg-success/10 p-6">
                  <div className="mb-3 flex items-center justify-center space-x-3">
                    <FileText className="h-6 w-6 text-success" />
                    <p className="font-semibold text-success">
                      proposition_
                      {analysis?.client?.name?.toLowerCase().replace(/\s+/g, '_') ?? 'client'}_
                      {new Date().getFullYear()}.pdf
                    </p>
                  </div>
                  <p className="text-sm text-success/80">Le fichier est pret a etre telecharge</p>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-2xl font-bold text-primary">
                      {totals.monthlySavings.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-sm text-muted-foreground">Economie mensuelle</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-2xl font-bold text-success">
                      {totals.annualSavings.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-sm text-muted-foreground">Economie annuelle</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-2xl font-bold text-warning">{totals.savingsPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Reduction</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" onClick={() => navigate(`/analyses/${analysisId}/upload`)}>
                    <FileText className="mr-2 h-5 w-5" />
                    Analyser une autre facture
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                    <Home className="mr-2 h-5 w-5" />
                    Retour au dashboard
                  </Button>
                </div>

                {/* Next Steps */}
                <div className="mt-8 border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez maintenant presenter cette proposition a votre client et finaliser
                    la vente
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="mb-3 flex items-center font-semibold text-primary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Prochaines etapes suggerees
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Envoyez la proposition par email a votre client</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Planifiez un rendez-vous de suivi sous 48h</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Preparez les documents contractuels pour la signature</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <Card>
              <CardContent className="p-6">
                <div className="h-96 rounded bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              className="mb-2"
              onClick={() => navigate(`/analyses/${analysisId}/results`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux resultats
            </Button>
            <h1 className="text-3xl font-bold">Previsualisation de la proposition</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate(`/analyses/${analysisId}/results`)}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Modifier les resultats
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-5 w-5" />
              Telecharger le PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Document */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl">
              <CardContent className="space-y-8 p-8">
                {/* Header */}
                <div className="border-b-2 border-primary pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <FileText className="mb-3 h-12 w-12 text-primary" />
                      <EditableSection
                        value={title}
                        onChange={setTitle}
                        isEditing={isEditingTitle}
                        setIsEditing={setIsEditingTitle}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date().toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Client</h3>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-lg font-semibold">{analysis?.client?.name ?? '-'}</p>
                    <p className="text-muted-foreground">
                      {analysis?.client?.company ?? analysis?.name}
                    </p>
                  </div>
                </div>

                {/* Introduction */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Introduction</h3>
                  <EditableSection
                    value={intro}
                    onChange={setIntro}
                    isEditing={isEditingIntro}
                    setIsEditing={setIsEditingIntro}
                    multiline
                  />
                </div>

                {/* Current Situation */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Situation Actuelle</h3>
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <p className="mb-2">
                      Votre depense mensuelle actuelle :{' '}
                      <span className="text-xl font-bold text-destructive">
                        {totals.currentTotal.toLocaleString('fr-FR')} € / mois
                      </span>
                    </p>
                    <p>
                      Soit{' '}
                      <span className="text-xl font-bold text-destructive">
                        {(totals.currentTotal * 12).toLocaleString('fr-FR')} € / an
                      </span>
                    </p>
                  </div>
                </div>

                {/* Proposed Solution */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Solution Proposee Albore</h3>
                  <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                    <p className="mb-2">
                      Notre offre optimisee :{' '}
                      <span className="text-xl font-bold text-success">
                        {totals.alboreTotal.toLocaleString('fr-FR')} € / mois
                      </span>
                    </p>
                    <p>
                      Soit{' '}
                      <span className="text-xl font-bold text-success">
                        {(totals.alboreTotal * 12).toLocaleString('fr-FR')} € / an
                      </span>
                    </p>
                  </div>
                </div>

                {/* Savings Detail */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Detail des Economies</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Poste</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Actuel</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Albore</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Economie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-muted">
                            <td className="px-4 py-3 text-sm">{item.label}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              {item.current.toLocaleString('fr-FR')} €
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-primary">
                              {item.albore.toLocaleString('fr-FR')} €
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-success">
                              {item.savings > 0
                                ? `-${item.savings.toLocaleString('fr-FR')} €`
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Savings */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Economies Realisees</h3>
                  <div className="rounded-lg border-2 border-success/30 bg-gradient-to-r from-success/10 to-success/5 p-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">Economie mensuelle</p>
                        <p className="text-2xl font-bold text-success">
                          {totals.monthlySavings.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">Economie annuelle</p>
                        <p className="text-2xl font-bold text-success">
                          {totals.annualSavings.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">Pourcentage</p>
                        <p className="text-2xl font-bold text-success">
                          {totals.savingsPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conclusion */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Prochaines Etapes</h3>
                  <EditableSection
                    value={conclusion}
                    onChange={setConclusion}
                    isEditing={isEditingConclusion}
                    setIsEditing={setIsEditingConclusion}
                    multiline
                  />
                </div>

                {/* Footer */}
                <div className="border-t-2 pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Proposition generee par Albore Analytics
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Document confidentiel - Ne pas diffuser
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personnalisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="transition-smooth flex w-full items-center justify-between rounded-lg bg-muted p-3 hover:bg-muted/80"
                >
                  <span className="text-sm">Editer le titre</span>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setIsEditingIntro(true)}
                  className="transition-smooth flex w-full items-center justify-between rounded-lg bg-muted p-3 hover:bg-muted/80"
                >
                  <span className="text-sm">Editer l'introduction</span>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setIsEditingConclusion(true)}
                  className="transition-smooth flex w-full items-center justify-between rounded-lg bg-muted p-3 hover:bg-muted/80"
                >
                  <span className="text-sm">Editer la conclusion</span>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-primary">Astuce</h3>
                <p className="text-sm text-muted-foreground">
                  Passez la souris sur les sections pour voir apparaitre l'icone d'edition
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
