import React from 'react';
import { useAuth } from '../../context/auth-context';
import { LogIn, Dumbbell, Shield, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="flex bg-background-darker min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 rounded-full w-96 h-96 bg-primary/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 rounded-full w-96 h-96 bg-accent/20 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-[600px] h-[600px] bg-primary/5 blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary/20 p-4 rounded-full mb-4 ring-1 ring-white/10">
            <Dumbbell className="text-primary-light w-10 h-10" />
          </div>
          <h1 className="font-bold text-3xl text-white">SportNexus</h1>
          <p className="text-slate-400 mt-2 text-center">
            Plataforma SaaS & Marketplace para el sector deportivo
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {[
            { icon: Shield, text: 'Acceso seguro con Auth0' },
            { icon: Zap, text: 'Gestión de gimnasios y clases en tiempo real' },
            { icon: Users, text: 'Marketplace deportivo integrado' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-400 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary-light" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Auth0 Login Button */}
        <button
          id="btn-login-auth0"
          onClick={login}
          disabled={loading}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-3 group relative overflow-hidden active:scale-[0.98] text-base font-semibold"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <LogIn className="w-5 h-5" />
          <span>Iniciar Sesión con Auth0</span>
        </button>

        <p className="text-slate-500 text-xs text-center mt-6">
          Al iniciar sesión aceptas nuestros términos de uso.<br />
          ¿No tienes cuenta? Auth0 te registrará automáticamente.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
