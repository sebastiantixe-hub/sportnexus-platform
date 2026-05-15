import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Redirect to Auth0 signup
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  }, [loginWithRedirect]);

  return (
    <div className="flex bg-background-darker min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Redirigiendo al portal seguro de registro...</p>
      </div>
    </div>
  );
};

export default RegisterPage;
