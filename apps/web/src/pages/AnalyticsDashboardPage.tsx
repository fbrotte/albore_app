import { useNavigate } from 'react-router-dom'
import { FileText, TrendingUp, Users, Euro, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
  suffix?: string
}

function StatCard({ icon: Icon, label, value, color, suffix = '' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center space-x-4 p-6">
        <div className={`rounded-full p-4 ${color} bg-opacity-10`}>
          <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">
            {value}
            {suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = trpc.analyses.getDashboardStats.useQuery()

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold">Bienvenue sur Albore Analytics</h1>
                <p className="text-lg text-primary-foreground/80">
                  Analysez vos factures et decouvrez vos economies potentielles en quelques secondes
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/analyses/new')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Nouvelle Analyse</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {isLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="mb-4 h-8 w-8 rounded-full bg-muted" />
                    <div className="mb-2 h-4 w-24 rounded bg-muted" />
                    <div className="h-8 w-16 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Factures analysees"
              value={stats?.invoicesAnalyzed ?? 0}
              color="bg-blue-600"
            />
            <StatCard
              icon={Euro}
              label="Economies detectees"
              value={`${(stats?.totalSavings ?? 0).toLocaleString('fr-FR')} €`}
              color="bg-green-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Economie moyenne"
              value={stats?.averageSavingsPercent ?? 0}
              suffix="%"
              color="bg-orange-600"
            />
            <StatCard
              icon={Users}
              label="Clients actifs"
              value={stats?.activeClients ?? 0}
              color="bg-purple-600"
            />
          </div>
        )}

        {/* Recent Analyses */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Dernieres analyses</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-5 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-muted" />
                        <div className="h-4 rounded bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(`/analyses/${analysis.id}`)}
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{analysis.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {analysis.clientCompany || analysis.name}
                        </p>
                      </div>
                      {analysis.savingsPercent > 0 && (
                        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                          -{analysis.savingsPercent}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Montant actuel</span>
                        <span className="font-semibold">
                          {analysis.totalHt.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Economie mensuelle</span>
                        <span className="font-semibold text-success">
                          {analysis.totalSavings.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Economie annuelle</span>
                        <span className="font-semibold text-success">
                          {(analysis.totalSavings * 12).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(analysis.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <button className="flex items-center text-sm font-medium text-primary hover:text-primary/80">
                        Voir details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Aucune analyse pour le moment</h3>
                <p className="mb-6 text-muted-foreground">
                  Commencez par creer un client puis lancez votre premiere analyse de facture
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => navigate('/clients')}>
                    <Users className="mr-2 h-4 w-4" />
                    Gerer les clients
                  </Button>
                  <Button onClick={() => navigate('/analyses/new')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Nouvelle analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
