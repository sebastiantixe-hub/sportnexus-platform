import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth-context';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfileSelectorPage from './pages/auth/ProfileSelectorPage';
import Dashboard from './pages/dashboard/Dashboard';
import GymsPage from './pages/gyms/GymsPage';
import GymShowroom from './pages/gyms/GymShowroom';
import ClassesPage from './pages/classes/ClassesPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import MembershipsPage from './pages/memberships/MembershipsPage';
import ProfessionalsPage from './pages/professionals/ProfessionalsPage';
import MapSearchPage from './pages/discovery/MapSearchPage';
import EventsPage from './pages/events/EventsPage';
import AnalyticsView from './pages/dashboard/AnalyticsView';
import CRMView from './pages/dashboard/CRMView';
import HealthView from './pages/dashboard/HealthView';
import CoachHealthView from './pages/dashboard/CoachHealthView';
import OwnerHealthView from './pages/dashboard/OwnerHealthView';
import AdminHealthView from './pages/dashboard/AdminHealthView';
import InvoicesView from './pages/dashboard/InvoicesView';
import PlatformOverviewView from './pages/dashboard/PlatformOverviewView';
import UsersManagementView from './pages/dashboard/UsersManagementView';
import TicketsPage from './pages/tickets/TicketsPage';
import SportStorePage from './pages/store/SportStorePage';
import { Toaster } from 'sonner';

// Componente de Redirección Dinámica de Inicio según el Rol del usuario
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex bg-background-darker h-screen items-center justify-center">
        <div className="border-primary border-t-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si tiene múltiples roles y no ha seleccionado perfil en esta sesión, ir al selector de Netflix
  const hasSelected = sessionStorage.getItem('profileSelected') === 'true';
  if (user.roles && user.roles.length > 1 && !hasSelected) {
    return <Navigate to="/select-profile" replace />;
  }

  // Redireccionar al URL dedicado del Rol correspondiente
  if (user.role === 'ADMIN') return <Navigate to="/super-admin" replace />;
  if (user.role === 'GYM_OWNER') return <Navigate to="/owner-dashboard" replace />;
  if (user.role === 'TRAINER') return <Navigate to="/coach-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/select-profile" element={<ProtectedRoute><ProfileSelectorPage /></ProtectedRoute>} />
          
          {/* 
              Redirección Dinámica a cada panel dedicado según el rol de la cuenta
          */}
          <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

          {/* Rutas con Protección de Rol estricta */}
          <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={['GYM_OWNER']}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/coach-dashboard" element={<ProtectedRoute allowedRoles={['TRAINER']}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout><AnalyticsView /></MainLayout>} path="/dashboard/analytics" />
            <Route element={<MainLayout><PlatformOverviewView /></MainLayout>} path="/dashboard/platform-overview" />
            <Route element={<MainLayout><CRMView /></MainLayout>} path="/dashboard/crm" />
            <Route element={<MainLayout><HealthView /></MainLayout>} path="/dashboard/health" />
            <Route element={<MainLayout><CoachHealthView /></MainLayout>} path="/dashboard/coach-health" />
            <Route element={<MainLayout><OwnerHealthView /></MainLayout>} path="/dashboard/owner-health" />
            <Route element={<MainLayout><AdminHealthView /></MainLayout>} path="/dashboard/admin-health" />
            <Route element={<MainLayout><InvoicesView /></MainLayout>} path="/dashboard/invoices" />
            <Route element={<MainLayout><UsersManagementView /></MainLayout>} path="/dashboard/users" />
            <Route element={<MainLayout><TicketsPage /></MainLayout>} path="/dashboard/tickets" />
            <Route element={<MainLayout><SportStorePage /></MainLayout>} path="/sport-store" />
            <Route element={<MainLayout><GymsPage /></MainLayout>} path="/gyms" />
            <Route element={<MainLayout><GymShowroom /></MainLayout>} path="/gyms/:id" />
            <Route element={<MainLayout><ClassesPage /></MainLayout>} path="/classes" />
            <Route element={<MainLayout><MarketplacePage /></MainLayout>} path="/marketplace" />
            <Route element={<MainLayout><ProfessionalsPage /></MainLayout>} path="/professionals" />
            <Route element={<MainLayout><MapSearchPage /></MainLayout>} path="/discovery" />
            <Route element={<MainLayout><EventsPage /></MainLayout>} path="/events" />
            <Route element={<MainLayout><MembershipsPage /></MainLayout>} path="/memberships" />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors theme="dark" />
    </AuthProvider>
  );
}

export default App;
