# 🛡️ SISTEMA DE AUTENTICACIÓN, CONTROL DE ACCESO (RBAC) Y REDIRECCIÓN CON AUTH0
## Documento Técnico Oficial de Integración de Hercix

Este manual documenta la implementación profesional de **Auth0** como proveedor de identidad centralizado para la plataforma **Hercix**, integrando autenticación federada, control de acceso basado en roles (RBAC) y redirección automática sin alterar la interfaz visual de los dashboards ya construidos.

---

## 1. Mapeo de Roles y Redirecciones

El sistema cuenta con 4 roles bien segmentados. Cada uno de ellos, después de un inicio de sesión exitoso, es redirigido automáticamente a su respectiva ruta del cliente:

| Rol | Identificador en Auth0 / JWT | Ruta de Destino (Frontend) |
| :--- | :--- | :--- |
| **Super Admin** | `ADMIN` | `/super-admin` |
| **Dueño (Owner)** | `GYM_OWNER` | `/owner-dashboard` |
| **Coach** | `TRAINER` | `/coach-dashboard` |
| **Atleta (Usuario)** | `USER` | `/dashboard` |

---

## 2. Configuración en la Consola Web de Auth0 (Paso a Paso)

Para replicar esta arquitectura en producción, realice la siguiente configuración paso a paso en el panel de Auth0:

### Paso 1: Registro de la Aplicación Frontend (SPA)
1. Ingrese a **Applications** > **Applications** > **Create Application**.
2. Nombre: `Hercix Frontend`.
3. Tipo: **Single Page Web Applications** (React).
4. Configure las siguientes URLs (en local):
   *   *Allowed Callback URLs:* `http://localhost:5173/callback`, `http://localhost:5173/`
   *   *Allowed Logout URLs:* `http://localhost:5173/`
   *   *Allowed Web Origins:* `http://localhost:5173`

### Paso 2: Registro de la API del Backend
1. Vaya a **Applications** > **APIs** > **Create API**.
2. Nombre: `Hercix API Gateway`.
3. Identificador: `https://api.hercix-health.com`.
4. Algoritmo de firma: **RS256** (Obligatorio por estándares de seguridad modernos).

### Paso 3: Definición de Roles en Auth0
1. Vaya a **User Management** > **Roles**.
2. Cree los 4 roles haciendo clic en **Create Role**:
   *   `ADMIN`
   *   `GYM_OWNER`
   *   `TRAINER`
   *   `USER`

---

## 3. Agregar Roles Personalizados al Token JWT usando Auth0 Actions

Para incluir el rol asignado en el token de acceso que viaja al backend y el de ID del cliente, agregue un **Auth0 Action**:

1. En el panel lateral de Auth0, vaya a **Actions** > **Library** > **Build Custom**.
2. Nombre: `InjectRolesToClaims`, Trigger: **Login / Post Login**.
3. Reemplace el código con el siguiente fragmento oficial:

```javascript
/**
* Handler que inyecta roles en los Tokens JWT de Auth0 de manera segura.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://hercix.com';
  if (event.authorization && event.authorization.roles) {
    // Inyecta el arreglo de roles en ambos tokens seguros
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

4. Haga clic en **Deploy**.
5. Vaya a **Actions** > **Flows** > **Login**, arrastre su nueva acción `InjectRolesToClaims` desde la librería y suéltela en medio del flujo de inicio de sesión. Guarde los cambios.

---

## 4. Código del Frontend (React + React Router + Auth0 SPA SDK)

### Proveedor de Autenticación y Persistencia (`auth-context.tsx`)
Para evitar el uso inseguro de `localStorage` para tokens y usar la memoria segura del SPA SDK de Auth0 con renovación silenciosa:

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth0Client } from '@auth0/auth0-spa-js';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth0Client, setAuth0Client] = useState<Auth0Client | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth0 = async () => {
      try {
        const client = new Auth0Client({
          domain: 'dev-hercix.us.auth0.com',
          client_id: 'TU_CLIENT_ID_DE_AUTH0',
          authorizationParams: {
            redirect_uri: window.location.origin,
            audience: 'https://api.hercix-health.com',
          },
          useRefreshTokens: true,
          cacheLocation: 'memory', // 🛡️ NUNCA en localStorage para evitar ataques XSS
        });

        setAuth0Client(client);

        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
          await client.handleRedirectCallback();
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const isAuth = await client.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          const profile = await client.getUser();
          setUser(profile);
        }
      } catch (error) {
        console.error('Error al inicializar Auth0:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth0();
  }, []);

  const login = async () => {
    if (auth0Client) await auth0Client.loginWithRedirect();
  };

  const logout = async () => {
    if (auth0Client) {
      await auth0Client.logout({
        logoutParams: { returnTo: window.location.origin }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
```

