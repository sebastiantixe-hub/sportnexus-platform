import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../api/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  dni?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  updateUserProfile: (data: { name: string; phone?: string; dni?: string }) => Promise<void>;
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
      // Si hay un código de Auth0 en la URL, no hacemos nada todavía, dejamos que el SDK procese el callback
      const params = new URLSearchParams(window.location.search);
      const hasAuth0Params = params.has('code') || params.has('error') || params.has('state');
      
      console.log('Sincronizando con Backend:', { isAuthenticated, auth0Loading, hasUser: !!auth0User, hasAuth0Params });
      
      if (auth0Loading || (hasAuth0Params && !isAuthenticated)) {
        console.log('Esperando a que Auth0 procese el callback...');
        return; 
      }

      if (isAuthenticated && auth0User) {
        setBackendLoading(true);
        try {
          const token = await getAccessTokenSilently();
          console.log('Token de Auth0 obtenido con éxito');
          localStorage.setItem('token', token);
          
          const { data } = await api.get('/auth/me');
          console.log('Perfil sincronizado desde Backend:', data.email);
          setUser(data);
        } catch (error: any) {
          console.error('Error sincronizando usuario:', error.response?.data || error.message);
          // Si el error es 401, significa que el backend rechazó el token de Auth0
          if (error.response?.status === 401) {
             console.warn('Backend rechazó el token. Verificando configuración...');
          }
          setUser(null);
          localStorage.removeItem('token');
        } finally {
          setBackendLoading(false);
        }
      } else {
        // Solo limpiar si no estamos en medio de una carga de Auth0
        setUser(null);
        localStorage.removeItem('token');
        setBackendLoading(false);
      }
    };

    syncUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, auth0Loading]);

  const login = () => loginWithRedirect();
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const updateUserProfile = async (profileData: { name: string; phone?: string; dni?: string }) => {
    try {
      const { data } = await api.patch('/auth/profile', profileData);
      setUser(prev => prev ? { ...prev, ...data } : data);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: auth0Loading || (isAuthenticated && backendLoading), 
      login, 
      logout,
      updateUserProfile
    }}>
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
