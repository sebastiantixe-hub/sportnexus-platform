import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api-client';
import {
  Users, Dumbbell, Calendar, TrendingUp, Clock, AlertCircle,
  ShoppingBag, Trophy, CreditCard, ArrowRight, Star, Activity,
  CheckCircle2, BarChart, Mail, Watch, Receipt, ShieldCheck,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecommendationsPanel from '../../components/ai/RecommendationsPanel';

/* ─────────────────────────── Sub-components ─────────────────────────── */

const StatCard: React.FC<{
  label: string; value: string | number; icon: any;
  trend?: string; color?: string; delay?: number;
}> = ({ label, value, icon: Icon, trend, color = 'primary', delay = 0 }) => {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary-light border-primary/20',
    secondary: 'bg-secondary/10 text-secondary-light border-secondary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card p-6 border border-white/5 hover:border-white/15 transition-all group cursor-default"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
      <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
    </motion.div>
  );
};

const AdminActionCard: React.FC<{
  label: string; icon: any; to: string; desc: string; color?: string; delay?: number;
}> = ({ label, icon: Icon, to, desc, color = 'primary', delay = 0 }) => {
  const navigate = useNavigate();
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary-light group-hover:bg-primary/20',
    blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',
    green: 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20',
    red: 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20',
  };
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(to)}
      className="glass-card p-5 flex flex-col gap-3 border-white/5 hover:border-white/20 transition-all w-full text-left group"
    >
      <div className={`p-3 rounded-xl w-fit transition-colors ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
      </div>
    </motion.button>
  );
};

const QuickAction: React.FC<{ label: string; icon: any; to: string; desc: string }> = ({ label, icon: Icon, to, desc }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ x: 4 }} onClick={() => navigate(to)}
      className="glass-card p-4 flex items-center gap-4 border-white/5 hover:border-primary/30 transition-all w-full text-left group"
    >
      <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
        <Icon className="text-primary-light w-5 h-5" />
      </div>
      <div className="flex-grow">
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-slate-500 text-xs">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-light transition-colors flex-shrink-0" />
    </motion.button>
  );
};

/* ─────────────────────────── Admin Dashboard ─────────────────────────── */

const AdminDashboard: React.FC<{ stats: any; user: any }> = ({ stats, user }) => (
  <div className="space-y-8">
    {/* Header */}
    <motion.header
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
            <ShieldCheck className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-red-400 text-sm font-bold uppercase tracking-widest">Super Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Panel de Control 🛡️</h1>
        <p className="text-slate-400 mt-1">Vista completa de la plataforma Hercix.</p>
      </div>
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-red-300 text-sm font-medium">{user?.name}</span>
      </div>
    </motion.header>

    {/* KPI Stats */}
    <div>
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">📊 Métricas de la Plataforma</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gimnasios / Academias" value={stats?.gyms ?? 0} icon={Building2} color="primary" trend="🌎 Nacional" delay={0.05} />
        <StatCard label="Usuarios Registrados" value={stats?.members ?? 0} icon={Users} color="secondary" trend="Total" delay={0.1} />
        <StatCard label="Clases Programadas" value={stats?.classes ?? 0} icon={Calendar} color="accent" delay={0.15} />
        <StatCard label="Reservas Confirmadas" value={stats?.revenue ?? 0} icon={TrendingUp} color="green" trend="💰 SaaS" delay={0.2} />
      </div>
    </div>

    {/* Admin Actions Grid */}
    <div>
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">⚡ Herramientas de Administración</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminActionCard label="Cuentas" icon={Users} to="/dashboard/users" desc="Gestionar usuarios" color="blue" delay={0.05} />
        <AdminActionCard label="Gimnasios" icon={Building2} to="/gyms" desc="Ver y editar locales" color="primary" delay={0.1} />
        <AdminActionCard label="Clases" icon={Calendar} to="/classes" desc="Gestionar horarios" color="green" delay={0.15} />
        <AdminActionCard label="Analítica" icon={BarChart} to="/dashboard/analytics" desc="KPIs y métricas" color="purple" delay={0.2} />
        <AdminActionCard label="Resumen SaaS" icon={TrendingUp} to="/dashboard/platform-overview" desc="Vista global" color="orange" delay={0.25} />
        <AdminActionCard label="Facturación" icon={Receipt} to="/dashboard/invoices" desc="Facturas e ingresos" color="red" delay={0.3} />
      </div>
    </div>

    {/* Recent Activity + Right Panel */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">🔔 Actividad Reciente en la Plataforma</h2>
        <div className="space-y-2">
          {stats?.activities && stats.activities.length > 0 ? (
            stats.activities.map((act: any, i: number) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-card p-4 flex items-center gap-4 border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="bg-green-500/10 p-2.5 rounded-xl flex-shrink-0">
                  <CheckCircle2 className="text-green-400 w-4 h-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{act.title}</h4>
                  <p className="text-slate-400 text-xs truncate">{act.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">
                    {new Date(act.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </p>
                  <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded-full">Reserva</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass-card p-10 flex flex-col items-center text-center opacity-60">
              <Activity className="text-slate-600 w-10 h-10 mb-3" />
              <p className="text-slate-400">Sin actividad reciente.</p>
            </div>
          )}
        </div>
      </section>

      {/* Right: Quick Links for Admin */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">🔗 Accesos Directos</h2>
        <div className="space-y-2">
          <QuickAction label="Marketing y CRM" icon={Mail} to="/dashboard/crm" desc="Campañas de email" />
          <QuickAction label="Tienda" icon={ShoppingBag} to="/marketplace" desc="Productos del marketplace" />
          <QuickAction label="Eventos" icon={Trophy} to="/events" desc="Torneos y masterclasses" />
          <QuickAction label="Membresías" icon={CreditCard} to="/memberships" desc="Planes de suscripción" />
          <QuickAction label="Descubrir" icon={Building2} to="/discovery" desc="Mapa de academias" />
        </div>
      </section>
    </div>
  </div>
);

/* ─────────────────────────── Main Dashboard ─────────────────────────── */

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/stats').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const isOwner = user?.role === 'GYM_OWNER';
  const isTrainer = user?.role === 'TRAINER';
  const isAdmin = user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary border-t-2 rounded-full w-14 h-14 animate-spin" />
          <p className="text-slate-400 text-sm">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Admin tiene su propio layout ────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="animate-in fade-in duration-700">
        <AdminDashboard stats={stats} user={user} />
      </div>
    );
  }

  // ── Layout para GYM_OWNER, TRAINER y USER ───────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Hola, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 mt-1">
            {isOwner ? 'Panel de administración de tu negocio deportivo.'
              : isTrainer ? 'Panel de gestión para entrenadores.'
              : 'Hoy es un excelente día para superarte.'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-primary-light' : 'bg-green-400'} animate-pulse`} />
          <span className="text-slate-300 text-sm font-medium capitalize">
            {user?.role.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isOwner ? (
          <>
            <StatCard label="Mis Gimnasios" value={stats?.gyms ?? 0} icon={Dumbbell} color="primary" trend="+Activos" delay={0.05} />
            <StatCard label="Miembros Totales" value={stats?.members ?? 0} icon={Users} color="secondary" delay={0.1} />
            <StatCard label="Ingresos Generados" value={`$${(stats?.revenue ?? 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="Total" delay={0.15} />
            <StatCard label="Clases Activas" value={stats?.classes ?? 0} icon={Calendar} color="accent" delay={0.2} />
          </>
        ) : (
          <>
            <StatCard label="Clases Reservadas" value={stats?.reservations ?? 0} icon={Calendar} color="primary" delay={0.05} />
            <StatCard label="Gimnasios Disponibles" value={stats?.gyms ?? 0} icon={Dumbbell} color="secondary" delay={0.1} />
            <StatCard label="Puntos Reward" value={(stats?.points ?? 0).toLocaleString()} icon={Star} color="accent" trend="🏅 Activo" delay={0.15} />
            <StatCard label="Meses Activo" value={stats?.months ?? 1} icon={Clock} color="green" delay={0.2} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividades */}
        <section className="lg:col-span-2 space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-light" /> Actividades Recientes
          </h2>
          <div className="space-y-3">
            {stats?.activities && stats.activities.length > 0 ? (
              stats.activities.map((act: any, i: number) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass-card p-4 flex items-center gap-4 border-white/5 hover:border-primary/20 transition-all"
                >
                  <div className="bg-primary/10 p-2.5 rounded-xl flex-shrink-0">
                    <CheckCircle2 className="text-primary-light w-5 h-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-white font-bold text-sm truncate">{act.title}</h4>
                    <p className="text-slate-400 text-xs truncate">{act.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">
                      {new Date(act.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </p>
                    <span className="text-primary-light text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">Reserva</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center opacity-60">
                <AlertCircle className="text-slate-600 w-12 h-12 mb-4" />
                <p className="text-slate-400">Aún no tienes actividad registrada.</p>
                <p className="text-slate-500 text-sm mt-1">Empieza explorando el Marketplace o reserva una clase.</p>
              </div>
            )}
          </div>
        </section>

        {/* Panel derecho */}
        <section className="space-y-6">
          {isOwner ? (
            <div className="bg-gradient-to-br from-primary/20 via-slate-800 to-slate-900 p-6 rounded-3xl border border-primary/20 relative overflow-hidden">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Rendimiento</span>
              <h3 className="text-4xl font-extrabold text-white mt-1">${(stats?.revenue ?? 0).toLocaleString()}</h3>
              <p className="text-slate-400 mt-1 text-sm">Ingresos totales registrados</p>
              <div className="mt-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-light" />
                <span className="text-slate-300 text-sm">{stats?.members ?? 0} atletas activos</span>
              </div>
            </div>
          ) : isTrainer ? (
            <div className="bg-gradient-to-br from-accent/20 to-slate-900 p-6 rounded-3xl border border-accent/20">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Perfil Coach</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">Gestión de Clases</h3>
              <p className="text-slate-500 mt-3 text-sm">Organiza tus sesiones y gestiona participantes.</p>
              <button onClick={() => window.location.href = '/classes'}
                className="bg-accent hover:bg-accent-light text-white w-full py-2.5 mt-5 text-sm rounded-xl font-bold transition-all">
                <Calendar className="w-4 h-4 inline mr-2" /> Administrar Clases
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-white/5">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Membresía Activa</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {stats?.reservations > 0 ? 'Plan Activo' : 'Sin Plan'}
              </h3>
              <p className="text-slate-500 mt-3 text-sm">
                {stats?.reservations > 0 ? `${stats.reservations} clases reservadas.` : 'Suscríbete para empezar.'}
              </p>
              <button onClick={() => window.location.href = '/memberships'}
                className="btn-primary w-full py-2.5 mt-5 text-sm">
                <CreditCard className="w-4 h-4 inline mr-2" />
                {stats?.reservations > 0 ? 'Gestionar Plan' : 'Ver Planes'}
              </button>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-white mb-3">Accesos Rápidos</h2>
            <div className="space-y-2">
              <QuickAction label="Ver Clases" icon={Calendar} to="/classes" desc="Reserva tu próxima sesión" />
              <QuickAction label="Explorar Tienda" icon={ShoppingBag} to="/marketplace" desc="Equipamiento deportivo" />
              <QuickAction label="Próximos Eventos" icon={Trophy} to="/events" desc="Torneos y masterclasses" />
              {!isOwner && !isTrainer && (
                <>
                  <QuickAction label="Mis Wearables" icon={Watch} to="/dashboard/wearables" desc="Sincroniza tu actividad" />
                  <QuickAction label="Mis Facturas" icon={Receipt} to="/dashboard/invoices" desc="Historial de pagos" />
                </>
              )}
              {isOwner && (
                <>
                  <QuickAction label="Analítica Avanzada" icon={BarChart} to="/dashboard/analytics" desc="KPIs y Rendimiento" />
                  <QuickAction label="Marketing y CRM" icon={Mail} to="/dashboard/crm" desc="Campañas de email" />
                  <QuickAction label="Mis Gimnasios" icon={Dumbbell} to="/gyms" desc="Administrar establecimientos" />
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* AI Recommendations */}
      <RecommendationsPanel />
    </div>
  );
};

export default Dashboard;

