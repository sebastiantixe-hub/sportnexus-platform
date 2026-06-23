import React, { useState, useEffect } from 'react';
import {
  Users, Search, MessageSquare, Send, Flame,
  Footprints, Scale, ChevronRight, Activity,
  CheckCircle2, XCircle, Droplets, Clock,
  TrendingUp, Award
} from 'lucide-react';
import api from '../../api/api-client';
import { toast } from 'sonner';

interface Athlete {
  id: string;
  name: string;
  email: string;
  weight: number;
  avatarUrl?: string;
  totalCaloriesBurned: number;
  averageSteps: number;
  lastObservation: string;
  trainedToday: boolean;
  todaySteps: number;
  todayCalories: number;
  todayWater: number;
  lastActivityDate: string | null;
}

const CoachHealthView: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [observation, setObservation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'recs'>('today');

  const [athleteMetrics, setAthleteMetrics] = useState<any[]>([]);
  const [athleteGoal, setAthleteGoal] = useState<any>(null);
  const [athleteRecs, setAthleteRecs] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => { fetchAthletes(); }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/coach/athletes');
      setAthletes(data);
      if (data.length > 0) {
        setSelectedAthlete(data[0]);
        fetchAthleteDetails(data[0].id);
      }
    } catch (err) {
      toast.error('Error al cargar atletas del gimnasio');
    } finally {
      setLoading(false);
    }
  };

  const fetchAthleteDetails = async (athleteId: string) => {
    try {
      setLoadingDetails(true);
      const [metricsRes, goalRes, recsRes] = await Promise.all([
        api.get(`/health/metrics/${athleteId}`),
        api.get(`/health/goals/${athleteId}`),
        api.get(`/health/recommendations/${athleteId}`),
      ]);
      setAthleteMetrics(metricsRes.data);
      setAthleteGoal(goalRes.data);
      setAthleteRecs(recsRes.data);
    } catch (err) {
      setAthleteMetrics([]); setAthleteGoal(null); setAthleteRecs([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectAthlete = (ath: Athlete) => {
    setSelectedAthlete(ath);
    setActiveTab('today');
    setFilterType('ALL');
    fetchAthleteDetails(ath.id);
  };

  const handleSubmitRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !observation.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/health/recommendations', {
        athleteId: selectedAthlete.id,
        observation: observation.trim()
      });
      toast.success('✅ Recomendación enviada al atleta');
      const updated = athletes.map(a =>
        a.id === selectedAthlete.id ? { ...a, lastObservation: observation.trim() } : a
      );
      setAthletes(updated);
      setSelectedAthlete(prev => prev ? { ...prev, lastObservation: observation.trim() } : null);
      setAthleteRecs(prev => [{ observation: observation.trim(), createdAt: new Date().toISOString(), coach: { name: 'Tú' } }, ...prev]);
      setObservation('');
    } catch {
      toast.error('Error al enviar recomendación');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const activeToday = athletes.filter(a => a.trainedToday).length;
  const inactiveToday = athletes.length - activeToday;
  const filteredAthletes = athletes.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMetrics = athleteMetrics.filter(m => filterType === 'ALL' || m.type === filterType);

  const goal = athleteGoal || { targetSteps: 10000, targetCalories: 600, targetWater: 8 };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
          <Award className="text-primary w-8 h-8" />
          Panel de Supervisión — Coach
        </h1>
        <p className="text-slate-400 mt-1">Monitorea la actividad diaria de tus atletas y deja recomendaciones en tiempo real.</p>
      </div>

      {/* KPIs resumen del gym */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><CheckCircle2 className="text-emerald-400 w-6 h-6" /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Activos Hoy</p>
            <p className="text-2xl font-bold text-emerald-400">{activeToday}</p>
            <p className="text-slate-500 text-xs">de {athletes.length} atletas</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-xl"><XCircle className="text-slate-500 w-6 h-6" /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sin Actividad Hoy</p>
            <p className="text-2xl font-bold text-slate-400">{inactiveToday}</p>
            <p className="text-slate-500 text-xs">necesitan motivación</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl"><TrendingUp className="text-primary w-6 h-6" /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Participación</p>
            <p className="text-2xl font-bold text-white">
              {athletes.length > 0 ? Math.round((activeToday / athletes.length) * 100) : 0}%
            </p>
            <p className="text-slate-500 text-xs">tasa de actividad hoy</p>
          </div>
        </div>
      </div>

      {/* Layout principal: Sidebar atletas + Panel detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Sidebar: Lista de Atletas ── */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 flex flex-col" style={{ maxHeight: '680px' }}>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Atletas de tu Gimnasio
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar atleta..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredAthletes.length === 0 && (
              <p className="text-slate-500 text-xs italic text-center mt-8">No se encontraron atletas.</p>
            )}
            {filteredAthletes.map((ath) => (
              <button
                key={ath.id}
                onClick={() => handleSelectAthlete(ath)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left ${
                  selectedAthlete?.id === ath.id
                    ? 'bg-primary/15 border border-primary/30'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                {/* Avatar */}
                {ath.avatarUrl ? (
                  <img src={ath.avatarUrl} className="w-10 h-10 rounded-full object-cover shrink-0" alt={ath.name} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white uppercase shrink-0">
                    {ath.name[0]}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-sm text-white truncate">{ath.name}</p>
                    {/* Badge "Activo Hoy" */}
                    {ath.trainedToday ? (
                      <span className="shrink-0 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                        HOY
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-700/60 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        INACTIVO
                      </span>
                    )}
                  </div>
                  {/* Mini-stats de hoy */}
                  {ath.trainedToday ? (
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <Footprints className="w-3 h-3" /> {ath.todaySteps.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-orange-400">
                        <Flame className="w-3 h-3" /> {ath.todayCalories} kcal
                      </span>
                      <span className="flex items-center gap-0.5 text-cyan-400">
                        <Droplets className="w-3 h-3" /> {ath.todayWater}v
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-[10px] mt-0.5 truncate">{ath.email}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Panel Principal: Detalle del Atleta ── */}
        <div className="lg:col-span-2 space-y-5">
          {selectedAthlete ? (
            <>
              {/* Perfil cabecera */}
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {selectedAthlete.avatarUrl ? (
                      <img src={selectedAthlete.avatarUrl} className="w-14 h-14 rounded-full object-cover" alt={selectedAthlete.name} />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-2xl text-white uppercase">
                        {selectedAthlete.name[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{selectedAthlete.name}</h2>
                      <p className="text-slate-500 text-sm">{selectedAthlete.email}</p>
                    </div>
                  </div>
                  {selectedAthlete.trainedToday ? (
                    <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-400 font-bold px-4 py-2 rounded-full text-xs border border-emerald-500/25">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Entrenó Hoy ✅
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-700/40 text-slate-500 font-bold px-4 py-2 rounded-full text-xs border border-white/5">
                      <Clock className="w-3.5 h-3.5" />
                      Sin Actividad Hoy
                    </div>
                  )}
                </div>

                {/* Tabs navegación interna */}
                <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit">
                  {([
                    { key: 'today', label: '📊 Actividad de Hoy' },
                    { key: 'history', label: '📋 Bitácora' },
                    { key: 'recs', label: '💬 Recomendaciones' },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === key
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB: ACTIVIDAD DE HOY */}
              {activeTab === 'today' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Pasos Hoy', value: selectedAthlete.todaySteps.toLocaleString(),
                        unit: 'pasos', icon: <Footprints className="text-blue-400 w-5 h-5" />,
                        bg: 'bg-blue-500/10', pct: Math.min(Math.round((selectedAthlete.todaySteps / goal.targetSteps) * 100), 100),
                        bar: 'bg-blue-400'
                      },
                      {
                        label: 'Calorías Hoy', value: selectedAthlete.todayCalories.toLocaleString(),
                        unit: 'kcal', icon: <Flame className="text-orange-400 w-5 h-5" />,
                        bg: 'bg-orange-500/10', pct: Math.min(Math.round((selectedAthlete.todayCalories / goal.targetCalories) * 100), 100),
                        bar: 'bg-orange-400'
                      },
                      {
                        label: 'Hidratación', value: selectedAthlete.todayWater,
                        unit: 'vasos', icon: <Droplets className="text-cyan-400 w-5 h-5" />,
                        bg: 'bg-cyan-500/10', pct: Math.min(Math.round((selectedAthlete.todayWater / goal.targetWater) * 100), 100),
                        bar: 'bg-cyan-400'
                      },
                      {
                        label: 'Peso Actual', value: selectedAthlete.weight,
                        unit: 'kg', icon: <Scale className="text-emerald-400 w-5 h-5" />,
                        bg: 'bg-emerald-500/10', pct: 100,
                        bar: 'bg-emerald-400'
                      },
                    ].map((kpi) => (
                      <div key={kpi.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                        <div className={`p-2.5 ${kpi.bg} rounded-xl w-fit mb-3`}>{kpi.icon}</div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold">{kpi.value}</span>
                          <span className="text-slate-500 text-xs">{kpi.unit}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Meta</span><span>{kpi.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${kpi.bar} rounded-full transition-all duration-700`} style={{ width: `${kpi.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Observación rápida */}
                  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" /> Última Observación del Coach
                    </p>
                    <p className="text-slate-300 italic text-sm">"{selectedAthlete.lastObservation}"</p>
                    <button
                      onClick={() => setActiveTab('recs')}
                      className="mt-3 text-xs text-primary hover:text-primary-light font-bold underline underline-offset-2"
                    >
                      + Dejar nueva recomendación →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: BITÁCORA HISTÓRICA */}
              {activeTab === 'history' && (
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Activity className="text-primary w-5 h-5" /> Bitácora Histórica de Métricas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { type: 'ALL', label: 'Todo' },
                        { type: 'STEPS', label: '🚶 Pasos' },
                        { type: 'CALORIES_BURNED', label: '🔥 Cal' },
                        { type: 'WATER', label: '💧 Agua' },
                        { type: 'WEIGHT', label: '⚖️ Peso' },
                      ].map(btn => (
                        <button
                          key={btn.type}
                          onClick={() => setFilterType(btn.type)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            filterType === btn.type
                              ? 'bg-primary border-primary text-white'
                              : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                    </div>
                  ) : filteredMetrics.length > 0 ? (
                    <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="py-3 px-3">Fecha</th>
                            <th className="py-3 px-3">Tipo</th>
                            <th className="py-3 px-3 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredMetrics.map((m: any) => (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3 text-slate-300">{formatLocalDate(m.date)}</td>
                              <td className="py-2.5 px-3 font-bold text-white capitalize">
                                {m.type === 'STEPS' ? '🚶 Pasos'
                                  : m.type === 'CALORIES_BURNED' ? '🔥 Calorías'
                                  : m.type === 'WATER' ? '💧 Agua'
                                  : m.type === 'WEIGHT' ? '⚖️ Peso'
                                  : m.type}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                {m.value.toLocaleString()} <span className="text-slate-500 font-sans">{m.unit}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <Activity className="w-10 h-10 mx-auto mb-2 opacity-30 animate-pulse" />
                      <p className="text-sm">Sin registros para este filtro</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: RECOMENDACIONES */}
              {activeTab === 'recs' && (
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-5 animate-in fade-in duration-200">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-primary w-5 h-5" /> Historial de Recomendaciones
                  </h3>

                  {/* Lista de recomendaciones previas */}
                  {athleteRecs.length > 0 ? (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      {athleteRecs.map((rec: any, i: number) => (
                        <div key={i} className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-slate-300 text-sm italic">"{rec.observation}"</p>
                          <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Coach: {rec.coach?.name || 'Tú'}</span>
                            <span>{new Date(rec.createdAt).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">Aún no has enviado observaciones a este atleta.</p>
                  )}

                  {/* Formulario nueva recomendación */}
                  <form onSubmit={handleSubmitRecommendation} className="space-y-3 border-t border-white/5 pt-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Nueva Observación / Recomendación
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder={`Escribe tu feedback para ${selectedAthlete.name}... Ej: Excelente progreso esta semana. Recomiendo aumentar intensidad en cardio y mantener hidratación de 8 vasos diarios.`}
                      className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600 resize-none"
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !observation.trim()}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {submitting ? 'Enviando...' : 'Enviar Recomendación'}
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-16 text-center">
              <Users className="text-slate-600 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Selecciona un atleta</h3>
              <p className="text-slate-500 text-sm mt-2">Verás su actividad de hoy, historial completo y podrás dejarle recomendaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachHealthView;
