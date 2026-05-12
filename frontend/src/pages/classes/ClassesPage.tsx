import React, { useState, useEffect } from 'react';
import api from '../../api/api-client';
import { useAuth } from '../../context/auth-context';
import { 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  Calendar, 
  Filter,
  Video, 
  CheckCircle2, 
  Loader2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import CreateClassModal from './CreateClassModal';
import { QrTicketModal } from '../../components/classes/QrTicketModal';
import AttendanceListModal from '../../components/classes/AttendanceListModal';

const ClassCard: React.FC<{ 
  classItem: any; 
  onBook: (id: string) => void;
  onViewTicket: (res: any, classItem: any) => void;
  onAttendanceModal: (classItem: any) => void;
  onEdit: (classItem: any) => void;
  onDelete: (id: string) => void;
  user: any;
}> = ({ classItem, onBook, onViewTicket, onAttendanceModal, onEdit, onDelete, user }) => {
  const isOnline = classItem.classType === 'ONLINE';
  
  const userReservation = classItem.reservations?.find((r: any) => r.userId === user?.id);
  const isTrainerAssigned = user?.role === 'TRAINER' && classItem.trainer?.user?.name === user?.name;
  const isOwnerClass = user?.role === 'ADMIN' || (user?.role === 'GYM_OWNER' && classItem.gym?.ownerId === user?.id);
  const canManageAttendance = isOwnerClass || isTrainerAssigned;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all flex flex-col group"
    >
      <div className="relative h-48 overflow-hidden bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-secondary/20 text-secondary-light border border-secondary/30' : 'bg-primary/20 text-primary-light border border-primary/30'}`}>
            {isOnline ? 'Online' : 'Presencial'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">{classItem.title}</h3>
          <div className="flex items-center gap-2 text-slate-300 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>{classItem.gym?.name}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow space-y-4">
        <p className="text-slate-400 text-sm line-clamp-2">{classItem.description || 'Sin descripción disponible.'}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary-light" />
            <span>{new Date(classItem.scheduledAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary-light" />
            <span>{new Date(classItem.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Users className="w-3.5 h-3.5 text-primary-light" />
            <span>{classItem.reservationsCount || 0} / {classItem.capacity}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Video className="w-3.5 h-3.5 text-primary-light" />
            <span>{classItem.durationMin} min</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-xl font-bold text-white">${Number(classItem.price).toFixed(2)}</div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isOwnerClass && (
            <>
              <button 
                onClick={() => onEdit(classItem)}
                className="text-slate-400 hover:text-white text-xs font-bold transition-all px-2"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete(classItem.id)}
                className="text-red-400 hover:text-red-300 text-xs font-bold transition-all px-2"
              >
                Eliminar
              </button>
            </>
          )}

          {canManageAttendance ? (
            <button 
              onClick={() => onAttendanceModal(classItem)}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center gap-1.5 font-medium border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Tomar Asistencia
            </button>
          ) : userReservation ? (
            <button 
              onClick={() => onViewTicket(userReservation, classItem)}
              className={`${
                userReservation.status === 'ATTENDED' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
              } py-2 px-4 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5 font-bold`}
            >
              <CheckCircle2 className="w-4 h-4" /> 
              {userReservation.status === 'ATTENDED' ? '🏆 Asististe' : '✅ Ver Reserva'}
            </button>
          ) : (
            <button 
              onClick={() => onBook(classItem.id)}
              className="btn-primary py-2 px-6 text-sm active:scale-95"
              disabled={classItem._count?.reservations >= classItem.capacity}
            >
              {classItem._count?.reservations >= classItem.capacity ? 'Agotado' : 'Reservar'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { user } = useAuth();

  // Modal states
  const [ticketModalConfig, setTicketModalConfig] = useState<any>(null);
  const [attendanceClass, setAttendanceClass] = useState<any>(null);

  const fetchClasses = async () => {
    try {
      if (user?.role === 'USER') {
        // Atleta: solo sus reservas
        const { data } = await api.get('/classes?myReservations=true');
        setClasses(data);
      } else {
        // Admin, Owner, Trainer: todas las clases
        const { data } = await api.get('/classes');
        setClasses(data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleBook = async (id: string) => {
    try {
      await api.post(`/classes/${id}/book`);
      setMessage({ type: 'success', text: '¡Reserva confirmada exitosamente!' });
      fetchClasses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al reservar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      try {
        await api.delete(`/classes/${id}`);
        setMessage({ type: 'success', text: 'Clase eliminada exitosamente.' });
        fetchClasses();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Error al eliminar.' });
      }
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleOpenTicket = (reservation: any, classItem: any) => {
    if (reservation.status === 'ATTENDED') return;
    setTicketModalConfig({
      reservationId: reservation.id,
      classTitle: classItem.title,
      gymName: classItem.gym.name,
      date: new Date(classItem.scheduledAt).toLocaleDateString(),
      time: new Date(classItem.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: user?.name,
    });
  };

  const handleOpenScanner = (classItem: any) => {
    setAttendanceClass(classItem);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {user?.role === 'USER' ? (
            <>
              <h1 className="text-3xl font-bold text-white">Mis Reservas 🎟️</h1>
              <p className="text-slate-400 mt-1">Clases que tienes reservadas. ¿Buscas más? <a href="/discovery" className="text-primary-light underline">Explorar academias →</a></p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white">Horario de Clases</h1>
              <p className="text-slate-400 mt-1">Gestiona las sesiones y reservas.</p>
            </>
          )}
        </div>
        {(user?.role === 'TRAINER' || user?.role === 'GYM_OWNER' || user?.role === 'ADMIN') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Clase</span>
          </button>
        )}
      </header>

      {(showCreateModal || editingClass) && (
        <CreateClassModal 
          initialData={editingClass}
          onClose={() => {
            setShowCreateModal(false);
            setEditingClass(null);
          }} 
          onCreated={() => {
            fetchClasses();
            setMessage({ type: 'success', text: editingClass ? '¡Clase actualizada!' : '¡Clase creada exitosamente!' });
            setEditingClass(null);
            setTimeout(() => setMessage(null), 3000);
          }} 
        />
      )}

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 /> : <Search />}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary-light outline-none transition-all"
            placeholder="Buscar por clase, disciplina o profesor..."
          />
        </div>
        <button className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white flex items-center gap-2 hover:bg-white/10 transition-all">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary w-12 h-12 animate-spin" />
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map(c => (
            <ClassCard 
              key={c.id} 
              classItem={c} 
              onBook={handleBook} 
              onViewTicket={handleOpenTicket}
              onAttendanceModal={handleOpenScanner}
              onEdit={setEditingClass}
              onDelete={handleDelete}
              user={user}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
          <Calendar className="text-slate-700 w-16 h-16 mb-4" />
          {user?.role === 'USER' ? (
            <>
              <h2 className="text-white font-bold text-xl">Aún no tienes clases reservadas</h2>
              <p className="text-slate-500 mt-2">Busca una academia y reserva tu primera clase.</p>
              <a href="/discovery" className="btn-primary mt-6 inline-flex items-center gap-2">
                🔍 Buscar Academias
              </a>
            </>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl">No hay clases disponibles</h2>
              <p className="text-slate-500 mt-2">Crea la primera clase para empezar.</p>
            </>
          )}
        </div>
      )}

      {/* QR Ticket Modal - solo para atletas */}
      <QrTicketModal
        isOpen={!!ticketModalConfig}
        onClose={() => setTicketModalConfig(null)}
        {...(ticketModalConfig || {})}
      />

      {/* Attendance List Modal - para Dueño, Trainer y Admin */}
      <AttendanceListModal
        isOpen={!!attendanceClass}
        onClose={() => setAttendanceClass(null)}
        classItem={attendanceClass}
        onSuccess={fetchClasses}
      />
    </div>
  );
};

export default ClassesPage;
