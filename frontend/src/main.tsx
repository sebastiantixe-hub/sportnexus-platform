import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'

const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-khvop4d61s5ip8d3.us.auth0.com";
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "3kp2ZDHZYjBxcJaqtGXZdTIShBsK3sJK";
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || "https://hercix-api";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
