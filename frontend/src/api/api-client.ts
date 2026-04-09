import axios from 'axios';
import { GetTokenSilentlyOptions } from '@auth0/auth0-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth0 token getter — set externally once Auth0 is initialized
let auth0GetToken: ((options?: GetTokenSilentlyOptions) => Promise<string>) | null = null;

export const setAuth0TokenGetter = (
  getter: (options?: GetTokenSilentlyOptions) => Promise<string>,
) => {
  auth0GetToken = getter;
};

// Request interceptor: attach Auth0 bearer token automatically
api.interceptors.request.use(
  async (config) => {
    if (auth0GetToken) {
      try {
        const token = await auth0GetToken({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // token not available yet (user not logged in)
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Permiso denegado:', error.response.data?.message);
    }
    return Promise.reject(error);
  },
);

export default api;
