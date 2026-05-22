import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api-client';
import {
  Users, Dumbbell, Calendar, TrendingUp, Clock, AlertCircle,
  ShoppingBag, Trophy, CreditCard, ArrowRight, Star, Activity,
  CheckCircle2, BarChart, Mail, Watch, Receipt, ShieldCheck,
  Building2, ChevronRight, Plus, Search, Edit3, Save, Trash2,
  Check, X, AlertTriangle, HelpCircle, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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

/* ─────────────────────────── Owner Dashboard (Dueño Premium) ─────────────────────────── */

interface GymOwnerProps {
  user: any;
}

const OwnerDashboard: React.FC<GymOwnerProps> = ({ user }) => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState<any[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'classes' | 'clients' | 'attendance' | 'crm'>('stats');

  // Inline client edits
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [dniInput, setDniInput] = useState<string>('');
  const [birthDateInput, setBirthDateInput] = useState<string>('');

  // Modals
  const [historyMember, setHistoryMember] = useState<any | null>(null);

  // CRM logs state
  const [crmLogs, setCrmLogs] = useState<Record<string, { reason: string; encouragement: string }>>({});
  const [attendanceLogs, setAttendanceLogs] = useState<Record<string, 'ATTENDED' | 'ABSENT' | 'PENDING'>>({});
  const [dniBirthLogs, setDniBirthLogs] = useState<Record<string, { dni: string; birthDate: string }>>({});

  // Active gym details
  const activeGym = gyms.find(g => g.id === selectedGymId);

  // Load gyms initially
  useEffect(() => {
    const loadGyms = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/gyms');
        const ownerGyms = data.filter((g: any) => g.ownerId === user.id);
        setGyms(ownerGyms);
        if (ownerGyms.length > 0) {
          setSelectedGymId(ownerGyms[0].id);
        }
      } catch (err) {
        console.error('Error al cargar gimnasios del dueño:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGyms();
  }, [user]);

  // Load gym specifics (members, classes, persistent logs) when selected gym changes
  useEffect(() => {
    if (!selectedGymId) return;

    const fetchGymData = async () => {
      try {
        setLoadingData(true);
        const membersRes = await api.get(`/gyms/${selectedGymId}/members`);
        const classesRes = await api.get(`/classes?gymId=${selectedGymId}`);
        setMembers(membersRes.data || []);
        setClasses(classesRes.data || []);

        // Load local storage states for this specific gym
        const storedCrm = localStorage.getItem(`owner_crm_${selectedGymId}`);
        const storedAttendance = localStorage.getItem(`owner_attendance_${selectedGymId}`);
        const storedDniBirth = localStorage.getItem(`owner_dni_birth_${selectedGymId}`);

        setCrmLogs(storedCrm ? JSON.parse(storedCrm) : {});
        setAttendanceLogs(storedAttendance ? JSON.parse(storedAttendance) : {});
        setDniBirthLogs(storedDniBirth ? JSON.parse(storedDniBirth) : {});
      } catch (err) {
        console.error('Error al obtener datos del gimnasio:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchGymData();
  }, [selectedGymId]);

  // Handle DNI/BirthDate inline save
  const handleSaveClientDetails = (memberId: string) => {
    if (!dniInput.trim()) {
      toast.error('El DNI no puede estar vacío.');
      return;
    }
    const updated = {
      ...dniBirthLogs,
      [memberId]: { dni: dniInput, birthDate: birthDateInput }
    };
    setDniBirthLogs(updated);
    localStorage.setItem(`owner_dni_birth_${selectedGymId}`, JSON.stringify(updated));
    setEditingMemberId(null);
    toast.success('✨ ¡Datos del cliente actualizados!');
  };

  // Toggle Attendance cells in matrix
  const toggleAttendanceCell = (memberId: string, classId: string) => {
    const key = `${memberId}_${classId}`;
    const current = attendanceLogs[key] || 'PENDING';
    let next: 'ATTENDED' | 'ABSENT' | 'PENDING' = 'PENDING';

    if (current === 'PENDING') next = 'ATTENDED';
    else if (current === 'ATTENDED') next = 'ABSENT';
    else next = 'PENDING';

    const updated = {
      ...attendanceLogs,
      [key]: next
    };
    setAttendanceLogs(updated);
    localStorage.setItem(`owner_attendance_${selectedGymId}`, JSON.stringify(updated));

    if (next === 'ATTENDED') {
      toast.success('✅ Asistencia: PRESENTE');
    } else if (next === 'ABSENT') {
      toast.error('❌ Asistencia: AUSENTE');
    } else {
      toast.info('⏳ Asistencia: PENDIENTE');
    }
  };

  // Save CRM health/churn note
  const handleSaveCrmRecord = (memberId: string, reason: string, encouragement: string) => {
    const updated = {
      ...crmLogs,
      [memberId]: { reason, encouragement }
    };
    setCrmLogs(updated);
    localStorage.setItem(`owner_crm_${selectedGymId}`, JSON.stringify(updated));
    toast.success('❤️ ¡Registro de CRM guardado con éxito!');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light" />
          <p className="text-slate-400 text-sm">Cargando gimnasios de dueño...</p>
        </div>
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className="glass-card p-12 text-center border-white/5 max-w-xl mx-auto my-12">
        <Building2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Aún no tienes locales creados</h2>
        <p className="text-slate-400 mt-2 text-sm">
          Como Dueño de Gimnasio, necesitas dar de alta tu primera academia o local para poder programar clases, registrar atletas y ver asistencias.
        </p>
        <button
          onClick={() => navigate('/gyms')}
          className="btn-primary mt-6 px-6 py-2.5 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Primer Local</span>
        </button>
      </div>
    );
  }

  // Stat Calculations for Stats Tab
  const totalAthletes = members.length;
  const totalClassesCount = classes.length;
  const classesAtLimit = classes.filter(c => (c.reservations?.length || 0) >= c.capacity).length;
  const remainingSlots = classes.reduce((acc, c) => acc + Math.max(0, c.capacity - (c.reservations?.length || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Selector de Gimnasio + Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-primary-light text-xs font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              Panel Administrativo Dueño
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Hola, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-xs mt-0.5">Control centralizado y geomarketing para tus locales.</p>
        </div>

        {/* Selector de Local */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-white/10 px-4 py-2 rounded-xl shrink-0">
          <Building2 className="w-5 h-5 text-primary-light" />
          <div className="text-left">
            <p className="text-slate-500 text-[9px] uppercase font-semibold">Seleccionar Sede</p>
            <select
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="bg-transparent text-white font-bold text-sm outline-none border-none cursor-pointer pr-4"
            >
              {gyms.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white font-medium">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeGym && (
        <div className="flex items-center gap-2 px-2 text-slate-400 text-xs">
          <span className="text-primary-light">📍 Sede Central:</span>
          <span>{activeGym.address || 'Hercix Suite Principal'}</span>
          <span>• Teléfono: {activeGym.phone || 'N/D'}</span>
        </div>
      )}

      {/* Tabs Administrativas */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-px no-scrollbar">
        {[
          { id: 'stats', label: '📊 Resumen de Negocio' },
          { id: 'classes', label: '🏋️ Ocupación y Clases' },
          { id: 'clients', label: '👥 Clientes y Membresías' },
          { id: 'attendance', label: '📅 Asistencia Semanal' },
          { id: 'crm', label: '❤️ CRM Churn & Salud' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold tracking-wide whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-light text-primary-light bg-primary/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            <p className="text-slate-400 text-xs">Sincronizando datos de local...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ────────────────── TABA 1: RESUMEN DE NEGOCIO ────────────────── */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Atletas en Local" value={totalAthletes} icon={Users} color="primary" trend="Socio Activo" />
                <StatCard label="Clases Programadas" value={totalClassesCount} icon={Calendar} color="secondary" />
                <StatCard label="Clases en Límite Max" value={classesAtLimit} icon={AlertCircle} color="red" trend={classesAtLimit > 0 ? "⚠️ Acción" : "Normal"} />
                <StatCard label="Cupos Disponibles" value={remainingSlots} icon={TrendingUp} color="green" trend="Total Libres" />
              </div>

              {/* Alertas de Ocupación Crítica */}
              <div className="glass-card p-6 border-white/5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <h3 className="text-white font-bold text-sm">Alertas de Ocupación Crítica</h3>
                </div>
                {classes.filter(c => (c.reservations?.length || 0) >= c.capacity).length > 0 ? (
                  <div className="space-y-3">
                    {classes.filter(c => (c.reservations?.length || 0) >= c.capacity).map(c => (
                      <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                        <div>
                          <p className="text-white font-semibold text-xs">{c.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">
                            Horario: {new Date(c.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} • Instructor: {c.trainer?.user?.name || 'Por asignar'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-1 rounded">
                            LÍMITE ALCANZADO ({c.capacity}/{c.capacity})
                          </span>
                          <button
                            onClick={() => navigate('/classes')}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded text-[10px] font-bold transition-all"
                          >
                            Abrir otro horario
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    ✅ Todas tus clases programadas cuentan con cupos disponibles para reservas. No hay sobreventa detectada.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── TABA 2: CLASES Y OCUPACIÓN ────────────────── */}
          {activeTab === 'classes' && (
            <div className="glass-card p-6 border-white/5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Monitoreo de Aforo por Clase</h3>
                <button
                  onClick={() => navigate('/classes')}
                  className="bg-primary/20 text-primary-light border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Clase
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No hay clases programadas para esta sede. ¡Crea una clase para empezar a registrar atletas!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((c) => {
                    const enrolled = c.reservations?.length || 0;
                    const percent = Math.min(100, Math.round((enrolled / c.capacity) * 100));
                    const isFull = enrolled >= c.capacity;

                    return (
                      <div key={c.id} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-bold text-xs">{c.title}</h4>
                            <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(c.scheduledAt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(c.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 ${
                            isFull ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          }`}>
                            {isFull ? '⚠️ Lleno' : 'Disponible'}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="text-slate-500">Aforo ocupado</span>
                            <span className={`font-bold ${isFull ? 'text-red-400' : 'text-slate-300'}`}>
                              {enrolled} / {c.capacity} atletas ({percent}%)
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-primary-light'}`}
                            />
                          </div>
                          <p className="text-slate-500 text-[9px] mt-1 text-right italic">
                            {isFull ? 'Capacidad máxima alcanzada' : `Faltan ${c.capacity - enrolled} atletas para llenar`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ────────────────── TABA 3: CLIENTES Y MEMBRESÍAS ────────────────── */}
          {activeTab === 'clients' && (
            <div className="glass-card p-6 border-white/5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-white font-bold text-sm">Fichas de Clientes Registrados</h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">Gestione el DNI, Fecha de Nacimiento e Historial de membresías.</p>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No hay atletas registrados con membresías en esta sede aún.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 px-2 font-bold uppercase tracking-wider">Nombre Completo</th>
                        <th className="py-3 px-2 font-bold uppercase tracking-wider">DNI (Editable)</th>
                        <th className="py-3 px-2 font-bold uppercase tracking-wider">Nacimiento (Editable)</th>
                        <th className="py-3 px-2 font-bold uppercase tracking-wider">Teléfono</th>
                        <th className="py-3 px-2 font-bold uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {members.map((m) => {
                        const savedDniBirth = dniBirthLogs[m.id] || { dni: m.dni || '47658932', birthDate: '1996-08-15' };
                        const isEditing = editingMemberId === m.id;

                        // Mocked rich membership history log for details popup
                        const historyMock = [
                          { plan: 'Membresía VIP Anual', bought: '2026-01-10', expires: '2027-01-10', price: '$499', status: 'Activa' },
                          { plan: 'Pase Semanal Crossfit', bought: '2025-11-05', expires: '2025-11-12', price: '$35', status: 'Expirada' }
                        ];

                        return (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-light border border-primary/30 flex items-center justify-center font-bold">
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-bold">{m.name}</p>
                                  <p className="text-slate-500 text-[10px]">{m.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={dniInput}
                                  onChange={(e) => setDniInput(e.target.value)}
                                  className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white text-xs w-28 outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-slate-200">{savedDniBirth.dni}</span>
                              )}
                            </td>

                            <td className="py-4 px-2">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={birthDateInput}
                                  onChange={(e) => setBirthDateInput(e.target.value)}
                                  className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white text-xs w-36 outline-none"
                                />
                              ) : (
                                <span className="text-slate-400">
                                  {new Date(savedDniBirth.birthDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-2 text-slate-400">
                              {m.phone || 'No registrado'}
                            </td>

                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveClientDetails(m.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-all"
                                      title="Guardar"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingMemberId(null)}
                                      className="bg-white/10 hover:bg-white/20 text-slate-300 p-1 rounded transition-all"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingMemberId(m.id);
                                      setDniInput(savedDniBirth.dni);
                                      setBirthDateInput(savedDniBirth.birthDate);
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-slate-300 p-1.5 rounded transition-all"
                                    title="Editar datos"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setHistoryMember({ ...m, history: historyMock })}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary-light px-2.5 py-1.5 rounded text-[10px] font-bold border border-primary/20 transition-all"
                                >
                                  Historial Membresía
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── TABA 4: ASISTENCIA SEMANAL (LUNES A DOMINGO) ────────────────── */}
          {activeTab === 'attendance' && (
            <div className="glass-card p-6 border-white/5 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-white font-bold text-sm">Registro de Asistencia Integrado</h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">Control interactivo de Lunes a Domingo. Haz clic en las celdas para alternar estado.</p>
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-3 text-[10px] bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="flex items-center gap-1 text-green-400 font-bold"><CheckCircle2 className="w-3 h-3" /> Asistió</span>
                  <span className="flex items-center gap-1 text-red-400 font-bold"><X className="w-3 h-3" /> Faltó</span>
                  <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> Pendiente</span>
                </div>
              </div>

              {members.length === 0 || classes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  Para registrar asistencias, asegúrate de tener tanto clases programadas como clientes registrados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 px-3 font-bold uppercase tracking-wider">Atleta</th>
                        {classes.map(c => (
                          <th key={c.id} className="py-3 px-3 font-bold text-center min-w-32">
                            <p className="text-white font-bold">{c.title}</p>
                            <p className="text-slate-500 text-[9px] font-normal lowercase mt-0.5">
                              {new Date(c.scheduledAt).toLocaleDateString('es-CO', { weekday: 'short' })} • {new Date(c.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-3 font-bold text-white whitespace-nowrap">
                            {m.name}
                          </td>
                          {classes.map((c) => {
                            const key = `${m.id}_${c.id}`;
                            const status = attendanceLogs[key] || 'PENDING';

                            return (
                              <td key={c.id} className="py-4 px-3 text-center">
                                <button
                                  onClick={() => toggleAttendanceCell(m.id, c.id)}
                                  className={`w-full py-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                    status === 'ATTENDED'
                                      ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                      : status === 'ABSENT'
                                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                      : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                                  }`}
                                >
                                  {status === 'ATTENDED' ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                                      <span className="text-[9px] font-bold">Asistió</span>
                                    </>
                                  ) : status === 'ABSENT' ? (
                                    <>
                                      <X className="w-4 h-4 text-red-400" />
                                      <span className="text-[9px] font-bold">Faltó</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4 text-slate-600" />
                                      <span className="text-[9px]">Pendiente</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── TABA 5: CRM CHURN Y SALUD ────────────────── */}
          {activeTab === 'crm' && (
            <div className="glass-card p-6 border-white/5 space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-white font-bold text-sm">Panel de CRM, Deserción y Salud</h3>
                <p className="text-slate-500 text-[10px] mt-0.5">Registre motivos de abandono (ej. *fracturas*, *mudanzas*) y envíe palabras de aliento.</p>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No hay atletas registrados para administrar en el CRM aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Listado de atletas con su estado actual */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Listado de Miembros</p>
                    {members.map((m) => {
                      const log = crmLogs[m.id] || { reason: '', encouragement: '' };
                      const isInjured = log.reason.toLowerCase().includes('fractura') || log.reason.toLowerCase().includes('lesion') || log.reason.toLowerCase().includes('salud');
                      const isMoved = log.reason.toLowerCase().includes('mudanza') || log.reason.toLowerCase().includes('viaje') || log.reason.toLowerCase().includes('arequipa');

                      return (
                        <div key={m.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-3 ${
                          log.reason ? 'bg-slate-900 border-white/10' : 'bg-slate-950/40 border-white/5'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-xs">{m.name}</span>
                              {log.reason && (
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  isInjured ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                  isMoved ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                  'bg-slate-800 text-slate-300 border border-white/5'
                                }`}>
                                  {isInjured ? '🤕 Salud / Lesión' : isMoved ? '✈️ Mudanza / Viaje' : '⏳ Inactivo'}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-[10px]">{m.email}</p>
                            {log.reason && (
                              <div className="mt-2 bg-slate-950 p-2 rounded-lg border border-white/5 space-y-1">
                                <p className="text-white text-[10px] font-semibold"><span className="text-slate-500 font-normal">Motivo:</span> {log.reason}</p>
                                <p className="text-primary-light text-[10px] italic"><span className="text-slate-500 font-normal not-italic">Mensaje de aliento:</span> "{log.encouragement}"</p>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 self-end md:self-start">
                            <button
                              onClick={() => {
                                // Simple interactive prompt to edit CRM Note
                                const r = prompt('Motivo por el que dejó de venir (ej: Fractura de hombro, Mudanza a Arequipa):', log.reason);
                                if (r === null) return;
                                const e = prompt('Mensaje de aliento personalizado:', log.encouragement || `¡Mucho ánimo, te extrañamos en ${activeGym?.name}!`);
                                if (e === null) return;
                                handleSaveCrmRecord(m.id, r, e);
                              }}
                              className="bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30 px-2.5 py-1.5 rounded text-[10px] font-bold transition-all"
                            >
                              {log.reason ? 'Editar CRM' : 'Registrar Inactividad'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Panel de ayuda y recomendaciones CRM */}
                  <div className="bg-gradient-to-br from-primary/10 via-slate-900 to-slate-950 p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-light shrink-0" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider">Asistente Inteligente CRM</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      El CRM de Hercix te permite retener deportistas e interactuar activamente con ellos de acuerdo a sus novedades. Al registrar inactividades por lesiones de salud o viajes, el sistema mantendrá archivados los motivos y te recordará mostrar empatía comercial.
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-[11px]">
                      <p className="text-white font-bold flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-red-400" /> Plantilla de Salud (Ejemplo Fractura)</p>
                      <p className="text-slate-400 leading-normal">
                        "¡Te extrañamos en el box! Recupérate con calma de tu fractura de hombro. La salud es primero, cuando vuelvas adaptaremos las rutinas para ti."
                      </p>
                      <div className="border-t border-white/5 my-2 pt-2" />
                      <p className="text-white font-bold flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-orange-400" /> Plantilla de Mudanza (Ejemplo Arequipa)</p>
                      <p className="text-slate-400 leading-normal">
                        "Sabemos que te mudaste a Arequipa por proyectos. Recuerda que con tu membresía VIP tienes acceso a nuestras filiales virtuales ilimitadas."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Historial de Membresías */}
      {historyMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setHistoryMember(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/15 border-b border-white/10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary-light" />
                <div>
                  <h3 className="text-white font-bold text-sm">Historial de Membresías</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Cliente: {historyMember.name}</p>
                </div>
              </div>
              <button onClick={() => setHistoryMember(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {historyMember.history.map((h: any, i: number) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-bold text-xs">{h.plan}</p>
                      <p className="text-slate-500 text-[10px] mt-1">
                        Compra: {new Date(h.bought).toLocaleDateString('es-CO')} • Expiración: {new Date(h.expires).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xs">{h.price}</p>
                      <span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded mt-1.5 ${
                        h.status === 'Activa' ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse' : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-4 bg-slate-950 flex justify-end">
              <button
                onClick={() => setHistoryMember(null)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/stats').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
    if (user?.role === 'USER') {
      api.get('/memberships/me').then(({ data }) => setMemberships(data)).catch(console.error);
    }
  }, [user]);

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

  // ── Dueño tiene su propio layout premium con aislamiento estricto ───────
  if (isOwner) {
    return (
      <div className="animate-in fade-in duration-700">
        <OwnerDashboard user={user} />
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

