import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './context/auth-context';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import GymsPage from './pages/gyms/GymsPage';
import ClassesPage from './pages/classes/ClassesPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import MembershipsPage from './pages/memberships/MembershipsPage';
import ProfessionalsPage from './pages/professionals/ProfessionalsPage';
import MapSearchPage from './pages/discovery/MapSearchPage';
import EventsPage from './pages/events/EventsPage';
import AnalyticsView from './pages/dashboard/AnalyticsView';
import CRMView from './pages/dashboard/CRMView';
import WearablesView from './pages/dashboard/WearablesView';
import InvoicesView from './pages/dashboard/InvoicesView';

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + '/dashboard',
        audience: audience,
        scope: 'openid profile email',
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes inside MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout><Dashboard /></MainLayout>} path="/dashboard" />
              <Route element={<MainLayout><AnalyticsView /></MainLayout>} path="/dashboard/analytics" />
              <Route element={<MainLayout><CRMView /></MainLayout>} path="/dashboard/crm" />
              <Route element={<MainLayout><WearablesView /></MainLayout>} path="/dashboard/wearables" />
              <Route element={<MainLayout><InvoicesView /></MainLayout>} path="/dashboard/invoices" />
              <Route element={<MainLayout><GymsPage /></MainLayout>} path="/gyms" />
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
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;
