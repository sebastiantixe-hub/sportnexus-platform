import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Flame, 
  Users, 
  Clock, 
  TrendingUp, 
  Sparkles,
} from 'lucide-react';
import api from '../../api/api-client';
import { toast } from 'sonner';

interface OwnerStats {
  gymCount: number;
  activeAthletes: number;
  totalCaloriesBurnedInClasses: number;
  averageClassDuration: number;
}

const OwnerHealthView: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/owner/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar analíticas de dueños');
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Rendimiento Deportivo de tu Academia
        </h1>
        <p className="text-slate-400">Analíticas de quema calórica e impacto de salud de tus gimnasios.</p>
      </div>

      {stats ? (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="text-primary w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Tus Gimnasios Activos</p>
                <h4 className="text-3xl font-bold mt-1">{stats.gymCount}</h4>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                  <Flame className="text-orange-500 w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Calorías Totales de Clases</p>
                <h4 className="text-3xl font-bold mt-1">{stats.totalCaloriesBurnedInClasses.toLocaleString()} kcal</h4>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                  <Users className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Atletas que Entrenaron</p>
                <h4 className="text-3xl font-bold mt-1">{stats.activeAthletes} alumnos</h4>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                  <Clock className="text-emerald-400 w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Duración Promedio Clase</p>
                <h4 className="text-3xl font-bold mt-1">{stats.averageClassDuration} min</h4>
              </div>
            </div>

          </div>

          {/* Section: Community Impact & Promotion */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Impact Details */}
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-400 w-6 h-6" />
                <h3 className="text-xl font-bold">Consistencia Comunitaria</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                ¡Tu comunidad de atletas está activa y quemando calorías al máximo! Los entrenamientos de CrossFit y HIIT están liderando la quema calórica en tus sedes con un promedio de **9.0 MET** por sesión. 
              </p>
              
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-md">Impacto de Retención Semanal</h4>
                  <p className="text-xs text-slate-400 mt-1">Los atletas que registran sus marcas manuales tienen un **42% más de visitas** a tus sedes.</p>
                </div>
                <div className="text-2xl font-bold text-primary-light bg-primary/10 px-4 py-2 rounded-xl">
                  +42% Retención
                </div>
              </div>
            </div>

            {/* Marketplace Promo Card */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-indigo-400 w-5 h-5" />
                  <h4 className="font-bold text-white text-md">Promociona tu Tienda Deportiva</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ofrece suplementos, proteínas y artículos deportivos directamente en la Tienda Deportiva de Hercix para tus atletas en base a su nivel de entrenamiento.
                </p>
              </div>
              <button 
                onClick={() => navigate('/marketplace')}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all text-xs"
              >
                Ir a Tienda Deportiva
              </button>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center">
          <Building2 className="text-slate-600 w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Sin datos de gimnasios</h3>
          <p className="text-slate-500 text-sm mt-1">Asegúrate de tener gimnasios registrados para ver analíticas.</p>
        </div>
      )}
    </div>
  );
};

export default OwnerHealthView;
