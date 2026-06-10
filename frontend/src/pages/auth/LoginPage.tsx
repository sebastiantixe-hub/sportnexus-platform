import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { Building2, Dumbbell, Users, LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { login, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithCredentials(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de credenciales local o usuario no registrado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (targetEmail: string) => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithCredentials(targetEmail, 'Hercix2026!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(`Error en login rápido: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    {
      title: 'Dueño (Owner)',
      icon: Building2,
      desc: 'Administración de gimnasios, academias, ingresos y membresías.',
      color: 'from-primary/20 to-primary/10 border-primary/20 text-primary-lightHover',
      accent: 'bg-primary',
      image: '/assets/gym_owner_gateway.png',
      allowSignUp: false,
    },
    {
      title: 'Coach / Entrenador',
      icon: Dumbbell,
      desc: 'Gestión de clases, rutinas, alumnos y perfiles profesionales.',
      color: 'from-accent/20 to-accent/10 border-accent/20 text-accentHover',
      accent: 'bg-accent',
      image: '/assets/coach_gateway.png',
      allowSignUp: false,
    },
    {
      title: 'Atleta / Usuario',
      icon: Users,
      desc: 'Reservas de clases, wearables de salud y compras en el marketplace.',
      color: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400Hover',
      accent: 'bg-green-500',
      image: '/assets/athlete_gateway.png',
      allowSignUp: true,
    },
  ];

  return (
    <div className="flex flex-col bg-background-darker min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-200 text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        Volver al inicio
      </motion.button>
      {/* Background glowing design */}
      <div className="absolute -top-40 -left-40 rounded-full w-[600px] h-[600px] bg-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 rounded-full w-[600px] h-[600px] bg-accent/10 blur-3xl"></div>
 
      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-12 relative z-10"
      >
        <img src="/hercix-logo.png" alt="Hercix" className="h-20 mx-auto object-contain mb-4" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Portal de Acceso Seguro</h1>
        <p className="text-slate-400 mt-2 text-base">
          Selecciona tu perfil de acceso para ingresar de manera encriptada a la suite Hercix Health o usa el Acceso Directo de prueba.
        </p>
      </motion.div>

      {/* Interactive Gateway Cards Grid - Symmetric 3-column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10 mb-8">
        {roles.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => login({ allowSignUp: r.allowSignUp })}
              className={`glass-card p-5 border border-white/5 bg-gradient-to-br ${r.color.split(' ')[0]} ${r.color.split(' ')[1]} hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                {/* Image Container with Lucide Icon Badge Overlay */}
                <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img 
                    src={r.image} 
                    alt={r.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
                  
                  {/* Badge floating */}
                  <div className="absolute top-3 right-3 bg-slate-950/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold text-slate-300">
                    Ingreso Seguro
                  </div>

                  {/* Icon floating */}
                  <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">{r.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{r.desc}</p>
              </div>
              
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ingresar ahora</span>
                <LogIn className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Local Credentials Login Bypass */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card max-w-md w-full p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-2xl text-center relative z-10 mb-8"
      >
        <h3 className="text-lg font-bold text-white mb-2">Acceso Directo (Demo / Desarrollo)</h3>
        <p className="text-slate-400 text-xs mb-4">
          Inicia sesión al instante con cualquiera de las cuentas demo de la base de datos sin pasar por Auth0.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Contraseña (ej: Hercix2026!)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión Directa'}
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-transparent px-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold z-10">o elige uno rápido</span>
        </div>

        {/* Quick Demo Selectors */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickLogin('mario123q@gmail.com')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[11px] text-slate-300 font-medium transition-colors"
          >
            👑 Super Admin
          </button>
          <button
            onClick={() => handleQuickLogin('atleta01@testgym.pe')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[11px] text-slate-300 font-medium transition-colors"
          >
            🏃‍♂️ Atleta 01
          </button>
          <button
            onClick={() => handleQuickLogin('atleta70@testgym.pe')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[11px] text-slate-300 font-medium transition-colors"
          >
            🏃‍♂️ Atleta 70 (Julio)
          </button>
          <button
            onClick={() => handleQuickLogin('entrenador20@testgym.pe')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[11px] text-slate-300 font-medium transition-colors"
          >
            🏋️‍♂️ Coach 20
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-center border-t border-white/5 pt-6 w-full max-w-md"
      >
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
          © 2026 HERCIX | TODOS LOS DERECHOS RESERVADOS
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
