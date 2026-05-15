import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../api/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    isAuthenticated, 
    user: auth0User, 
    getAccessTokenSilently, 
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout 
  } = useAuth0();
  
  const [user, setUser] = useState<User | null>(null);
  const [backendLoading, setBackendLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem('token', token);
          
          // Sync with our backend
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Error syncing user with backend:', error);
          localStorage.removeItem('token');
        } finally {
          setBackendLoading(false);
        }
      } else if (!auth0Loading) {
        setUser(null);
        localStorage.removeItem('token');
        setBackendLoading(false);
      }
    };

    syncUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, auth0Loading]);

  const login = () => {
    console.log('Contexto: Llamando a loginWithRedirect de Auth0');
    loginWithRedirect();
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <AuthContext.Provider value={{ user, loading: auth0Loading || (isAuthenticated && backendLoading), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