### Rutas Protegidas en React Router (`ProtectedRoute.tsx`)
Garantiza que nadie pueda ingresar manualmente a URLs restringidas escribiéndolas en la barra del navegador:

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="spinner">Cargando aplicación...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Extraemos los roles inyectados por custom claims en el token de Auth0
  const userRoles = user['https://hercix.com/roles'] || [];
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Redirección Automática por Rol tras Iniciar Sesión (`LoginCallback.tsx`)
Página intermedia de redirección post-login:

```tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';

export const LoginCallback: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const userRoles = user['https://hercix.com/roles'] || [];

      if (userRoles.includes('ADMIN')) {
        navigate('/super-admin', { replace: true });
      } else if (userRoles.includes('GYM_OWNER')) {
        navigate('/owner-dashboard', { replace: true });
      } else if (userRoles.includes('TRAINER')) {
        navigate('/coach-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true }); // Atleta / Usuario por defecto
      }
    }
  }, [user, loading, isAuthenticated, navigate]);

  return <div className="loading-screen">Redirigiéndote a tu panel correspondiente...</div>;
};
```

---

## 5. Código del Backend (Node.js + Express Middleware)

### Validación Criptográfica Segura de JWT (Auditoría de Producción)
Usa validación asimétrica mediante firma **RS256**. El backend descarga de forma dinámica las claves públicas del servidor JWKS de Auth0 y valida que la firma sea genuina:

```javascript
const { auth } = require('express-oauth2-jwt-bearer');

// Middleware para verificar la validez criptográfica del JWT
const checkJwt = auth({
  audience: 'https://api.hercix-health.com',
  issuerBaseURL: 'https://dev-hercix.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

module.exports = { checkJwt };
```

### Middleware de Control de Roles (RBAC backend)
Protección de rutas de Express por roles:

```javascript
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.auth es inyectado por el middleware express-oauth2-jwt-bearer
    const userRoles = req.auth?.payload['https://hercix.com/roles'] || [];

    const hasAccess = allowedRoles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tienes el nivel de acceso requerido para realizar esta acción.'
      });
    }

    next();
  };
};

module.exports = { requireRole };

// ── Ejemplo de uso en rutas backend ──────────────────────────────────────────
// app.get('/api/owner/analytics', checkJwt, requireRole(['GYM_OWNER', 'ADMIN']), getGymStats);
```

---

## 6. Buenas Prácticas de Ciberseguridad Implementadas

1.  **Eliminación de LocalStorage para Tokens:** Los tokens de acceso nunca se almacenan en `localStorage` o `sessionStorage`, los cuales son vulnerables a ataques de robo de sesión a través de scripts de terceros (XSS). La sesión se mantiene en la memoria del SPA SDK y se renueva de manera transparente usando **Refresh Tokens con rotación automática**.
2.  **Validación RS256 Asimétrica:** El servidor no necesita hacer una llamada REST a Auth0 por cada petición HTTP (lo cual saturaría el API y haría lento el sistema). Valida la firma del token de forma local utilizando claves criptográficas públicas asimétricas.
3.  **Doble Capa de Protección (Defensa en Profundidad):** Aunque el cliente oculte elementos en la UI, el backend bloquea cualquier intento malicioso de acceder a los datos a nivel de base de datos relacional (PostgreSQL / MySQL) mediante el middleware `requireRole`.
