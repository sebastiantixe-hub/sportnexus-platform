import React, { useState, useEffect } from 'react';
import api from '../../api/api-client';
import { useAuth } from '../../context/auth-context';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Building, 
  Dumbbell, 
  Star,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const UsersManagementView: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'GYM_OWNER',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsersList(data);
    } catch (err) {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, role: string) => {
    if (role === 'ADMIN') {
      toast.error('No puedes eliminar a un Administrador.');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esto borrará sus gimnasios y datos asociados.')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Usuario eliminado exitosamente');
        setUsersList(usersList.filter(u => u.id !== id));
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/users', formData);
      toast.success('Usuario creado exitosamente');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'GYM_OWNER', phone: '' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const RoleBadge = ({ role }: { role: string }) => {
    const roleConfig: any = {
      ADMIN: { icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
      GYM_OWNER: { icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
      TRAINER: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
      USER: { icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    };
    const config = roleConfig[role] || roleConfig.USER;
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider w-max ${config.color} ${config.bg}`}>
        <Icon className="w-3.5 h-3.5" />
        {role.replace('_', ' ')}
      </span>
    );
  };

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-20 text-slate-400">Acceso denegado. Solo administradores.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-primary-light" /> Gestión de Usuarios
          </h1>
          <p className="text-slate-400 text-sm">Administra las cuentas de toda la plataforma.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </header>

      <div className="glass-card p-6 border-white/5">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary-light outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium px-4">Usuario</th>
                  <th className="pb-3 font-medium px-4">Rol</th>
                  <th className="pb-3 font-medium px-4">Fecha Registro</th>
                  <th className="pb-3 font-medium px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary-light border border-white/10">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-slate-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleDelete(u.id, u.role)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500 italic">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Crear Nueva Cuenta</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contraseña Inicial</label>
                  <input required type="password" minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rol</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary">
                    <option value="GYM_OWNER">Dueño de Gimnasio (GYM_OWNER)</option>
                    <option value="TRAINER">Entrenador (TRAINER)</option>
                    <option value="USER">Atleta (USER)</option>
                    <option value="ADMIN">Administrador (ADMIN)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-medium flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersManagementView;
