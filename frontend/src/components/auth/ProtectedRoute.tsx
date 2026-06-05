import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  // Only show spinner for a brief moment while Auth0 processes a callback
  const isProcessingCallback = typeof window !== 'undefined' &&
    (window.location.search.includes('code=') || window.location.search.includes('state='));

  if (loading && isProcessingCallback) {
    return (
      <div className="flex bg-background-darker h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary border-t-2 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-slate-400 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users dynamically to their correct dashboard path
    let correctPath = '/dashboard';
    if (user.role === 'ADMIN') correctPath = '/super-admin';
    else if (user.role === 'GYM_OWNER') correctPath = '/owner-dashboard';
    else if (user.role === 'TRAINER') correctPath = '/coach-dashboard';
    
    return <Navigate to={correctPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
