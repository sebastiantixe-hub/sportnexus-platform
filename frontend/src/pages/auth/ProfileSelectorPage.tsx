import React from 'react';
import { useAuth } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Dumbbell, Users, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileSelectorPage: React.FC = () => {
  const { user, switchUserRole } = useAuth();
  const navigate = useNavigate();

  // Si no hay usuario cargado, no mostrar nada
  if (!user) {
    return (
      <div className="flex bg-background-darker min-h-screen items-center justify-center">
        <div className="border-primary border-t-2 rounded-full w-12 h-12 animate-spin" />
      </div>
    );
  }

  // Lista completa de perfiles posibles
  const allProfiles = [
    {
      role: 'ADMIN',
      title: 'Super Admin',
      icon: ShieldCheck,
      desc: 'Control y administración centralizada de toda la red Hercix.',
      color: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
      accent: 'bg-red-500',
      image: '/assets/super_admin_gateway.png',
    },
    {
      role: 'GYM_OWNER',
      title: 'Dueño (Owner)',
      icon: Building2,
      desc: 'Gestión de membresías, ingresos, clases y métricas del negocio.',
      color: 'from-primary/20 to-primary/10 border-primary/20 text-primary-light',
      accent: 'bg-primary',
      image: '/assets/gym_owner_gateway.png',
    },
    {
      role: 'TRAINER',
      title: 'Coach / Entrenador',
      icon: Dumbbell,
      desc: 'Planificación de rutinas, control de alumnos y agendas de clases.',
      color: 'from-accent/20 to-accent/10 border-accent/20 text-accent',
      accent: 'bg-accent',
      image: '/assets/coach_gateway.png',
    },
    {
      role: 'USER',
      title: 'Atleta / Usuario',
      icon: Users,
      desc: 'Exploración de academias, reservas de clases y tienda deportiva.',
      color: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
      accent: 'bg-green-500',
      image: '/assets/athlete_gateway.png',
    },
  ];

  // Filtrar los perfiles de acuerdo a los que posee el usuario en la base de datos
  const userRoles = user.roles || ['USER'];
  const availableProfiles = allProfiles.filter((p) => userRoles.includes(p.role));

  const handleSelectProfile = async (role: string) => {
    try {
      await switchUserRole(role);
      sessionStorage.setItem('profileSelected', 'true');
      
      if (role === 'ADMIN') {
        navigate('/super-admin');
      } else if (role === 'GYM_OWNER') {
        navigate('/owner-dashboard');
      } else if (role === 'TRAINER') {
        navigate('/coach-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error al ingresar al perfil:', err);
    }
  };

  return (
    <div className="flex flex-col bg-background-darker min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing design */}
      <div className="absolute -top-40 -left-40 rounded-full w-[600px] h-[600px] bg-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 rounded-full w-[600px] h-[600px] bg-accent/10 blur-3xl"></div>

      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-12 relative z-10"
      >
        <img src="/hercix-logo.png" alt="Hercix" className="h-16 mx-auto object-contain mb-4" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">¿Con qué perfil deseas ingresar hoy?</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
          Hola, <span className="text-white font-bold">{user.name}</span>. Selecciona el perfil con el que deseas interactuar en Hercix Health.
        </p>
      </motion.div>

      {/* Dynamic Profile Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl relative z-10 mb-10 justify-center">
        {availableProfiles.map((r, i) => {
          const Icon = r.icon;
          const isActive = user.role === r.role;
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleSelectProfile(r.role)}
              className={`glass-card p-5 border ${
                isActive ? 'border-primary/60 shadow-lg shadow-primary/20' : 'border-white/5 hover:border-white/20'
              } bg-gradient-to-br ${r.color.split(' ')[0]} ${r.color.split(' ')[1]} transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                {/* Image Container with Overlay */}
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img 
                    src={r.image} 
                    alt={r.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
                  
                  {/* Badge floating */}
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-md border border-primary/30 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold text-primary-light">
                      Activo 🟢
                    </div>
                  )}

                  {/* Icon floating */}
                  <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-primary-light transition-colors">{r.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{r.desc}</p>
              </div>
              
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ingresar al espacio</span>
                <LogIn className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-center border-t border-white/5 pt-6 w-full max-w-md"
      >
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
          Powered by Hercix Workspaces
        </p>
      </motion.div>
    </div>
  );
};

export default ProfileSelectorPage;
