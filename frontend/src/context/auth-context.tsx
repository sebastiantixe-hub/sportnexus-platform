import React, { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user: auth0User,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Map Auth0 user to our internal User shape
  const user: User | null = isAuthenticated && auth0User
    ? {
        id: auth0User.sub ?? '',
        name: auth0User.name ?? auth0User.email ?? 'Usuario',
        email: auth0User.email ?? '',
        role: (auth0User['https://sportnexus-api/role'] as string) ?? 'USER',
        avatarUrl: auth0User.picture,
      }
    : null;

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin + '/login' } });
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, login, logout, getToken }}>
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
