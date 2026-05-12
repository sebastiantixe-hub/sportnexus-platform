import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Hash } from 'lucide-react';

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId?: string;
  classTitle?: string;
  gymName?: string;
  date?: string;
  time?: string;
  userName?: string;
  status?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  CONFIRMED: { label: 'Reserva Confirmada', color: 'text-green-400', icon: '✅' },
  ATTENDED:  { label: '¡Asististe!',         color: 'text-blue-400',  icon: '🏆' },
  CANCELLED: { label: 'Cancelada',           color: 'text-red-400',   icon: '❌' },
};

export const QrTicketModal: React.FC<ReservaModalProps> = ({
  isOpen, onClose, reservationId, classTitle, gymName, date, time, userName, status = 'CONFIRMED'
}) => {
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG['CONFIRMED'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-4xl mb-2">{statusInfo.icon}</div>
              <h2 className={`text-lg font-bold ${statusInfo.color} bg-white/10 px-4 py-1.5 rounded-full inline-block`}>
                {statusInfo.label}
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Class name */}
              <div className="text-center border-b border-white/10 pb-4">
                <h3 className="text-white font-bold text-xl">{classTitle}</h3>
                <p className="text-slate-400 text-sm mt-1 flex items-center justify-center gap-1">
                  <User className="w-3.5 h-3.5" /> {userName}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fecha</p>
                    <p className="font-semibold">{date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Hora</p>
                    <p className="font-semibold">{time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Local</p>
                    <p className="font-semibold text-sm">{gymName}</p>
                  </div>
                </div>
              </div>

              {/* Reservation ID */}
              <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-2 border border-white/5">
                <Hash className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Código de reserva</p>
                  <p className="text-slate-300 text-xs font-mono">{reservationId?.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                <p className="text-green-400 text-xs font-medium">
                  ✅ Tu lugar está reservado. Llega 5 minutos antes de la clase.
                </p>
              </div>

              <button onClick={onClose} className="btn-primary w-full py-3 text-center">
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
