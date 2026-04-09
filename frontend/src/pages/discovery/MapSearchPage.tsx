import React, { useState, useEffect } from 'react';
import api from '../../api/api-client';
import { motion } from 'framer-motion';
import { MapPin, Map as MapIcon, Navigation2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los íconos por defecto de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapSearchPage: React.FC = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocation, setUsingLocation] = useState(false);
  const [centerMap, setCenterMap] = useState<[number, number]>([-12.0464, -77.0428]);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { data } = await api.get('/gyms');
        setGyms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    
    setLoading(true);
    setUsingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCenterMap([latitude, longitude]);
        try {
          const { data } = await api.get(`/gyms/nearby?lat=${latitude}&lng=${longitude}&radius=10`);
          setGyms(data);
        } catch (err) {
          console.error('Error fetching nearby gyms:', err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
        setUsingLocation(false);
        alert('No se pudo obtener tu ubicación');
      }
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MapIcon className="text-primary-light" /> Descubrir Gimnasios
        </h1>
        <p className="text-slate-400 mt-2">Encuentra los mejores centros deportivos cerca de ti usando geolocalización.</p>
      </header>

      <div className="flex-grow flex gap-6 relative">
        {/* Real Map Container */}
        <div className="w-2/3 bg-slate-800/50 rounded-3xl border border-white/10 relative overflow-hidden hidden lg:block z-0">
          <MapContainer 
            key={centerMap.join(',')} // Force re-render on center change
            center={centerMap}
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {gyms.filter(g => g.latitude && g.longitude).map(gym => (
              <Marker key={gym.id} position={[gym.latitude, gym.longitude]}>
                <Popup>
                  <strong>{gym.name}</strong><br/>
                  {gym.address}
                </Popup>
              </Marker>
            ))}
            {/* Si no hay coordenadas, mostramos uno de ejemplo */}
            {gyms.length > 0 && gyms.every(g => !g.latitude) && (
              <Marker position={[-12.0464, -77.0428]}>
                <Popup>
                  <strong>{gyms[0].name}</strong><br/>
                  {gyms[0].address}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* List Container */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
          <div className="glass-card p-4 flex items-center justify-between border-white/5 bg-primary/10 mb-2">
            <div>
              <p className="text-white font-bold text-sm">Gimnasios Cercanos</p>
              <p className="text-primary-light text-xs">Basado en tu ubicación</p>
            </div>
            <button 
              onClick={handleNearbySearch}
              className={`p-2 rounded-lg transition-colors hover:text-white ${usingLocation ? 'bg-primary text-white animate-pulse' : 'bg-primary-dark/50 text-primary-light hover:bg-primary'}`}
              title="Buscar cerca de mí"
            >
              <Navigation2 className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
             <p className="text-slate-500 text-center py-10">Buscando señales GPS...</p>
          ) : gyms.length === 0 ? (
             <p className="text-slate-500 text-center py-10">No se encontraron gimnasios.</p>
          ) : (
            gyms.map(gym => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={gym.id} 
                className="glass-card p-5 border-white/5 hover:border-primary-light/30 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 py-1 px-3 bg-white/10 text-xs font-bold rounded-bl-xl text-primary-light">
                  A 2.5 km
                </div>
                <h3 className="text-white font-bold text-lg mb-1 pr-16">{gym.name}</h3>
                <p className="text-slate-400 text-sm mb-3 flex items-start gap-1">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{gym.address}, {gym.city}</span>
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">Valoración 4.8</span>
                  <button className="text-primary-light font-bold hover:underline">Ver detalles</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSearchPage;
