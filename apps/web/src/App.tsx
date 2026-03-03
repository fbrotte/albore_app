import { Routes, Route, Navigate } from 'react-router-dom'
import { useIsAuthenticated, useAuthLoading } from './stores/auth.store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import CreateAnalysisPage from './pages/CreateAnalysisPage'
import AnalysisPage from './pages/AnalysisPage'
import UploadInvoicePage from './pages/UploadInvoicePage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import ProposalPage from './pages/ProposalPage'
import ProposalDocumentPage from './pages/ProposalDocumentPage'
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

      {/* Analyses */}
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
      <Route
        path="/analyses/:id/upload"
        element={
          <ProtectedRoute>
            <UploadInvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyses/:id/results"
        element={
          <ProtectedRoute>
            <AnalysisResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyses/:id/proposal"
        element={
          <ProtectedRoute>
            <ProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyses/:id/document"
        element={
          <ProtectedRoute>
            <ProposalDocumentPage />
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
