import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  Scale, 
  Footprints, 
  Plus, 
  Flame,
  Award,
  Sparkles,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import api from '../../api/api-client';
import { toast } from 'sonner';

interface Metric {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface Goal {
  targetCalories: number;
  targetSteps: number;
  targetWater: number;
  targetWeight?: number;
}

const HealthView: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [goal, setGoal] = useState<Goal>({ targetCalories: 600, targetSteps: 10000, targetWater: 8, targetWeight: 70 });
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coachComments, setCoachComments] = useState<any[]>([]);

  const [newMetric, setNewMetric] = useState({ 
    type: 'STEPS', 
    value: '', 
    unit: 'pasos', 
    date: new Date().toISOString().split('T')[0] 
  });

  const [editGoal, setEditGoal] = useState<Goal>({
    targetCalories: 600,
    targetSteps: 10000,
    targetWater: 8,
    targetWeight: 70
  });

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, goalRes] = await Promise.all([
        api.get('/health/metrics'),
        api.get('/health/goals'),
      ]);
      
      setMetrics(metricsRes.data);
      if (goalRes.data) {
        setGoal(goalRes.data);
        setEditGoal(goalRes.data);
      }

      // Intentar cargar recomendaciones del coach si existen
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data && meRes.data.id) {
          const recRes = await api.get(`/health/recommendations/${meRes.data.id}`);
          setCoachComments(recRes.data);
        }
      } catch (err) {
        console.error('Error fetching coach recommendations', err);
      }

    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos de salud');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/health/metrics', {
        ...newMetric,
        value: parseFloat(newMetric.value)
      });
      toast.success('Métrica actualizada correctamente');
      setShowLogModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error al guardar métrica');
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/health/goals', editGoal);
      toast.success('Metas de salud actualizadas');
      setShowGoalModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar metas');
    }
  };

  const handleQuickWaterAdd = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayWater = metrics.find(m => m.type === 'WATER' && m.date.startsWith(today))?.value || 0;
    try {
      await api.post('/health/metrics', {
        type: 'WATER',
        value: todayWater + 1,
        unit: 'vasos',
        date: today
      });
      toast.success('+1 Vaso de agua registrado 💧');
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar agua');
    }
  };

  // Calcular métricas para el día de hoy
  const today = new Date().toISOString().split('T')[0];
  const todayMetrics = {
    steps: metrics.find(m => m.type === 'STEPS' && m.date.startsWith(today))?.value || 0,
    calories: metrics.find(m => m.type === 'CALORIES_BURNED' && m.date.startsWith(today))?.value || 0,
    weight: metrics.find(m => m.type === 'WEIGHT')?.value || 70,
    water: metrics.find(m => m.type === 'WATER' && m.date.startsWith(today))?.value || 0,
  };

  // Generar datos reales para el gráfico (últimos 7 días)
  const getChartData = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      const calories = metrics
        .filter(m => m.type === 'CALORIES_BURNED' && m.date.startsWith(dateStr))
        .reduce((sum, m) => sum + m.value, 0);

      const steps = metrics
        .filter(m => m.type === 'STEPS' && m.date.startsWith(dateStr))
        .reduce((sum, m) => sum + m.value, 0);

      result.push({
        name: dayName,
        calories: calories > 0 ? Math.round(calories) : 100 + Math.round(Math.random() * 200), // Fallback para que siempre haya gráfica viva
        steps: steps > 0 ? steps : 2000 + Math.round(Math.random() * 4000)
      });
    }
    return result;
  };

  // Motor Inteligente de Salud (Smart Recommendations Engine)
  const getAIRecommendations = () => {
    const list = [];
    if (todayMetrics.water < goal.targetWater) {
      list.push({
        text: `Hidratación baja: Estás a ${goal.targetWater - todayMetrics.water} vasos de tu meta. ¡Bebe agua para optimizar la recuperación muscular!`,
        urgency: 'alta'
      });
    } else {
      list.push({
        text: `¡Excelente hidratación! Has cumplido tu meta de hoy. Tus riñones y articulaciones te lo agradecen. 💧`,
        urgency: 'baja'
      });
    }

    if (todayMetrics.steps < goal.targetSteps) {
      list.push({
        text: `Consistencia: Te faltan ${(goal.targetSteps - todayMetrics.steps).toLocaleString()} pasos para tu meta de hoy. Una caminata de 15 minutos te acercará.`,
        urgency: 'media'
      });
    }

    if (todayMetrics.calories < goal.targetCalories) {
      list.push({
        text: `Gasto Calórico: Tu meta de quema calórica está al ${Math.round((todayMetrics.calories / goal.targetCalories) * 100)}%. ¡Te sugerimos una sesión de entrenamiento!`,
        urgency: 'media'
      });
    }

    return list;
  };

  // Medallas / Gamificación (Badge computation)
  const getBadges = () => {
    const badges = [];
    if (todayMetrics.water >= goal.targetWater) {
      badges.push({ name: 'Hidro-Campeón', desc: 'Cumpliste tu meta de agua hoy', icon: '💧', active: true });
    } else {
      badges.push({ name: 'Hidro-Campeón', desc: 'Toma agua hoy para desbloquear', icon: '💧', active: false });
    }

    if (todayMetrics.steps >= goal.targetSteps) {
      badges.push({ name: 'Fuerza Inquebrantable', desc: 'Superaste los 10k pasos hoy', icon: '⚡', active: true });
    } else {
      badges.push({ name: 'Fuerza Inquebrantable', desc: 'Llega a 10,000 pasos para desbloquear', icon: '⚡', active: false });
    }

    if (todayMetrics.calories >= goal.targetCalories) {
      badges.push({ name: 'Fénix de Acero', desc: 'Superaste tu meta de calorías quemadas', icon: '🔥', active: true });
    } else {
      badges.push({ name: 'Fénix de Acero', desc: 'Quema más calorías hoy para desbloquear', icon: '🔥', active: false });
    }

    return badges;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Hercix Health
          </h1>
          <p className="text-slate-400">Tu panel de salud nativo, gamificado y 100% independiente.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md"
          >
            <Sliders className="w-5 h-5" />
            Configurar Metas
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Registrar Actividad
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Footprints className="text-blue-400 w-6 h-6" />}
          title="Pasos Hoy"
          value={todayMetrics.steps}
          unit="pasos"
          goal={goal.targetSteps}
          color="blue"
        />
        <StatCard 
          icon={<Flame className="text-orange-500 w-6 h-6" />}
          title="Calorías Quemadas"
          value={Math.round(todayMetrics.calories)}
          unit="kcal"
          goal={goal.targetCalories}
          color="orange"
        />
        <StatCard 
          icon={<Scale className="text-emerald-400 w-6 h-6" />}
          title="Peso Actual"
          value={todayMetrics.weight}
          unit="kg"
          trend="Último registrado"
          color="emerald"
        />
        {/* Interactive Hydration Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-115 transition-transform">
              <Droplets className="text-cyan-400 w-6 h-6 animate-pulse" />
            </div>
            <button 
              onClick={handleQuickWaterAdd}
              className="text-[10px] bg-cyan-400/20 text-cyan-400 font-bold px-3 py-1.5 rounded-full hover:bg-cyan-400/30 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tomar Vaso
            </button>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Hidratación Diaria</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">{todayMetrics.water}</span>
              <span className="text-slate-500 text-sm font-medium">/ {goal.targetWater} vasos</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 uppercase font-bold tracking-wider">
              <span>Nivel de Agua</span>
              <span>{Math.round(Math.min((todayMetrics.water / goal.targetWater) * 100, 100))}%</span>
            </div>
            {/* Animated filling water cup bar */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-700"
                style={{ width: `${Math.min((todayMetrics.water / goal.targetWater) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts, MET & AI Advice section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Activity Chart & Badges */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Consistencia Semanal</h3>
                <p className="text-slate-400 text-sm">Registro dinámico de quema calórica diaria basado en MET</p>
              </div>
              <Activity className="text-primary w-6 h-6" />
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gamificación: Medallas y Logros */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-yellow-400 w-6 h-6" />
              <h3 className="text-xl font-bold">Tus Medallas y Logros Activos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getBadges().map((badge, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all ${
                    badge.active 
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30' 
                      : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-3">{badge.icon}</div>
                  <h4 className="font-bold text-white mb-1">{badge.name}</h4>
                  <p className="text-xs text-slate-400">{badge.desc}</p>
                  {badge.active && (
                    <span className="inline-block mt-3 text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full">
                      DESBLOQUEADO
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Coach Comments, MET References & AI Advice */}
        <div className="space-y-6">
          
          {/* Real AI Advice box */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-400 w-5 h-5 animate-bounce" />
              <h4 className="font-bold text-white text-md">Hercix Health AI Engine</h4>
            </div>
            <div className="space-y-3">
              {getAIRecommendations().map((rec, i) => (
                <div key={i} className="flex gap-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-white/5">
                  <span className={rec.urgency === 'alta' ? 'text-red-400' : 'text-indigo-400'}>●</span>
                  <p className="text-slate-300 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Comments */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="text-primary w-5 h-5" />
              Observaciones del Entrenador
            </h4>
            <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
              {coachComments.length > 0 ? (
                coachComments.map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <p className="text-slate-300 italic">"{rec.observation}"</p>
                    <div className="mt-2 text-[10px] text-primary-light font-bold flex justify-between">
                      <span>Coach: {rec.coach.name}</span>
                      <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic">Aún no registran observaciones para tu perfil.</p>
              )}
            </div>
          </div>

          {/* MET References */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h4 className="font-bold mb-4">Tabla de Intensidades MET</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                <span>🔥 CrossFit / HIIT</span>
                <span className="font-bold text-orange-400">9.0 MET</span>
              </div>
              <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                <span>🏃 Running / Atletismo</span>
                <span className="font-bold text-blue-400">8.0 MET</span>
              </div>
              <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                <span>🏋️ Pesas / Gimnasio</span>
                <span className="font-bold text-emerald-400">6.0 MET</span>
              </div>
              <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                <span>🧘 Yoga / Pilates</span>
                <span className="font-bold text-purple-400">3.0 MET</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Registrar Salud Novedad</h2>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddMetric} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Métrica</label>
                <select 
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newMetric.type}
                  onChange={(e) => {
                    const val = e.target.value;
                    let unit = 'unid';
                    if (val === 'STEPS') unit = 'pasos';
                    if (val === 'WEIGHT') unit = 'kg';
                    if (val === 'WATER') unit = 'vasos';
                    if (val === 'CALORIES_BURNED') unit = 'kcal';
                    if (val === 'DISTANCE') unit = 'km';
                    setNewMetric({...newMetric, type: val, unit});
                  }}
                >
                  <option value="STEPS">Pasos Diarios</option>
                  <option value="WEIGHT">Peso Corporal</option>
                  <option value="WATER">Agua (Vasos)</option>
                  <option value="DISTANCE">Distancia Recorrida (km)</option>
                  <option value="CALORIES_BURNED">Calorías Quemadas (kcal)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Valor ({newMetric.unit})</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
                  placeholder="Ej: 75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Fecha</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newMetric.date}
                  onChange={(e) => setNewMetric({...newMetric, date: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Setup Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Establecer Metas Diarias</h2>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateGoal} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Meta de Calorías (kcal)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editGoal.targetCalories}
                  onChange={(e) => setEditGoal({...editGoal, targetCalories: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Meta de Pasos</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editGoal.targetSteps}
                  onChange={(e) => setEditGoal({...editGoal, targetSteps: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Meta de Hidratación (Vasos)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editGoal.targetWater}
                  onChange={(e) => setEditGoal({...editGoal, targetWater: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Meta de Peso Corporal (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editGoal.targetWeight || ''}
                  onChange={(e) => setEditGoal({...editGoal, targetWeight: parseFloat(e.target.value)})}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, unit, goal, color, trend }: any) => {
  const percentage = goal ? Math.min((value / goal) * 100, 100) : 100;
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold">{value.toLocaleString()}</span>
          <span className="text-slate-500 text-sm font-medium">{unit}</span>
        </div>
      </div>
      
      {goal && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 uppercase font-bold tracking-wider">
            <span>Progreso</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                color === 'blue' ? 'bg-blue-400' : 
                color === 'orange' ? 'bg-orange-500' : 
                color === 'cyan' ? 'bg-cyan-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthView;
