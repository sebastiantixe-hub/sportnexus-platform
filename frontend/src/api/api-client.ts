import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Auth0 Token Injector ─────────────────────────────────────────────────────
// Called once by MainLayout after Auth0 is ready.
// All subsequent API calls will carry the correct Bearer token automatically.

type TokenGetter = () => Promise<string>;
let _getToken: TokenGetter | null = null;

export const setAuth0TokenGetter = (getter: TokenGetter) => {
  _getToken = getter;
};

api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        const token = await _getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Not authenticated yet — request proceeds without token
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response error handling ──────────────────────────────────────────────────

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
