import React from 'react';
import { useAuth } from '../../context/auth-context';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="flex bg-background-darker min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute -top-24 -left-24 rounded-full w-96 h-96 bg-primary/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 rounded-full w-96 h-96 bg-accent/20 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10 text-center"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/hercix-logo.png" alt="Hercix" className="h-20 object-contain mb-4" />
          <h2 className="text-2xl font-bold text-white">Bienvenido a Hercix</h2>
          <p className="text-slate-400 mt-2">La plataforma definitiva para el atleta moderno.</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-primary-light w-5 h-5" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Acceso Seguro</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Utilizamos Auth0 para garantizar que tus datos estén protegidos con los estándares de seguridad más altos de la industria.
          </p>
        </div>

        <button
          onClick={() => login()}
          disabled={loading}
          className="btn-primary w-full py-4 flex items-center justify-center gap-3 group relative overflow-hidden active:scale-[0.98] text-lg shadow-xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              <span>Entrar con Auth0</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
            Powered by Hercix & Auth0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
