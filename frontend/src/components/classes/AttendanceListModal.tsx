import React, { useState } from 'react';
import api from '../../api/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Clock, Users, CheckCircle, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: any;
  onSuccess: () => void;
}

const AttendanceListModal: React.FC<AttendanceListModalProps> = ({ isOpen, onClose, classItem, onSuccess }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localReservations, setLocalReservations] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize local state when modal opens
  if (isOpen && !initialized && classItem?.reservations) {
    setLocalReservations(classItem.reservations);
    setInitialized(true);
  }
  if (!isOpen && initialized) {
    setInitialized(false);
    setLocalReservations([]);
  }

  const handleMarkPresent = async (reservationId: string) => {
    try {
      setLoadingId(reservationId);
      await api.patch(`/classes/reservations/${reservationId}/attend`);
      
      // Update local state immediately (optimistic UI)
      setLocalReservations(prev =>
        prev.map(r => r.id === reservationId ? { ...r, status: 'ATTENDED' } : r)
      );
      
      toast.success('¡Asistencia marcada!');
      onSuccess(); // Refresh parent
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al marcar asistencia');
    } finally {
      setLoadingId(null);
    }
  };

  const confirmed = localReservations.filter(r => r.status === 'CONFIRMED');
  const attended = localReservations.filter(r => r.status === 'ATTENDED');
  const total = localReservations.length;

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/10 border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl">
                    <ClipboardList className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Lista de Asistencia</h2>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{classItem?.title}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">{total} reservados</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-bold">{attended.length} presentes</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400">{confirmed.length} pendientes</span>
                </div>
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div className="mt-3 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(attended.length / total) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  />
                </div>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {total === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Users className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-slate-400 font-medium">Nadie ha reservado esta clase aún.</p>
                  <p className="text-slate-600 text-xs mt-1">Cuando los atletas reserven, aparecerán aquí.</p>
                </div>
              ) : (
                localReservations.map(reservation => {
                  const isAttended = reservation.status === 'ATTENDED';
                  const isLoading = loadingId === reservation.id;

                  return (
                    <div
                      key={reservation.id}
                      className={`flex items-center justify-between p-4 transition-colors ${isAttended ? 'bg-green-500/5' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${isAttended ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-slate-800 border-white/10 text-primary-light'}`}>
                          {reservation.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm leading-tight">
                            {reservation.user?.name || 'Atleta'}
                          </p>
                          <p className={`text-xs font-semibold mt-0.5 ${isAttended ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isAttended ? '✅ Asistió' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isAttended ? (
                        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-xs font-bold">Presente</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkPresent(reservation.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {isLoading ? 'Guardando...' : 'Marcar Presente'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-4 bg-slate-900/80">
              <button
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttendanceListModal;
