import React, { useState, useEffect } from 'react';
import api from '../../api/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Map as MapIcon, Navigation2, Search, X, 
  Calendar, Users, Clock, ChevronRight, Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PayMeModal } from '../../components/payment/PayMeModal';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons with Glow Effect
const getCustomIcon = (sportLabel: string) => {
  const emoji = sportLabel.split(' ')[0] || '📍';
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center marker-glow">
        <div class="absolute w-10 h-10 bg-primary/40 rounded-full blur-md animate-pulse"></div>
        <div class="relative w-8 h-8 bg-slate-900 border-2 border-primary-light rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
          <span class="text-sm">${emoji}</span>
          <div class="absolute -bottom-1 w-2 h-2 bg-primary-light rotate-45"></div>
        </div>
      </div>
    `,
    className: 'custom-sport-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const SPORT_FILTERS = [
  { label: 'Todos', value: '' },
  { label: '🏋️ Gimnasio', value: 'Gimnasio' },
  { label: '⚽ Fútbol', value: 'Fútbol' },
  { label: '🏐 Vóley', value: 'Vóley' },
  { label: '🏀 Básquetbol', value: 'Básquetbol' },
  { label: '🎾 Tenis', value: 'Tenis' },
  { label: '🏊 Natación', value: 'Natación' },
  { label: '🥊 Box', value: 'Box' },
  { label: '🏃 Atletismo', value: 'Atletismo' },
];

const MapSearchPage: React.FC = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocation, setUsingLocation] = useState(false);
  const [centerMap, setCenterMap] = useState<[number, number]>([-12.0464, -77.0428]);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [gymClasses, setGymClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    api.get('/gyms').then(({ data }) => setGyms(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleNearbySearch = () => {
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización'); return; }
    setLoading(true); setUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCenterMap([latitude, longitude]);
        if (map) map.flyTo([latitude, longitude], 14);
        try { const { data } = await api.get(`/gyms/nearby?lat=${latitude}&lng=${longitude}&radius=10`); setGyms(data); }
        catch { } finally { setLoading(false); }
      },
      () => { setLoading(false); setUsingLocation(false); }
    );
  };

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [classToBook, setClassToBook] = useState<{id: string, title: string, price: number} | null>(null);

  const initiateBooking = (classId: string, classTitle: string, price: number) => {
    setClassToBook({ id: classId, title: classTitle, price });
    setShowPayment(true);
  };

  const handleBookSuccess = async () => {
    if (!classToBook) return;
    setBookingId(classToBook.id);
    setShowPayment(false);
    try {
      await api.post(`/classes/${classToBook.id}/book`);
      toast.success(`✅ ¡Reserva confirmada! "${classToBook.title}" está en Mis Reservas.`);
      if (selectedGym) {
        const { data } = await api.get(`/classes?gymId=${selectedGym.id}`);
        setGymClasses(data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al reservar';
      toast.error(`❌ ${msg}`);
    } finally {
      setBookingId(null);
    }
  };

  const handleSelectGym = async (gym: any) => {
    setSelectedGym(gym);
    if (map && gym.latitude && gym.longitude) {
      map.flyTo([gym.latitude, gym.longitude], 15);
    }
    setLoadingClasses(true);
    try {
      const { data } = await api.get(`/classes?gymId=${gym.id}`);
      setGymClasses(data);
    } catch { setGymClasses([]); }
    finally { setLoadingClasses(false); }
  };


  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = gyms.filter(g => {
    const s = normalize(search);
    const fields = [g.name, g.address, g.city, g.district, g.province];
    const matchSearch = !search || fields.some(f => normalize(f || '').includes(s));
    const matchSport = !sportFilter || g.name.includes(sportFilter);
    return matchSearch && matchSport;
  });

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapIcon className="text-primary-light" /> Buscar Academias y Gimnasios
          </h1>
          <p className="text-slate-400 mt-1">Encuentra el lugar perfecto para entrenar cerca de ti.</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text" placeholder="Buscar por nombre, ciudad o deporte..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-primary transition-all"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>}
        </div>

        {/* Sport filter chips */}
        <div className="flex gap-2 flex-wrap">
          {SPORT_FILTERS.map(f => (
            <button key={f.value} onClick={() => setSportFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${sportFilter === f.value ? 'bg-primary text-white border-primary' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-grow flex gap-4 relative overflow-hidden">
        {/* Map */}
        <div className="w-2/3 bg-slate-800/50 rounded-2xl border border-white/10 relative overflow-hidden hidden lg:block z-0">
          <MapContainer 
            key={centerMap.join(',')} 
            center={centerMap} 
            zoom={13} 
            style={{ width: '100%', height: '100%' }} 
            className="z-0"
            ref={setMap as any}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            />
            {filtered.filter(g => g.latitude && g.longitude).map(gym => (
              <Marker 
                key={gym.id} 
                position={[gym.latitude, gym.longitude]}
                icon={getCustomIcon(SPORT_FILTERS.find(f => gym.name.includes(f.value))?.label || '📍')}
                eventHandlers={{
                  click: () => handleSelectGym(gym)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <strong className="text-slate-900 block border-b mb-1">{gym.name}</strong>
                    <p className="text-slate-600 text-[10px] leading-tight">{gym.address}</p>
                    <button onClick={() => handleSelectGym(gym)} className="mt-2 text-primary-light font-bold text-[10px] uppercase tracking-wider">Ver Detalles →</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Gym list */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-1 pb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{filtered.length} resultados</p>
            <button onClick={handleNearbySearch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${usingLocation ? 'bg-primary text-white animate-pulse' : 'bg-primary/10 text-primary-light hover:bg-primary/20'}`}>
              <Navigation2 className="w-3.5 h-3.5" /> Cerca de mí
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-primary animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">No se encontraron resultados para "{search}".</div>
          ) : (
            filtered.map(gym => (
              <motion.div whileHover={{ x: 3 }} key={gym.id}
                onClick={() => handleSelectGym(gym)}
                className="glass-card p-4 border-white/5 hover:border-primary/30 cursor-pointer transition-all">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm leading-tight truncate">{gym.name}</h3>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {gym.address || ''}{gym.district ? `, ${gym.district}` : ''}{gym.province ? `, ${gym.province}` : ''}{gym.city ? `, ${gym.city}` : ''}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">⭐ 4.8</span>
                  <span className="text-primary-light font-bold">Ver clases →</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Gym Detail Panel */}
      <AnimatePresence>
        {selectedGym && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedGym(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 to-slate-900 p-5 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedGym.name}</h2>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedGym.address}, {selectedGym.city}
                    </p>
                    {selectedGym.phone && <p className="text-slate-500 text-xs mt-1">📞 {selectedGym.phone}</p>}
                    {selectedGym.description && <p className="text-slate-400 text-sm mt-2 line-clamp-2">{selectedGym.description}</p>}
                  </div>
                  <button onClick={() => setSelectedGym(null)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Classes */}
              <div className="p-5 overflow-y-auto flex-grow">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-light" /> Clases Disponibles
                </h3>
                {loadingClasses ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : gymClasses.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Este local no tiene clases programadas aún.</p>
                ) : (
                  <div className="space-y-3">
                    {gymClasses.map(cls => (
                      <div key={cls.id} className="glass-card p-4 border border-white/5 hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-grow min-w-0">
                            <h4 className="text-white font-bold text-sm">{cls.title}</h4>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(cls.scheduledAt).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(cls.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {cls._count?.reservations ?? 0}/{cls.capacity} cupos
                              </span>
                            </div>
                            {cls.trainer?.user?.name && (
                              <p className="text-slate-500 text-xs mt-1">🏋️ Coach: {cls.trainer.user.name}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-green-400 font-bold">${Number(cls.price).toFixed(0)}</p>
                            <button
                              onClick={() => initiateBooking(cls.id, cls.title, Number(cls.price))}
                              disabled={bookingId === cls.id}
                              className="mt-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1">
                              {bookingId === cls.id ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Reservando...</>
                              ) : '✅ Reservar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PayMeModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handleBookSuccess}
        amount={classToBook?.price || 0}
        description={`Clase: ${classToBook?.title || ''}`}
      />
    </div>
  );
};

export default MapSearchPage;
