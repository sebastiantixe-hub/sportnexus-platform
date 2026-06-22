import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api-client';
import { useAuth } from '../../context/auth-context';
import {
  Search,
  MapPin,
  Star,
  Plus,
  Filter,
  Loader2,
  Dumbbell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import CreateGymModal from './CreateGymModal';

const getGymCardBanner = (gym: any) => {
  if (gym.logoUrl) return gym.logoUrl;
  if (gym.bannerUrl) return gym.bannerUrl;
  if (gym.imageUrl) return gym.imageUrl;
  
  const name = gym.name || '';
  if (name.includes('Fútbol')) return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
  if (name.includes('Box')) return 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600&auto=format&fit=crop';
  if (name.includes('Natación')) return 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=600&auto=format&fit=crop';
  if (name.includes('Tenis')) return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop';
  if (name.includes('Básquet')) return 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=600&auto=format&fit=crop';
  
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop';
};

const GymCard: React.FC<{
  gym: any;
  isOwner: boolean;
  onEdit: (gym: any) => void;
  onDelete: (id: string) => void;
  navigate: any;
}> = ({ gym, isOwner, onEdit, onDelete, navigate }) => (
  <motion.div
    whileHover={{ y: -5 }}
    onClick={() => navigate(`/gyms/${gym.id}`)}
    className="glass-card overflow-hidden group border-white/5 hover:border-primary/30 transition-all cursor-pointer"
  >
    <div className="h-40 bg-slate-950 relative overflow-hidden">
      <img 
        src={getGymCardBanner(gym)} 
        alt={gym.name}
        className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      <div className="absolute bottom-4 left-4">
        <span className="bg-primary/80 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          {gym.status || 'Activo'}
        </span>
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">{gym.name}</h3>
      <p className="text-slate-400 text-sm mt-2 line-clamp-2">
        {gym.description ? gym.description.split('\n\n[Categorías:')[0] : 'Sin descripción disponible.'}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-400 text-xs text-secondary-light">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {gym.address || 'Sin dirección'}
            {gym.district && `, ${gym.district}`}
            {gym.province && `, ${gym.province}`}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="text-yellow-400 fill-yellow-400 w-4 h-4" />
          <span className="text-white font-bold text-sm">NUEVO</span>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(gym); }}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Editar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(gym.id); }}
                className="text-red-400 hover:text-red-300 transition-colors text-sm font-bold"
              >
                Eliminar
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/gyms/${gym.id}`)}
            className="text-primary-light font-bold text-sm hover:underline"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const GymsPage: React.FC = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGym, setEditingGym] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const { user } = useAuth();

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const url = user?.role === 'GYM_OWNER' ? `/gyms?ownerId=${user.id}` : '/gyms';
      const { data } = await api.get(url);
      setGyms(data);
    } catch (err) {
      console.error('Error fetching gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gimnasio?')) {
      try {
        await api.delete(`/gyms/${id}`);
        setMessage({ type: 'success', text: 'Gimnasio eliminado exitosamente.' });
        fetchGyms();
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Error al eliminar.' });
      }
    }
  };

  const getGymSports = (g: any): string[] => {
    if (!g.description || !g.description.includes('[Categorías: ')) return [];
    try {
      const parts = g.description.split('[Categorías: ');
      if (parts.length > 1) {
        return parts[1].replace(']', '').split(',').map((s: string) => s.trim());
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const availableSports = Array.from(
    new Set(
      gyms.flatMap(g => getGymSports(g))
    )
  ).sort();

  const availableDistricts = Array.from(
    new Set(
      gyms.map(g => g.district).filter(Boolean)
    )
  ).sort();

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredGyms = gyms.filter(g => {
    const s = normalize(search);
    const cleanDesc = g.description ? g.description.split('\n\n[Categorías:')[0] : '';
    const fields = [g.name, g.address, cleanDesc, g.city, g.district, g.province];
    const matchesSearch = s === '' || fields.some(field => normalize(field || '').includes(s));

    const sports = getGymSports(g);
    const matchesSport = selectedSport === '' || sports.some(sport => sport.toLowerCase() === selectedSport.toLowerCase());

    const matchesDistrict = selectedDistrict === '' || (g.district && g.district.toLowerCase() === selectedDistrict.toLowerCase());

    return matchesSearch && matchesSport && matchesDistrict;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gimnasios</h1>
          <p className="text-slate-400 mt-1">Encuentra el lugar perfecto para tu próximo entrenamiento.</p>
        </div>
        {(user?.role === 'GYM_OWNER' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Mi Gimnasio</span>
          </button>
        )}
      </header>

      {(showCreateModal || editingGym) && (
        <CreateGymModal
          initialData={editingGym}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGym(null);
          }}
          onCreated={() => {
            fetchGyms();
            setMessage({ type: 'success', text: editingGym ? '¡Gimnasio actualizado!' : '¡Gimnasio registrado exitosamente!' });
            setEditingGym(null);
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
        >
          {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 focus:border-primary-light w-full py-4 pr-4 pl-12 border rounded-2xl text-white outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className={`glass-card px-6 py-4 flex items-center gap-2 hover:bg-white/10 transition-all font-medium border ${
            showFiltersPanel || selectedSport || selectedDistrict ? 'border-primary/50 bg-primary/10 text-white' : 'border-white/5 text-slate-300'
          }`}
        >
          <Filter className={`w-5 h-5 ${selectedSport || selectedDistrict ? 'text-primary-light' : ''}`} />
          <span>Filtros</span>
          {(selectedSport || selectedDistrict) && (
            <span className="w-2 h-2 rounded-full bg-primary-light animate-pulse" />
          )}
        </button>
      </div>

      {/* Panel de Filtros Desplegable */}
      {showFiltersPanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-white/10 bg-slate-900/60 backdrop-blur-md rounded-2xl"
        >
          <div>
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Deporte / Categoría</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-light cursor-pointer"
            >
              <option value="">Todos los Deportes</option>
              {availableSports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Distrito / Zona</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-light cursor-pointer"
            >
              <option value="">Todos los Distritos</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(selectedSport || selectedDistrict) ? (
              <button
                onClick={() => {
                  setSelectedSport('');
                  setSelectedDistrict('');
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                Limpiar Filtros
              </button>
            ) : (
              <div className="text-[10px] text-slate-500 italic pb-2 text-center w-full">
                Selecciona filtros para refinar los gimnasios.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary w-12 h-12 animate-spin" />
        </div>
      ) : filteredGyms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGyms.map(gym => (
            <GymCard
              key={gym.id}
              gym={gym}
              isOwner={user?.role === 'ADMIN' || (user?.role === 'GYM_OWNER' && gym.ownerId === user?.id)}
              onEdit={setEditingGym}
              onDelete={handleDelete}
              navigate={navigate}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-800 p-6 rounded-full mb-6">
            <Dumbbell className="text-slate-500 w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-white">No se encontraron gimnasios</h2>
          <p className="text-slate-400 mt-2">Prueba ajustando tu búsqueda o registra el primero.</p>
        </div>
      )}
    </div>
  );
};

export default GymsPage;
