import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Activity
} from 'lucide-react';
import api from '../../api/api-client';
import { toast } from 'sonner';

interface METConfig {
  id: string;
  name: string;
  metValue: number;
  intensity: string;
  defaultDuration: number;
}

const AdminHealthView: React.FC = () => {
  const [mets, setMets] = useState<METConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newMET, setNewMET] = useState({
    name: '',
    metValue: '',
    intensity: 'MEDIA',
    defaultDuration: '60'
  });

  useEffect(() => {
    fetchMETs();
  }, []);

  const fetchMETs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/admin/met');
      setMets(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar configuraciones MET');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMET = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMET.name || !newMET.metValue) return;

    try {
      await api.post('/health/admin/met', {
        name: newMET.name,
        metValue: parseFloat(newMET.metValue),
        intensity: newMET.intensity,
        defaultDuration: parseInt(newMET.defaultDuration)
      });
      toast.success('Configuración MET agregada con éxito');
      setNewMET({ name: '', metValue: '', intensity: 'MEDIA', defaultDuration: '60' });
      setShowAddForm(false);
      fetchMETs();
    } catch (err) {
      toast.error('Error al agregar configuración MET');
    }
  };

  const handleDeleteMET = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta actividad MET?')) return;
    try {
      await api.delete(`/health/admin/met/${id}`);
      toast.success('Actividad eliminada');
      fetchMETs();
    } catch (err) {
      toast.error('Error al eliminar actividad');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldCheck className="text-primary w-8 h-8" />
            Configuraciones de Salud Globales
          </h1>
          <p className="text-slate-400">Administra la tabla maestra de actividades físicas y valores metabólicos equivalentes (MET).</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          {showAddForm ? 'Ocultar Formulario' : 'Agregar Actividad'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddMET} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Nombre Actividad</label>
            <input 
              type="text" 
              required
              placeholder="Ej: Spinning, Remo..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={newMET.name}
              onChange={(e) => setNewMET({...newMET, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Valor MET</label>
            <input 
              type="number" 
              step="0.1"
              required
              placeholder="Ej: 7.5"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={newMET.metValue}
              onChange={(e) => setNewMET({...newMET, metValue: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Intensidad</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={newMET.intensity}
              onChange={(e) => setNewMET({...newMET, intensity: e.target.value})}
            >
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
          >
            Guardar Configuración
          </button>
        </form>
      )}

      {/* MET configs Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="text-primary w-6 h-6" />
          Tabla Maestra de Actividades y Valores MET
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4 rounded-l-xl">Actividad</th>
                <th className="px-6 py-4">Valor MET</th>
                <th className="px-6 py-4">Intensidad</th>
                <th className="px-6 py-4">Duración Defecto</th>
                <th className="px-6 py-4 rounded-r-xl text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mets.map((met) => (
                <tr key={met.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 font-semibold text-white">{met.name}</td>
                  <td className="px-6 py-4">{met.metValue} MET</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      met.intensity === 'ALTA' ? 'bg-red-400/10 text-red-400' :
                      met.intensity === 'MEDIA' ? 'bg-orange-400/10 text-orange-400' :
                      'bg-purple-400/10 text-purple-400'
                    }`}>
                      {met.intensity}
                    </span>
                  </td>
                  <td className="px-6 py-4">{met.defaultDuration} min</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteMET(met.id)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHealthView;
