import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Send,
  Flame,
  Footprints,
  Scale,
  ChevronRight,
  Activity
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
}

const CoachHealthView: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [observation, setObservation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/coach/athletes');
      setAthletes(data);
      if (data.length > 0) {
        setSelectedAthlete(data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos de atletas');
    } finally {
      setLoading(false);
    }
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
      toast.success('Recomendación enviada con éxito');

      // Actualizar el estado local
      const updated = athletes.map(ath => {
        if (ath.id === selectedAthlete.id) {
          return { ...ath, lastObservation: observation.trim() };
        }
        return ath;
      });
      setAthletes(updated);
      setSelectedAthlete(prev => prev ? { ...prev, lastObservation: observation.trim() } : null);
      setObservation('');
    } catch (err) {
      toast.error('Error al enviar recomendación');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAthletes = athletes.filter(ath =>
    ath.name.toLowerCase().includes(search.toLowerCase()) ||
    ath.email.toLowerCase().includes(search.toLowerCase())
  );

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
          Monitoreo de Atletas
        </h1>
        <p className="text-slate-400">Analiza el progreso físico de tus alumnos y deja recomendaciones de salud.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Athlete Selector */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-[600px] flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar atleta..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredAthletes.length > 0 ? (
              filteredAthletes.map((ath) => (
                <button
                  key={ath.id}
                  onClick={() => setSelectedAthlete(ath)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${selectedAthlete?.id === ath.id
                      ? 'bg-primary/20 border border-primary/30 text-white'
                      : 'bg-white/5 border border-transparent text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {ath.avatarUrl ? (
                      <img src={ath.avatarUrl} alt={ath.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase">
                        {ath.name[0]}
                      </div>
                    )}
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-white">{ath.name}</h4>
                      <p className="text-xs text-slate-500">{ath.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic text-center mt-12">No se encontraron atletas.</p>
            )}
          </div>
        </div>

        {/* Right Columns: Athlete Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAthlete ? (
            <>
              {/* Profile Card */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    {selectedAthlete.avatarUrl ? (
                      <img src={selectedAthlete.avatarUrl} alt={selectedAthlete.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-2xl text-white uppercase">
                        {selectedAthlete.name[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{selectedAthlete.name}</h2>
                      <p className="text-slate-400 text-sm">Monitoreo de rendimiento deportivo y salud</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-400/10 text-emerald-400 font-bold px-4 py-2 rounded-full text-xs">
                    <Activity className="w-4 h-4 animate-pulse" /> Activo en Hercix
                  </div>
                </div>

                {/* Grid of stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <Flame className="text-orange-500 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Calorías Totales</p>
                      <h4 className="text-xl font-bold mt-1">{Math.round(selectedAthlete.totalCaloriesBurned)} kcal</h4>
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Footprints className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pasos Promedio</p>
                      <h4 className="text-xl font-bold mt-1">{selectedAthlete.averageSteps.toLocaleString()}</h4>
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Scale className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Peso Corporal</p>
                      <h4 className="text-xl font-bold mt-1">{selectedAthlete.weight || 70} kg</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed de Observaciones del Coach */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="text-primary w-6 h-6" />
                  <h3 className="text-xl font-bold">Historial de Observaciones</h3>
                </div>

                <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl mb-6">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-2">Último Reporte Registrado:</p>
                  <p className="text-slate-300 italic">"{selectedAthlete.lastObservation}"</p>
                </div>

                {/* Form to submit new comment */}
                <form onSubmit={handleSubmitRecommendation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Nueva Observación / Recomendación
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Ej: Recomiendo bajar intensidad a CrossFit esta semana por fatiga reportada en rodilla. Incrementar hidratación a 10 vasos."
                      className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-slate-500"
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {submitting ? 'Guardando...' : 'Enviar Recomendación'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center">
              <Users className="text-slate-600 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Selecciona un atleta</h3>
              <p className="text-slate-500 text-sm mt-1">Podrás ver su rendimiento físico e ingresar recomendaciones.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CoachHealthView;
