import React, { useState, useEffect } from 'react';
import api from '../../api/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Map as MapIcon, Navigation2, Search, X, 
  Calendar, Users, Clock, ChevronRight, Loader2,
  TrendingUp, BarChart2, AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PayMeModal } from '../../components/payment/PayMeModal';
import { useAuth } from '../../context/auth-context';

// ─── Tipos de Movilidad Comercial ────────────────────────────────────────────
interface MobilityData {
  distanceKm: number;
  baseETA: number;          // minutos OSRM base
  commercialETA: number;    // ETA con factores comerciales
  walkingMin: number;
  trafficLevel: 'bajo' | 'moderado' | 'alto';
  trafficFactor: number;
  peakHour: boolean;
  commercialFlow: 'bajo' | 'medio' | 'alto';
  accessibility: 'baja' | 'media' | 'alta';
  mobilityScore: number;    // 0-100
  steps: string;
  coordinates: [number, number][];
}

// ─── Motor de Inteligencia Comercial ─────────────────────────────────────────
const calculateCommercialMobility = (
  distanceKm: number,
  baseETA: number,
  nearbyGymsCount: number,
  gymLat: number,
  gymLng: number
): Omit<MobilityData, 'steps' | 'coordinates' | 'walkingMin' | 'distanceKm'> => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Dom, 6=Sab

  // ── Factor Hora Pico ─────────────────────────────────────────────────
  const peakHour =
    (hour >= 7 && hour <= 9) ||
    (hour >= 12 && hour <= 14) ||
    (hour >= 17 && hour <= 20);
  const peakHourFactor = peakHour ? (dayOfWeek >= 1 && dayOfWeek <= 5 ? 4.5 : 2.0) : 0;

  // ── Factor Tráfico por Hora ──────────────────────────────────────────
  let trafficFactor: number;
  let trafficLevel: 'bajo' | 'moderado' | 'alto';
  if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 20) {
    trafficFactor = distanceKm * 1.8;
    trafficLevel = 'alto';
  } else if (hour >= 10 && hour <= 16) {
    trafficFactor = distanceKm * 0.9;
    trafficLevel = 'moderado';
  } else {
    trafficFactor = distanceKm * 0.3;
    trafficLevel = 'bajo';
  }

  // ── Factor Densidad Urbana (por zona geográfica) ─────────────────────
  const isUrbanCenter = Math.abs(gymLat - (-12.085)) < 0.05 && Math.abs(gymLng - (-77.03)) < 0.05;
  const densityFactor = isUrbanCenter ? distanceKm * 0.7 : distanceKm * 0.3;

  // ── Factor Saturación Comercial ──────────────────────────────────────
  const saturationFactor = nearbyGymsCount > 5 ? 2.0 : nearbyGymsCount > 2 ? 1.0 : 0;

  // ── Accesibilidad Vial ───────────────────────────────────────────────
  let accessibilityBonus: number;
  let accessibility: 'baja' | 'media' | 'alta';
  if (distanceKm <= 2) {
    accessibilityBonus = 2;
    accessibility = 'alta';
  } else if (distanceKm <= 5) {
    accessibilityBonus = 1;
    accessibility = 'media';
  } else {
    accessibilityBonus = 0;
    accessibility = 'baja';
  }

  // ── ETA Comercial Final ──────────────────────────────────────────────
  const commercialETA = Math.max(
    2,
    Math.round(baseETA + trafficFactor + densityFactor + peakHourFactor + saturationFactor - accessibilityBonus)
  );

  // ── Flujo Comercial ──────────────────────────────────────────────────
  let commercialFlow: 'bajo' | 'medio' | 'alto';
  if (hour >= 9 && hour <= 12 || hour >= 16 && hour <= 20) {
    commercialFlow = 'alto';
  } else if (hour >= 13 && hour <= 15) {
    commercialFlow = 'medio';
  } else {
    commercialFlow = 'bajo';
  }

  // ── Mobility Score (0-100) ────────────────────────────────────────────
  let score = 100;
  // Penalizar por distancia
  score -= Math.min(30, distanceKm * 5);
  // Penalizar por tráfico
  if (trafficLevel === 'alto') score -= 20;
  else if (trafficLevel === 'moderado') score -= 10;
  // Penalizar por saturación
  score -= Math.min(15, nearbyGymsCount * 2);
  // Penalizar por hora pico
  if (peakHour) score -= 10;
  // Bonificar por accesibilidad
  if (accessibility === 'alta') score += 8;
  else if (accessibility === 'media') score += 3;
  // Bonificar por flujo alto
  if (commercialFlow === 'alto') score += 5;
  const mobilityScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    baseETA,
    commercialETA,
    trafficLevel,
    trafficFactor: Math.round(trafficFactor),
    peakHour,
    commercialFlow,
    accessibility,
    mobilityScore,
  };
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon (pulsing blue dot)
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full blur-sm animate-ping"></div>
      <div class="absolute w-4 h-4 bg-blue-500/50 rounded-full animate-pulse"></div>
      <div class="relative w-3.5 h-3.5 bg-blue-500 border border-white rounded-full shadow-lg"></div>
    </div>
  `,
  className: 'user-location-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom Icons with Glow Effect
const getCustomIcon = (sportLabel: string) => {
  const emoji = sportLabel.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|./u)?.[0] || '📍';
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center marker-glow">
        <div class="absolute w-12 h-12 bg-red-500/30 rounded-full blur-md animate-pulse"></div>
        <div class="relative w-9 h-9 bg-slate-950 border-2 border-red-500 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95">
          <span class="text-lg leading-none select-none">${emoji}</span>
          <div class="absolute -bottom-1 w-2.5 h-2.5 bg-red-500 rotate-45 rounded-sm"></div>
        </div>
      </div>
    `,
    className: 'custom-sport-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
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
  const { user } = useAuth();
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocation, setUsingLocation] = useState(false);
  const [centerMap, setCenterMap] = useState<[number, number]>([-12.085, -77.03]); // Por defecto en centro de San Isidro
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [gymClasses, setGymClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite'>('dark');

  // Coordenadas fijas por defecto del usuario (Sede central Hercix, San Isidro)
  const [userCoords, setUserCoords] = useState<[number, number]>([-12.085, -77.03]);
  const [mobilityData, setMobilityData] = useState<MobilityData | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    let activeGyms: any[] = [];
    
    const loadGyms = async (isPoll = false) => {
      try {
        const { data } = await api.get('/gyms');
        
        // Verificar en tiempo real si hay un nuevo gimnasio creado por dueños/admins
        if (isPoll && activeGyms.length > 0) {
          const existingIds = new Set(activeGyms.map(g => g.id));
          const newGyms = data.filter((g: any) => !existingIds.has(g.id));
          
          if (newGyms.length > 0) {
            newGyms.forEach((newGym: any) => {
              toast.success(`✨ ¡Nueva academia detectada en tiempo real: "${newGym.name}"!`, {
                description: `Ubicación: ${newGym.address || 'Hercix Suite'}`,
                icon: '📍',
              });
            });
          }
        }
        
        activeGyms = data;
        setGyms(data);
      } catch (err) {
        console.error('Error al sincronizar locales en tiempo real:', err);
      } finally {
        if (!isPoll) setLoading(false);
      }
    };

    loadGyms();

    // Sincronización en tiempo real de alta frecuencia (cada 6 segundos)
    const interval = setInterval(() => {
      loadGyms(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // ─── Motor de Ruta Real con OSRM + Inteligencia Comercial ─────────────────
  const fetchRealRoute = async (gymLat: number, gymLng: number) => {
    try {
      setLoadingRoute(true);
      const startLng = userCoords[1];
      const startLat = userCoords[0];
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${gymLng},${gymLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        const distKm = route.distance / 1000;
        const baseETA = Math.round(route.duration / 60);
        const walkingMin = Math.max(2, Math.round((distKm / 5) * 60));

        let stepText = 'Avanzar recto hacia el destino.';
        if (route.legs?.[0]?.steps?.length > 1) {
          const named = route.legs[0].steps
            .filter((s: any) => s.name?.trim())
            .map((s: any) => {
              const mod = s.maneuver.modifier;
              const dir = mod === 'right' ? 'derecha' : mod === 'left' ? 'izquierda' : '';
              return dir ? `Girar a la ${dir} por ${s.name}` : `Continuar por ${s.name}`;
            });
          if (named.length) stepText = named.slice(0, 3).join('. ') + '.';
        }

        const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
        const commercial = calculateCommercialMobility(distKm, baseETA, gyms.length, gymLat, gymLng);

        setMobilityData({
          distanceKm: distKm,
          walkingMin,
          steps: stepText,
          coordinates: coords,
          baseETA: commercial.baseETA,
          commercialETA: commercial.commercialETA,
          trafficLevel: commercial.trafficLevel,
          trafficFactor: commercial.trafficFactor,
          peakHour: commercial.peakHour,
          commercialFlow: commercial.commercialFlow,
          accessibility: commercial.accessibility,
          mobilityScore: commercial.mobilityScore,
        });
      } else {
        applyFallbackMobility(gymLat, gymLng);
      }
    } catch {
      applyFallbackMobility(gymLat, gymLng);
    } finally {
      setLoadingRoute(false);
    }
  };

  const applyFallbackMobility = (gymLat: number, gymLng: number) => {
    const R = 6371;
    const dLat = (gymLat - userCoords[0]) * Math.PI / 180;
    const dLon = (gymLng - userCoords[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(userCoords[0]*Math.PI/180)*Math.cos(gymLat*Math.PI/180)*Math.sin(dLon/2)**2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.35;
    const baseETA = Math.max(2, Math.round(distKm / 25 * 60));
    const walkingMin = Math.max(5, Math.round(distKm / 5 * 60));
    const commercial = calculateCommercialMobility(distKm, baseETA, gyms.length, gymLat, gymLng);
    setMobilityData({
      distanceKm: distKm,
      walkingMin,
      steps: 'Incorporarse a las avenidas principales de la zona hacia el local.',
      coordinates: [userCoords, [gymLat, gymLng]],
      baseETA: commercial.baseETA,
      commercialETA: commercial.commercialETA,
      trafficLevel: commercial.trafficLevel,
      trafficFactor: commercial.trafficFactor,
      peakHour: commercial.peakHour,
      commercialFlow: commercial.commercialFlow,
      accessibility: commercial.accessibility,
      mobilityScore: commercial.mobilityScore,
    });
  };

  const handleNearbySearch = () => {
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización'); return; }
    setLoading(true); setUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCenterMap([latitude, longitude]);
        setUserCoords([latitude, longitude]);
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
    
    // Disparar motor de inteligencia comercial
    if (gym.latitude && gym.longitude) {
      fetchRealRoute(gym.latitude, gym.longitude);
    } else {
      setMobilityData(null);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MapIcon className="text-primary-light" /> 
              {user?.role === 'ADMIN' ? 'Mapa de Cobertura Ecosistema' :
               user?.role === 'GYM_OWNER' ? 'Análisis de Competidores y Mercado' :
               user?.role === 'TRAINER' ? 'Directorio de Centros Deportivos' : 'Buscar Academias y Gimnasios'}
            </h1>
            <p className="text-slate-400 mt-1">
              {user?.role === 'ADMIN' ? 'Audita y supervisa la distribución geográfica de los negocios de Hercix.' :
               user?.role === 'GYM_OWNER' ? 'Monitorea la densidad de gimnasios y ubica oportunidades de expansión en el mapa.' :
               user?.role === 'TRAINER' ? 'Explora gimnasios aliados y ubicaciones para expandir tu red de alumnos.' :
               'Encuentra el lugar perfecto para entrenar cerca de ti.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:items-center">
            {user?.role === 'GYM_OWNER' && (
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full shrink-0 text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
                🎯 MODO GEOMARKETING ACTIVO
              </div>
            )}
            {user?.role === 'TRAINER' && (
              <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full shrink-0 text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
                💼 RED DE LOCACIONES ACTIVA
              </div>
            )}
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full shrink-0 max-w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Tiempo Real Activo</span>
            </div>
          </div>
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
              attribution={mapLayer === 'dark' 
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              }
              url={mapLayer === 'dark'
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              } 
            />

            {/* Pulsing User Current Location Marker (San Isidro Center) */}
            <Marker position={[-12.085, -77.03]} icon={userLocationIcon}>
              <Popup className="custom-popup">
                <div className="p-1.5 min-w-[100px] text-center">
                  <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                    🔵 Mi Ubicación
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Sede Central Hercix</span>
                </div>
              </Popup>
            </Marker>

            {/* Ruta por calles reales — solo GYM_OWNER */}
            {user?.role === 'GYM_OWNER' && selectedGym && mobilityData && mobilityData.coordinates.length > 0 && (
              <Polyline
                positions={mobilityData.coordinates}
                color={mobilityData.mobilityScore >= 71 ? '#22c55e' : mobilityData.mobilityScore >= 41 ? '#f59e0b' : '#ef4444'}
                weight={4}
                opacity={0.9}
                className="animate-route-path"
              />
            )}

            {filtered.filter(g => g.latitude && g.longitude).map(gym => {
              const sportInfo = SPORT_FILTERS.find(f => f.value !== '' && gym.name.includes(f.value));
              return (
                <Marker 
                  key={gym.id} 
                  position={[gym.latitude, gym.longitude]}
                  icon={getCustomIcon(sportInfo?.label || '📍')}
                  eventHandlers={{
                    click: () => handleSelectGym(gym)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[150px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{sportInfo?.label.split(' ')[0] || '📍'}</span>
                        <strong className="text-slate-900 text-sm leading-tight">{gym.name}</strong>
                      </div>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {gym.address}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button 
                          onClick={() => handleSelectGym(gym)} 
                          className="bg-slate-900 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                        >
                          Detalles
                        </button>
                        <a 
                          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${gym.latitude},${gym.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          Street View
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Layer Toggle Button */}
          <button 
            onClick={() => setMapLayer(l => l === 'dark' ? 'satellite' : 'dark')}
            className="absolute bottom-6 right-6 z-[400] w-14 h-14 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl hover:scale-110 active:scale-95 transition-all group"
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors z-10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter shadow-lg">Capas</span>
            </div>
            <img 
              src={mapLayer === 'dark' 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/18525/11252" 
                : "https://a.basemaps.cartocdn.com/dark_all/15/18525/11252.png"
              } 
              alt="Toggle Layer"
              className="w-full h-full object-cover"
            />
          </button>
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
            filtered.map(gym => {
              const sportInfo = SPORT_FILTERS.find(f => f.value !== '' && gym.name.includes(f.value));
              const emoji = sportInfo?.label.split(' ')[0] || '📍';
              
              return (
                <motion.div whileHover={{ x: 3 }} key={gym.id}
                  onClick={() => handleSelectGym(gym)}
                  className="glass-card p-4 border-white/5 hover:border-primary/30 cursor-pointer transition-all flex gap-3.5 items-start">
                  
                  {/* Glowing Premium Category Icon */}
                  <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-xl select-none">{emoji}</span>
                    <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm opacity-50"></div>
                  </div>

                  <div className="min-w-0 flex-grow">
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
                      {user?.role === 'GYM_OWNER' ? (
                        <span className="text-indigo-400 font-bold">Analizar Local →</span>
                      ) : user?.role === 'TRAINER' ? (
                        <span className="text-cyan-400 font-bold">Ver Instalaciones →</span>
                      ) : (
                        <span className="text-primary-light font-bold">Ver clases →</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
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
                    <div className="flex gap-2 mt-3">
                      <a 
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedGym.latitude},${selectedGym.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition-all"
                      >
                        📍 Street View 360°
                      </a>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedGym.latitude},${selectedGym.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-primary/10 text-primary-light border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                      >
                        🚗 Cómo llegar
                      </a>
                    </div>

                    {/* ═══ PANEL GEOMARKETING INTELLIGENCE — Solo GYM_OWNER ═══ */}
                    {user?.role === 'GYM_OWNER' && (
                      <div className="mt-4 space-y-3">

                        {loadingRoute ? (
                          <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            <span>Calculando inteligencia comercial...</span>
                          </div>
                        ) : mobilityData ? (
                          <>
                            {/* Mobility Score Banner */}
                            {(() => {
                              const s = mobilityData.mobilityScore;
                              const label = s >= 71 ? 'Movilidad Alta' : s >= 41 ? 'Movilidad Media' : 'Movilidad Baja';
                              const bg = s >= 71 ? 'bg-green-500/10 border-green-500/30' : s >= 41 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30';
                              const text = s >= 71 ? 'text-green-400' : s >= 41 ? 'text-yellow-400' : 'text-red-400';
                              return (
                                <div className={`${bg} border rounded-xl p-3 flex items-center justify-between`}>
                                  <div className="flex items-center gap-2">
                                    <BarChart2 className={`w-4 h-4 ${text}`} />
                                    <div>
                                      <p className={`text-[10px] font-bold uppercase tracking-widest ${text}`}>🧠 Mobility Score</p>
                                      <p className="text-white font-bold text-xs mt-0.5">{label}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-3xl font-black ${text}`}>{s}</p>
                                    <p className="text-slate-500 text-[9px]">/100</p>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* 6-Factor Grid */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                                <p className="text-slate-400 text-[9px] mb-0.5">📍 Distancia</p>
                                <p className="text-white font-bold text-xs">~ {mobilityData.distanceKm.toFixed(1)} km</p>
                              </div>
                              <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                                <p className="text-slate-400 text-[9px] mb-0.5">🚗 Tiempo Comercial</p>
                                <p className="text-white font-bold text-xs">{mobilityData.commercialETA} mins</p>
                              </div>
                              <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                                <p className="text-slate-400 text-[9px] mb-0.5">🏃 Caminando</p>
                                <p className="text-white font-bold text-xs">{mobilityData.walkingMin} mins</p>
                              </div>
                              <div className={`border rounded-lg p-2 text-center ${
                                mobilityData.trafficLevel === 'alto' ? 'bg-red-500/10 border-red-500/20' :
                                mobilityData.trafficLevel === 'moderado' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                'bg-green-500/10 border-green-500/20'
                              }`}>
                                <p className="text-slate-400 text-[9px] mb-0.5">🚦 Tráfico</p>
                                <p className={`font-bold text-xs capitalize ${
                                  mobilityData.trafficLevel === 'alto' ? 'text-red-400' :
                                  mobilityData.trafficLevel === 'moderado' ? 'text-yellow-400' : 'text-green-400'
                                }`}>{mobilityData.trafficLevel}</p>
                              </div>
                              <div className={`border rounded-lg p-2 text-center ${
                                mobilityData.commercialFlow === 'alto' ? 'bg-indigo-500/10 border-indigo-500/20' :
                                mobilityData.commercialFlow === 'medio' ? 'bg-blue-500/10 border-blue-500/20' :
                                'bg-slate-500/10 border-slate-500/20'
                              }`}>
                                <p className="text-slate-400 text-[9px] mb-0.5">📈 Flujo Comercial</p>
                                <p className={`font-bold text-xs capitalize ${
                                  mobilityData.commercialFlow === 'alto' ? 'text-indigo-400' :
                                  mobilityData.commercialFlow === 'medio' ? 'text-blue-400' : 'text-slate-400'
                                }`}>{mobilityData.commercialFlow}</p>
                              </div>
                              <div className={`border rounded-lg p-2 text-center ${
                                mobilityData.accessibility === 'alta' ? 'bg-green-500/10 border-green-500/20' :
                                mobilityData.accessibility === 'media' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                'bg-red-500/10 border-red-500/20'
                              }`}>
                                <p className="text-slate-400 text-[9px] mb-0.5">⚡ Accesibilidad</p>
                                <p className={`font-bold text-xs capitalize ${
                                  mobilityData.accessibility === 'alta' ? 'text-green-400' :
                                  mobilityData.accessibility === 'media' ? 'text-yellow-400' : 'text-red-400'
                                }`}>{mobilityData.accessibility}</p>
                              </div>
                            </div>

                            {/* Peak Hour Alert */}
                            {mobilityData.peakHour && (
                              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-lg">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                <span className="text-orange-300 text-[10px] font-medium">Hora pico activa — tiempo comercial incrementado</span>
                              </div>
                            )}

                            {/* Step by Step */}
                            <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 px-3 py-2 rounded-lg">
                              <Navigation2 className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5 rotate-45" />
                              <span className="text-slate-300 text-[10px] leading-relaxed">{mobilityData.steps}</span>
                            </div>

                            {/* Intelligence Questions */}
                            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3">
                              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Inteligencia Comercial
                              </p>
                              <ul className="space-y-1.5">
                                {[
                                  { q: '¿Conviene abrir aquí?', a: mobilityData.mobilityScore >= 60 ? '✅ Sí, buena movilidad' : '⚠️ Analizar con cuidado' },
                                  { q: '¿Los clientes llegarán rápido?', a: mobilityData.commercialETA <= 15 ? '✅ Sí, acceso rápido' : mobilityData.commercialETA <= 30 ? '🟡 Tiempo moderado' : '🔴 Acceso lento' },
                                  { q: '¿Existe saturación comercial?', a: gyms.length > 5 ? '🔴 Alta densidad de competidores' : gyms.length > 2 ? '🟡 Competencia moderada' : '✅ Zona poco saturada' },
                                  { q: '¿Buena accesibilidad vial?', a: mobilityData.accessibility === 'alta' ? '✅ Alta accesibilidad' : mobilityData.accessibility === 'media' ? '🟡 Accesibilidad media' : '🔴 Accesibilidad limitada' },
                                ].map((item, i) => (
                                  <li key={i} className="flex flex-col">
                                    <span className="text-slate-500 text-[9px]">{item.q}</span>
                                    <span className="text-white text-[10px] font-semibold">{item.a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p className="text-slate-500 text-[10px] italic text-center py-3">Sin datos de movilidad para este local.</p>
                        )}
                      </div>
                    )}

                    {selectedGym.description && <p className="text-slate-400 text-sm mt-4 line-clamp-2">{selectedGym.description}</p>}
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
                            {(!user || user.role === 'USER') && (
                              <button
                                onClick={() => initiateBooking(cls.id, cls.title, Number(cls.price))}
                                disabled={bookingId === cls.id}
                                className="mt-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1">
                                {bookingId === cls.id ? (
                                  <><Loader2 className="w-3 h-3 animate-spin" /> Reservando...</>
                                ) : '✅ Reservar'}
                              </button>
                            )}
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

      {/* Localized styles for dynamic delivery-style maps path animation */}
      <style>{`
        @keyframes routeDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-route-path {
          stroke-dasharray: 8, 8;
          animation: routeDash 1.2s linear infinite !important;
        }
      `}</style>
    </div>
  );
};

export default MapSearchPage;
