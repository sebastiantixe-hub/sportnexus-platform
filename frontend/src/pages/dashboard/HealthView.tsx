import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  Scale, 
  Footprints, 
  Plus, 
  Flame,
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

const MOCK_CHART_DATA = [
  { name: 'Lun', calories: 450, steps: 8500 },
  { name: 'Mar', calories: 630, steps: 11200 },
  { name: 'Mié', calories: 210, steps: 4300 },
  { name: 'Jue', calories: 890, steps: 12500 },
  { name: 'Vie', calories: 540, steps: 9800 },
  { name: 'Sáb', calories: 320, steps: 15400 },
  { name: 'Dom', calories: 150, steps: 6700 },
];

const HealthView: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: 'STEPS', value: '', unit: 'pasos', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data } = await api.get('/health/metrics');
      setMetrics(data);
    } catch (err) {
      console.error(err);
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
      setShowModal(false);
      fetchMetrics();
    } catch (err) {
      toast.error('Error al guardar métrica');
    }
  };

  const todayMetrics = {
    steps: metrics.find(m => m.type === 'STEPS' && m.date.startsWith(new Date().toISOString().split('T')[0]))?.value || 0,
    calories: metrics.find(m => m.type === 'CALORIES_BURNED' && m.date.startsWith(new Date().toISOString().split('T')[0]))?.value || 0,
    weight: metrics.find(m => m.type === 'WEIGHT')?.value || 70,
    water: metrics.find(m => m.type === 'WATER' && m.date.startsWith(new Date().toISOString().split('T')[0]))?.value || 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Hercix Health
          </h1>
          <p className="text-slate-400">Tu progreso de salud nativo, inteligente y sin dependencias.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Registrar Actividad
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Footprints className="text-blue-400" />}
          title="Pasos Hoy"
          value={todayMetrics.steps}
          unit="pasos"
          goal={10000}
          color="blue"
        />
        <StatCard 
          icon={<Flame className="text-orange-500" />}
          title="Calorías Quemadas"
          value={Math.round(todayMetrics.calories)}
          unit="kcal"
          goal={800}
          color="orange"
        />
        <StatCard 
          icon={<Scale className="text-emerald-400" />}
          title="Peso Actual"
          value={todayMetrics.weight}
          unit="kg"
          trend="-0.5kg vs mes anterior"
          color="emerald"
        />
        <StatCard 
          icon={<Droplets className="text-cyan-400" />}
          title="Hidratación"
          value={todayMetrics.water}
          unit="vasos"
          goal={8}
          color="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Summary Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Actividad Semanal</h3>
              <p className="text-slate-400 text-sm">Resumen de quema calórica basada en MET</p>
            </div>
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
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

        {/* MET Reference Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Guía de Intensidad (MET)</h3>
          <div className="space-y-4">
            <METItem label="CrossFit / HIIT" value="9.0" color="bg-orange-500" />
            <METItem label="Fútbol / Running" value="7.5" color="bg-blue-500" />
            <METItem label="Gimnasio / Pesas" value="6.0" color="bg-emerald-500" />
            <METItem label="Natación" value="8.0" color="bg-cyan-500" />
            <METItem label="Yoga / Pilates" value="3.0" color="bg-purple-500" />
          </div>
          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
            <p className="text-[10px] text-primary-light uppercase font-bold tracking-widest mb-1">Nota Científica</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hercix utiliza equivalentes metabólicos (MET) para estimar tu gasto calórico basándose en tu peso y la intensidad del deporte.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Registro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Registrar Salud</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
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
                  <option value="STEPS">Pasos</option>
                  <option value="WEIGHT">Peso</option>
                  <option value="WATER">Agua (Vasos)</option>
                  <option value="DISTANCE">Distancia (km)</option>
                  <option value="CALORIES_BURNED">Calorías (Manual)</option>
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
                  placeholder="Ej: 75.5"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
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

const METItem = ({ label, value, color }: any) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </div>
    <span className="text-sm font-bold text-white bg-white/5 px-2 py-1 rounded-lg">{value} MET</span>
  </div>
);

export default HealthView;
