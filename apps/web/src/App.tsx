import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useIsAuthenticated, useAuthLoading } from './stores/auth.store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import CreateAnalysisPage from './pages/CreateAnalysisPage'
import AnalysisPage from './pages/AnalysisPage'
import ProposalDocumentDemoPage from './pages/ProposalDocumentDemoPage'
import ServicesPage from './pages/ServicesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>
}

// Redirect component for backwards compatibility
function UploadRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/analyses/${id}?tab=data`} replace />
}

function ResultsRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/analyses/${id}?tab=assignation`} replace />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AnalyticsDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Clients */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Analyses - unified page with tabs */}
      <Route
        path="/analyses/new"
        element={
          <ProtectedRoute>
            <CreateAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyses/:id"
        element={
          <ProtectedRoute>
            <AnalysisPage />
          </ProtectedRoute>
        }
      />

      {/* Backwards-compatible redirects */}
      <Route
        path="/analyses/:id/upload"
        element={
          <ProtectedRoute>
            <UploadRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyses/:id/results"
        element={
          <ProtectedRoute>
            <ResultsRedirect />
          </ProtectedRoute>
        }
      />

      {/* Demo page for proposal document */}
      <Route
        path="/demo/proposal"
        element={
          <ProtectedRoute>
            <ProposalDocumentDemoPage />
          </ProtectedRoute>
        }
      />

      {/* Services / Catalogue */}
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default App
