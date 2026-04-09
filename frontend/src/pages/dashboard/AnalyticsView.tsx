import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Ene', MRR: 4000, attendees: 2400, newMembers: 2400 },
  { name: 'Feb', MRR: 5000, attendees: 1398, newMembers: 2210 },
  { name: 'Mar', MRR: 7000, attendees: 9800, newMembers: 2290 },
  { name: 'Abr', MRR: 8500, attendees: 3908, newMembers: 2000 },
  { name: 'May', MRR: 8000, attendees: 4800, newMembers: 2181 },
  { name: 'Jun', MRR: 11000, attendees: 3800, newMembers: 2500 },
];

const AnalyticsView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Analítica Avanzada</h1>
          <p className="text-slate-400 text-sm">Resumen de rendimiento de tu gimnasio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 text-primary-light mb-2">
            <TrendingUp />
            <h3 className="font-bold">MRR Actual</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">$11,000</p>
          <span className="text-green-400 text-xs font-semibold px-2 py-0.5 bg-green-500/10 rounded-full">+12.5% vs mes anterior</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 text-secondary-light mb-2">
            <Users />
            <h3 className="font-bold">Retención Mensual</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">94.2%</p>
          <span className="text-green-400 text-xs font-semibold px-2 py-0.5 bg-green-500/10 rounded-full">Excelente</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 text-accent transition-colors mb-2">
            <Calendar />
            <h3 className="font-bold">Clases Asistidas</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">3,800</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-[400px]">
        <h3 className="text-xl font-bold text-white mb-6">Crecimiento de MRR</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="MRR" stroke="#818cf8" fillOpacity={1} fill="url(#colorMRR)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsView;
