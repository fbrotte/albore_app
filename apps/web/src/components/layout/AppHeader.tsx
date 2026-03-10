import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Users, LogOut, Package, UserCog, FileText } from 'lucide-react'
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

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

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
      className={`transition-smooth flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
        isActive(path)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <header className="border-b bg-card shadow-sm print:hidden">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                Albore <span className="text-primary">Analytics</span>
              </span>
            </div>

            <nav className="flex items-center gap-1">
              <NavButton path="/dashboard" icon={FileText} label="Analyses" />
              <NavButton path="/clients" icon={Users} label="Clients" />
              <NavButton path="/services" icon={Package} label="Services" />
              <NavButton path="/users" icon={UserCog} label="Utilisateurs" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {user?.name}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
