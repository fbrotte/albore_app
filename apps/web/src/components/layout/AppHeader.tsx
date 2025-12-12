import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Home, FileText, Users, LogOut, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore, useUser } from '@/stores/auth.store'
import { trpc } from '@/lib/trpc'

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUser()
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore((state) => state.refreshToken)

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })

  const handleLogout = () => {
    if (refreshToken) {
      logoutMutation.mutate({ refreshToken })
    } else {
      logout()
      navigate('/login')
    }
  }

  const isActive = (path: string) => location.pathname === path

  const NavButton = ({
    path,
    icon: Icon,
    label,
  }: {
    path: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }) => (
    <button
      onClick={() => navigate(path)}
      className={`transition-smooth flex items-center space-x-2 rounded-lg px-4 py-2 ${
        isActive(path)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  )

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex cursor-pointer items-center space-x-2"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">
              Albore <span className="text-primary">Analytics</span>
            </span>
          </div>

          <nav className="flex items-center space-x-2">
            <NavButton path="/dashboard" icon={Home} label="Dashboard" />
            <NavButton path="/clients" icon={Users} label="Clients" />
            <NavButton path="/services" icon={Package} label="Services" />
            <NavButton path="/analyses/new" icon={FileText} label="Nouvelle Analyse" />
          </nav>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? 'Deconnexion...' : 'Deconnexion'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
