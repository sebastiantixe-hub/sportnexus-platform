import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api-client';
import { useAuth } from '../../context/auth-context';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Phone, 
  Globe, 
  Loader2,
  CheckCircle2,
  Star,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AddProductModal } from '../../components/marketplace/AddProductModal';

const GymShowroom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'plans' | 'classes'>('products');
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Owner product management state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const isOwner = user?.role === 'GYM_OWNER' || user?.role === 'ADMIN';
  const isMyGym = isOwner && gym && gym.ownerId === user?.id;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gymRes, productsRes, plansRes, classesRes] = await Promise.all([
        api.get(`/gyms/${id}`),
        api.get(`/marketplace/products?gymId=${id}`),
        api.get(`/memberships/plans?gymId=${id}`),
        api.get(`/classes?gymId=${id}`)
      ]);

      setGym(gymRes.data);
      setProducts(productsRes.data);
      setPlans(plansRes.data);
      setClasses(classesRes.data);
      
      if (productsRes.data.length > 0) setActiveTab('products');
      else if (plansRes.data.length > 0) setActiveTab('plans');
      else if (classesRes.data.length > 0) setActiveTab('classes');
      
    } catch (err) {
      console.error('Error cargando vitrina:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleBook = async (classId: string) => {
    try {
      setBookingId(classId);
      await api.post(`/classes/${classId}/book`);
      toast.success('¡Reserva confirmada exitosamente!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reservar la clase');
    } finally {
      setBookingId(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`¿Eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) return;
    try {
      setDeletingProductId(productId);
      await api.delete(`/marketplace/products/${productId}`);
      toast.success('Producto eliminado correctamente');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar producto');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleProductSuccess = async () => {
    toast.success(editingProduct ? 'Producto actualizado ✅' : '¡Producto añadido a tu tienda! ✅');
    // Refresh products
    const { data } = await api.get(`/marketplace/products?gymId=${id}`);
    setProducts(data);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!gym) return <div>Negocio no encontrado</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Owner Product Modal */}
      <AddProductModal
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        onSuccess={handleProductSuccess}
        initialData={editingProduct ? { ...editingProduct, gymId: id } : undefined}
      />

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-slate-900 group-hover:scale-105 transition-transform duration-1000">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
        </div>
        
        <div className="absolute bottom-10 left-10 right-10 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/gyms')}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm font-bold transition-all bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Negocios
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-3xl backdrop-blur-xl border border-primary/30">
                <Activity className="w-10 h-10 text-primary-light" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{gym.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-primary-light" /> {gym.city || 'Sede Central'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" /> 4.9 (Verificado)
                  </span>
                  {isMyGym && (
                    <span className="flex items-center gap-1.5 text-primary-light text-sm font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      <Settings className="w-3.5 h-3.5" /> Tu Local
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isMyGym ? (
              <button
                onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-xl hover:bg-primary-dark transition-all text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Añadir Producto
              </button>
            ) : (
              <button className="bg-white text-slate-900 font-black px-8 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all text-sm">
                Seguir Negocio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info & Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-white/5 space-y-4">
             <h3 className="text-white font-bold text-sm uppercase tracking-widest opacity-50">Información</h3>
             <p className="text-slate-400 text-sm leading-relaxed">{gym.description || 'Este negocio ofrece los mejores servicios deportivos del sector.'}</p>
             <div className="space-y-3 pt-4">
               <div className="flex items-center gap-3 text-sm text-slate-300">
                 <Phone className="w-4 h-4 text-primary-light" /> {gym.phone || '+51 900 100 200'}
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-300">
                 <Globe className="w-4 h-4 text-primary-light" /> {gym.website || 'www.negocio.com'}
               </div>
             </div>
          </div>

          <div className="glass-card p-6 border-white/5">
             <div className="flex justify-between items-center mb-4">
               <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estado</span>
               <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/20 font-black">OPEN</span>
             </div>
             <p className="text-white text-sm font-bold">Lunes a Sábado</p>
             <p className="text-slate-500 text-xs mt-1">05:00 AM - 10:00 PM</p>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 max-w-md">
            {[
              { id: 'products', label: 'Tienda', icon: ShoppingBag, count: products.length },
              { id: 'plans', label: 'Membresías', icon: CreditCard, count: plans.length },
              { id: 'classes', label: 'Clases', icon: Calendar, count: classes.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'products' && (
                <motion.div 
                  key="products" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Owner: Add Product Banner */}
                  {isMyGym && (
                    <button
                      onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                      className="w-full border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 rounded-2xl py-5 flex items-center justify-center gap-3 text-primary-light font-bold transition-all group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                      Añadir Nuevo Producto a tu Tienda
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length > 0 ? products.map(p => (
                      <div key={p.id} className="glass-card p-4 border-white/5 hover:border-primary/20 transition-all group relative">
                        {/* Owner Controls overlay */}
                        {isMyGym && (
                          <div className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-1.5 bg-slate-700 hover:bg-primary rounded-lg text-white transition-colors"
                              title="Editar producto"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              disabled={deletingProductId === p.id}
                              className="p-1.5 bg-slate-700 hover:bg-red-500 rounded-lg text-white transition-colors disabled:opacity-50"
                              title="Eliminar producto"
                            >
                              {deletingProductId === p.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                        )}

                        <div className="h-40 bg-slate-800 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-12 h-12 text-slate-700 opacity-20 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">{p.category}</span>
                        <h4 className="text-white font-bold mt-1">{p.name}</h4>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-1">{p.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xl font-black text-white">${Number(p.price).toFixed(2)}</span>
                          {!isMyGym && (
                            <button className="p-2 bg-primary/20 text-primary-light rounded-lg hover:bg-primary transition-colors hover:text-white">
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                          {isMyGym && (
                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">Stock: {p.stock ?? '—'}</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center text-slate-500 italic">
                        {isMyGym ? 'Aún no has añadido productos. ¡Usa el botón de arriba!' : 'No hay productos disponibles para este local aún.'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'plans' && (
                <motion.div 
                  key="plans" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {plans.length > 0 ? plans.map(p => (
                    <div key={p.id} className="glass-card p-8 border-white/5 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 p-8 opacity-5">
                         <CreditCard className="w-24 h-24 text-white" />
                      </div>
                      <h4 className="text-2xl font-black text-white">{p.name}</h4>
                      <p className="text-slate-400 text-sm mt-2">{p.description}</p>
                      <div className="mt-8 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white px-2">${Number(p.price).toFixed(0)}</span>
                        <span className="text-slate-500 text-sm uppercase font-bold tracking-widest">/ {p.durationDays} Días</span>
                      </div>
                      <ul className="mt-6 space-y-3">
                         {[
                           'Acceso completo a instalaciones', 
                           'Entrenador de piso corporativo', 
                           'App de seguimiento incluida'
                         ].map((f, i) => (
                           <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                             <CheckCircle2 className="w-3.5 h-3.5 text-primary-light" /> {f}
                           </li>
                         ))}
                      </ul>
                      <button className="w-full mt-8 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
                        Suscribirme Hoy
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">No hay planes de membresía activos.</div>
                  )}
                </motion.div>
              )}

              {activeTab === 'classes' && (
                <motion.div 
                  key="classes" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {classes.length > 0 ? classes.map(c => (
                    <div key={c.id} className="glass-card p-6 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-4 rounded-2xl group-hover:bg-primary/20 transition-colors">
                          <Calendar className={`w-6 h-6 ${true ? 'text-primary-light' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">{c.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {c.capacity} Cupos</span>
                            <span>•</span>
                            <span className="text-primary-light">Programado</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                        <div className="text-right">
                          <p className="text-white font-black">{new Date(c.scheduledAt).toLocaleDateString()}</p>
                          <p className="text-slate-500 text-xs uppercase font-bold">10:00 AM</p>
                        </div>
                        <button 
                          onClick={() => handleBook(c.id)}
                          disabled={bookingId === c.id}
                          className="bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center justify-center min-w-[120px]">
                          {bookingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reservar'}
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">No hay clases programadas actualmente.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymShowroom;
