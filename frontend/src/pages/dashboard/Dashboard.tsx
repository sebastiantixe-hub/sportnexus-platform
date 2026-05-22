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
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Owner Suite de Control states ──
  const [activeView, setActiveView] = useState<'dashboard' | 'suite'>('dashboard');
  const [suiteTab, setSuiteTab] = useState<'clients' | 'classes' | 'crm'>('clients');
  const [ownerClasses, setOwnerClasses] = useState<any[]>([]);
  
  // Custom Modals states
  const [activeModal, setActiveModal] = useState<'history' | 'edit' | 'message' | 'register' | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editedDni, setEditedDni] = useState('');
  const [editedBirthDate, setEditedBirthDate] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedHealthStatus, setEditedHealthStatus] = useState('HEALTHY');
  const [editedHealthDetails, setEditedHealthDetails] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const [clients, setClients] = useState<any[]>(() => {
    const saved = localStorage.getItem(`hercix_owner_crm_${user?.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'c1',
        name: 'Roberto "Tito" Valenzuela',
        dni: '45879612',
        birthDate: '1996-09-18',
        healthStatus: 'HEALTHY',
        healthDetails: 'Excelente salud, entrenando a tope 💪',
        history: [
          { planName: 'Plan Pro Mensual', price: 45, dateCompra: '2026-01-01', dateFin: '2026-02-01', status: 'ACTIVE' },
          { planName: 'Plan Trimestral', price: 110, dateCompra: '2026-02-02', dateFin: '2026-05-02', status: 'ACTIVE' }
        ]
      },
      {
        id: 'c2',
        name: 'Carlos Eduardo Ruiz',
        dni: '70412589',
        birthDate: '1990-05-04',
        healthStatus: 'INJURED',
        healthDetails: 'Fractura de rodilla en partido local 🩹',
        history: [
          { planName: 'Plan Básico Mensual', price: 30, dateCompra: '2025-11-10', dateFin: '2025-12-10', status: 'EXPIRED' }
        ]
      },
      {
        id: 'c3',
        name: 'Sofía Milagros Arequipa',
        dni: '33458912',
        birthDate: '1998-11-23',
        healthStatus: 'CHURNED',
        healthDetails: 'Mudanza a Arequipa por motivos laborales ✈️',
        history: [
          { planName: 'Plan Premium Semestral', price: 200, dateCompra: '2025-07-15', dateFin: '2026-01-15', status: 'EXPIRED' }
        ]
      }
    ];
  });

  const isOwner = user?.role === 'GYM_OWNER';
  const isTrainer = user?.role === 'TRAINER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    api.get('/auth/stats').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
    if (user?.role === 'USER') {
      api.get('/memberships/me').then(({ data }) => setMemberships(data)).catch(console.error);
    }
    if (isOwner) {
      api.get('/classes').then(({ data }) => {
        const filtered = data.filter((c: any) => c.gym?.ownerId === user?.id);
        setOwnerClasses(filtered);
      }).catch(console.error);
    }
  }, [user]);

  // Sync with persistent local storage
  useEffect(() => {
    if (user?.id && clients.length > 0) {
      localStorage.setItem(`hercix_owner_crm_${user.id}`, JSON.stringify(clients));
    }
  }, [clients, user]);

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

  // ── Layout de la Suite de Control Premium (Dueño) ──
  if (isOwner && activeView === 'suite') {
    const totalAthletes = clients.length;
    const classesReachedLimit = ownerClasses.filter((c: any) => (c.reservationsCount || 0) >= c.capacity).length;
    const totalSpotsMissing = ownerClasses.reduce((acc: number, c: any) => acc + Math.max(0, c.capacity - (c.reservationsCount || 0)), 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Suite de Control Premium ✨</h1>
            <p className="text-slate-400 mt-1">Herramientas de retención de atletas y ocupación de tu negocio.</p>
          </div>
          
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 w-fit gap-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5"
            >
              📊 Resumen de Negocio
            </button>
            <button
              onClick={() => setActiveView('suite')}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-primary text-white shadow-lg"
            >
              ✨ Suite de Control
            </button>
          </div>
        </div>

        {/* KPIs de la Suite recomendados por el Gerente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">👥 Total Atletas Registrados</p>
            <p className="text-3xl font-black text-white">{totalAthletes}</p>
            <p className="text-[10px] text-slate-500 mt-2">Atletas registrados en tu academia</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-900/20 to-slate-900 border border-red-500/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">🚨 Clases al Límite de Alumnos</p>
            <p className="text-3xl font-black text-white">{classesReachedLimit}</p>
            <p className="text-[10px] text-slate-500 mt-2">Clases que completaron su aforo (100% llenas)</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">⏳ Alumnos faltantes para llenar</p>
            <p className="text-3xl font-black text-white">{totalSpotsMissing}</p>
            <p className="text-[10px] text-slate-500 mt-2">Cupos por llenar across all classes</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 gap-6">
          <button 
            onClick={() => setSuiteTab('clients')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${suiteTab === 'clients' ? 'border-primary-light text-primary-light' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            👥 Listado de Clientes
          </button>
          <button 
            onClick={() => setSuiteTab('classes')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${suiteTab === 'classes' ? 'border-primary-light text-primary-light' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            📅 Ocupación de Clases
          </button>
          <button 
            onClick={() => setSuiteTab('crm')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${suiteTab === 'crm' ? 'border-primary-light text-primary-light' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            🧠 CRM Churn y Alientos
          </button>
        </div>

        {/* Tab 1: Clients List */}
        {suiteTab === 'clients' && (
          <div className="glass-card overflow-hidden border-white/5 animate-in fade-in duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white">Base de Datos de Atletas</h3>
              <button 
                onClick={() => {
                  setEditedName('');
                  setEditedDni('');
                  setEditedBirthDate('');
                  setEditedHealthStatus('HEALTHY');
                  setEditedHealthDetails('Excelente salud, entrenando a tope 💪');
                  setActiveModal('register');
                }}
                className="bg-primary/20 text-primary-light border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all"
              >
                + Registrar Atleta
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6">Nombre Atleta</th>
                    <th className="p-4">DNI</th>
                    <th className="p-4">Fecha Nac.</th>
                    <th className="p-4">Estado de Salud</th>
                    <th className="p-4">Membresías</th>
                    <th className="p-4 text-right pr-6">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center font-bold text-primary-light">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">{c.dni}</td>
                      <td className="p-4">{new Date(c.birthDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.healthStatus === 'HEALTHY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          c.healthStatus === 'INJURED' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {c.healthDetails}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            setSelectedClient(c);
                            setActiveModal('history');
                          }}
                          className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-indigo-500/20"
                        >
                          Ver historial ({c.history.length})
                        </button>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => {
                            setSelectedClient(c);
                            setEditedName(c.name);
                            setEditedDni(c.dni);
                            setEditedBirthDate(c.birthDate);
                            setEditedHealthStatus(c.healthStatus);
                            setEditedHealthDetails(c.healthDetails);
                            setActiveModal('edit');
                          }}
                          className="text-slate-400 hover:text-white text-xs font-bold underline"
                        >
                          Editar Datos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Ocupación de Clases */}
        {suiteTab === 'classes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {ownerClasses.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500">No hay clases activas en tus gimnasios para analizar.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerClasses.map((c: any) => {
                  const fillPercentage = Math.min(100, Math.round(((c.reservationsCount || 0) / c.capacity) * 100));
                  const isFull = (c.reservationsCount || 0) >= c.capacity;
                  return (
                    <div key={c.id} className="glass-card p-6 border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-wider">{c.gym?.name}</span>
                          <h4 className="text-lg font-bold text-white mt-1.5">{c.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFull ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary/20 text-primary-light border border-primary/30'
                        }`}>
                          {isFull ? 'Límite alcanzado 🚨' : `${c.capacity - (c.reservationsCount || 0)} cupos libres`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>⏰ {new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📅 {new Date(c.scheduledAt).toLocaleDateString()}</span>
                        <span>⏳ {c.durationMin} min</span>
                      </div>

                      {/* Bar fill */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                          <span>Aforo completo</span>
                          <span>{fillPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            style={{ width: `${fillPercentage}%` }} 
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Reservados: {c.reservationsCount || 0} de {c.capacity} atletas</span>
                        <a href="/classes" className="text-primary-light font-bold hover:underline">Ver Asistencia →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: CRM Churn y Alientos */}
        {suiteTab === 'crm' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {clients.filter(c => c.healthStatus !== 'HEALTHY').map(c => {
              const isInjured = c.healthStatus === 'INJURED';
              
              const mensajeAliento = isInjured 
                ? `¡Hola ${c.name.split(' ')[0]}! Espero que tu recuperación de la fractura vaya excelente. Todo el equipo de la academia te envía un abrazo muy fuerte de aliento. ¡Te extrañamos mucho y te esperamos de vuelta cuando estés listo! 💪⚽`
                : `¡Hola ${c.name.split(' ')[0]}! Esperamos que todo esté marchando de maravilla en la bella ciudad de Arequipa. Te extrañamos un montón en los entrenamientos. ¡Mucho éxito en tus nuevos proyectos y a seguir dándole con toda! ✈️🌟`;

              return (
                <div key={c.id} className="glass-card p-6 border border-white/5 bg-slate-900/50 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${isInjured ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isInjured ? '🩹' : '✈️'}
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-white">{c.name}</h4>
                          <p className="text-xs text-slate-500">DNI: {c.dni}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isInjured ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {isInjured ? 'Lesión / Fractura' : 'Mudanza / Arequipa'}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">📝 Motivo de inactividad</p>
                      <p className="text-xs text-slate-300 italic">"{c.healthDetails}"</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">💝 Mensaje de Aliento Sugerido</p>
                      <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/10 text-xs text-indigo-300 leading-relaxed">
                        {mensajeAliento}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedClient(c);
                        setEditedName(c.name);
                        setEditedDni(c.dni);
                        setEditedBirthDate(c.birthDate);
                        setEditedHealthStatus(c.healthStatus);
                        setEditedHealthDetails(c.healthDetails);
                        setActiveModal('edit');
                      }}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      ✏️ Editar Estado
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedClient(c);
                        setCustomMessage(mensajeAliento);
                        setActiveModal('message');
                      }}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>💌 Enviar Mensaje</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── GORGEOUS CUSTOM REACT MODALS OVERLAYS (NO CHEAP BROWSER NATIVE POPUPS!) ── */}

        {/* 1. History Modal */}
        {activeModal === 'history' && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-[10px] font-mono">Historial Premium</span>
                  <h3 className="text-xl font-bold text-white mt-1">Membresías de {selectedClient.name}</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedClient.history.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">Este atleta no tiene membresías registradas aún.</p>
                ) : (
                  selectedClient.history.map((h: any, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{h.planName}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          📅 {new Date(h.dateCompra).toLocaleDateString('es-ES')} al {new Date(h.dateFin).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold text-sm">${h.price.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-1.5 ${
                          h.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {h.status === 'ACTIVE' ? 'Activo' : 'Expirado'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-all shadow-lg"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Edit Modal */}
        {activeModal === 'edit' && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-gradient-to-b from-slate-900 to-slate-955 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-primary-light uppercase tracking-widest text-[10px] font-mono">Editar Ficha</span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedClient.name}</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editedName} 
                    onChange={(e) => setEditedName(e.target.value)} 
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DNI / Documento</label>
                    <input 
                      type="text" 
                      value={editedDni} 
                      onChange={(e) => setEditedDni(e.target.value)} 
                      className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Fecha Nacimiento</label>
                    <input 
                      type="date" 
                      value={editedBirthDate} 
                      onChange={(e) => setEditedBirthDate(e.target.value)} 
                      className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Estado de Salud</label>
                  <select 
                    value={editedHealthStatus} 
                    onChange={(e) => setEditedHealthStatus(e.target.value)} 
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-light outline-none"
                  >
                    <option value="HEALTHY">Excelente Salud 💪</option>
                    <option value="INJURED">Lesión / Fractura 🩹</option>
                    <option value="CHURNED">Mudanza / Retirado ✈️</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Detalles / Motivo Churn</label>
                  <textarea 
                    value={editedHealthDetails} 
                    onChange={(e) => setEditedHealthDetails(e.target.value)} 
                    rows={3}
                    placeholder="ej. Se fracturó el tobillo, se fue a vivir a Arequipa por trabajo..."
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-primary-light outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="flex-grow py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setClients(prev => prev.map(c => c.id === selectedClient.id ? {
                      ...c,
                      name: editedName,
                      dni: editedDni,
                      birthDate: editedBirthDate,
                      healthStatus: editedHealthStatus,
                      healthDetails: editedHealthDetails
                    } : c));
                    setActiveModal(null);
                  }} 
                  className="flex-grow py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-bold transition-all shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Register Modal */}
        {activeModal === 'register' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest text-[10px] font-mono">Nuevo Ingreso</span>
                  <h3 className="text-xl font-bold text-white mt-1">Registrar Atleta</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="ej. Juan Pérez"
                    value={editedName} 
                    onChange={(e) => setEditedName(e.target.value)} 
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DNI / Documento</label>
                    <input 
                      type="text" 
                      placeholder="70412589"
                      value={editedDni} 
                      onChange={(e) => setEditedDni(e.target.value)} 
                      className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Fecha Nacimiento</label>
                    <input 
                      type="date" 
                      value={editedBirthDate} 
                      onChange={(e) => setEditedBirthDate(e.target.value)} 
                      className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary-light outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Estado de Salud</label>
                  <select 
                    value={editedHealthStatus} 
                    onChange={(e) => setEditedHealthStatus(e.target.value)} 
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-light outline-none"
                  >
                    <option value="HEALTHY">Excelente Salud 💪</option>
                    <option value="INJURED">Lesión / Fractura 🩹</option>
                    <option value="CHURNED">Mudanza / Retirado ✈️</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Detalles del Estado</label>
                  <textarea 
                    value={editedHealthDetails} 
                    onChange={(e) => setEditedHealthDetails(e.target.value)} 
                    rows={2}
                    placeholder="Excelente salud, entrenando a tope 💪"
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-primary-light outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="flex-grow py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (!editedName) {
                      alert("Por favor ingresa un nombre");
                      return;
                    }
                    setClients(prev => [...prev, {
                      id: Math.random().toString(),
                      name: editedName,
                      dni: editedDni || 'N/A',
                      birthDate: editedBirthDate || 'N/A',
                      healthStatus: editedHealthStatus,
                      healthDetails: editedHealthDetails || 'Excelente salud 💪',
                      history: []
                    }]);
                    setActiveModal(null);
                  }} 
                  className="flex-grow py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg"
                >
                  Registrar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. Send Message Modal */}
        {activeModal === 'message' && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-gradient-to-b from-slate-900 to-slate-955 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-[10px] font-mono">Canal de Retención</span>
                  <h3 className="text-xl font-bold text-white mt-1">Enviar Aliento a {selectedClient.name}</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Motivo Guardado</p>
                  <p className="text-xs text-slate-300 italic">"{selectedClient.healthDetails}"</p>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Mensaje Personalizado</label>
                  <textarea 
                    value={customMessage} 
                    onChange={(e) => setCustomMessage(e.target.value)} 
                    rows={5}
                    className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-4 text-xs text-indigo-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="flex-grow py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    const encodedText = encodeURIComponent(customMessage);
                    const wsUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
                    window.open(wsUrl, '_blank');
                    setActiveModal(null);
                  }} 
                  className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>💬 Enviar Mensaje</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ── Layout para GYM_OWNER, TRAINER y USER (Dashboard Resumen Original) ──
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
        
        <div className="flex items-center gap-4">
          {isOwner && (
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 w-fit gap-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-primary text-white shadow-lg"
              >
                📊 Resumen de Negocio
              </button>
              <button
                onClick={() => setActiveView('suite')}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5"
              >
                ✨ Suite de Control
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-primary-light' : 'bg-green-400'} animate-pulse`} />
            <span className="text-slate-300 text-sm font-medium capitalize">
              {user?.role.toLowerCase().replace('_', ' ')}
            </span>
          </div>
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
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-white/5 space-y-4">
              <div>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Membresía & Locales</span>
                {memberships.length > 0 ? (
                  <div className="space-y-4 mt-3">
                    {memberships.map((m: any) => (
                      <div key={m.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <h4 className="text-white font-bold text-sm">{m.plan.name}</h4>
                        <p className="text-primary-light text-xs font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" /> {m.plan.gym?.name || 'Gimnasio Hercix'}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Vence: {new Date(m.expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <h3 className="text-xl font-bold text-white">Sin Membresía</h3>
                    <p className="text-slate-500 text-xs mt-1">Suscríbete a un plan para empezar a entrenar.</p>
                  </div>
                )}
              </div>
              <button onClick={() => window.location.href = '/memberships'}
                className="btn-primary w-full py-2.5 mt-3 text-sm flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>{memberships.length > 0 ? 'Ver Más Planes' : 'Adquirir Plan'}</span>
              </button>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-white mb-3">Accesos Rápidos</h2>
            <div className="space-y-2">
              <QuickAction label="Ver Clases" icon={Calendar} to="/classes" desc="Reserva tu próxima sesión" />
              <QuickAction label="Explorar Tienda" icon={ShoppingBag} to={isOwner || isTrainer ? '/sport-store' : '/marketplace'} desc="Equipamiento deportivo" />
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

