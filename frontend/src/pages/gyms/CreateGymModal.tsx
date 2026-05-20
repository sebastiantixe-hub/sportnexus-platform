import React, { useState } from 'react';
import api from '../../api/api-client';
import { X, Loader2, Dumbbell, MapPin, Phone, Globe, Plus, Clock, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreateGymModalProps {
  onClose: () => void;
  onCreated: () => void;
  initialData?: any;
}

const DAYS_OPTIONS = [
  'Lunes a Viernes',
  'Lunes a Sábado',
  'Lunes a Domingo',
  'Martes a Domingo',
  'Solo Fines de Semana',
];

const TIME_OPTIONS = [
  '04:00 AM', '05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
  '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM',
];

const CreateGymModal: React.FC<CreateGymModalProps> = ({ onClose, onCreated, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    province: initialData?.province || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    openDays: initialData?.openDays || 'Lunes a Sábado',
    openTime: initialData?.openTime || '06:00 AM',
    closeTime: initialData?.closeTime || '10:00 PM',
    logoUrl: initialData?.logoUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData) {
        await api.patch(`/gyms/${initialData.id}`, formData);
      } else {
        await api.post('/gyms', formData);
      }
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el gimnasio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg bg-slate-900 border-white/10 p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Dumbbell className="text-primary-light" /> {initialData ? 'Editar Gimnasio' : 'Registrar Mi Gimnasio'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border-red-500/20 p-4 border rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nombre del Gimnasio / Academia</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none"
              placeholder="Ej: Elite Fitness Center"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none min-h-[80px]"
              placeholder="Cuenta un poco sobre tu gimnasio..."
            />
          </div>

          {/* Imagen de Portada / Logo (URL) */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>🖼️ URL de Imagen de Portada / Logo</span>
              <span className="text-[10px] text-slate-500 normal-case">(Opcional - link de imagen de internet)</span>
            </label>
            <input
              value={formData.logoUrl}
              onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
              className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none"
              placeholder="Ej: https://images.unsplash.com/... o un link local"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Dirección Física</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light w-4 h-4" />
              <input
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 pl-12 pr-4 border rounded-xl text-white outline-none"
                placeholder="Av. Principal 123, Ciudad"
              />
            </div>
          </div>

          {/* Departamento, Provincia, Distrito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Departamento</label>
              <input
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none"
                placeholder="Ej: Lima"
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Provincia</label>
              <input
                value={formData.province}
                onChange={e => setFormData({ ...formData, province: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none"
                placeholder="Ej: Lima"
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Distrito</label>
              <input
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none"
                placeholder="Ej: Chorrillos"
              />
            </div>
          </div>

          {/* Teléfono y Web */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light w-4 h-4" />
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 pl-12 pr-4 border rounded-xl text-white outline-none"
                  placeholder="+51 987..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sitio Web</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light w-4 h-4" />
                <input
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 pl-12 pr-4 border rounded-xl text-white outline-none"
                  placeholder="www.tusitio.com"
                />
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="space-y-3 border-t border-white/10 pt-5">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-light" /> Horario de Atención
            </label>

            {/* Días */}
            <div className="space-y-2">
              <label className="text-slate-500 text-xs">Días de apertura</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light w-4 h-4" />
                <select
                  value={formData.openDays}
                  onChange={e => setFormData({ ...formData, openDays: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 pl-12 pr-4 border rounded-xl text-white outline-none appearance-none"
                >
                  {DAYS_OPTIONS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                </select>
              </div>
            </div>

            {/* Apertura y Cierre */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-500 text-xs">Hora de apertura</label>
                <select
                  value={formData.openTime}
                  onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none appearance-none"
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-xs">Hora de cierre</label>
                <select
                  value={formData.closeTime}
                  onChange={e => setFormData({ ...formData, closeTime: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-primary-light w-full py-3 px-4 border rounded-xl text-white outline-none appearance-none"
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> <span>{initialData ? 'Guardar Cambios' : 'Crear Gimnasio'}</span></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGymModal;
