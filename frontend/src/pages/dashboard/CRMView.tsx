import React, { useState } from 'react';
import { ArrowLeft, Send, Mail, Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CRMView: React.FC = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing y CRM</h1>
          <p className="text-slate-400 text-sm">Fideliza a tus atletas con notificaciones y correos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary-light" /> Nueva Campaña
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Asunto</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-light transition-colors" placeholder="Ej. ¡20% Descuento en Tienda!" required />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Tipo de Mensaje</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-light appearance-none">
                <option value="EMAIL">Correo Electrónico a todos</option>
                <option value="PUSH">Notificación Push a la app</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Contenido</label>
              <textarea rows={5} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-light transition-colors" placeholder="Escribe el cuerpo del mensaje..." required />
            </div>
            <button type="submit" className="w-full btn-primary flex justify-center items-center gap-2 py-3 rounded-xl">
              <Send className="w-4 h-4" /> Enviar Campaña
            </button>
            {success && (
              <p className="text-green-400 text-sm font-bold flex items-center gap-2 justify-center mt-3">
                <CheckCircle className="w-4 h-4" /> ¡Campaña encolada con éxito!
              </p>
            )}
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary-light" /> Historial de Campañas
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold text-sm">Bienvenida Diciembre</h3>
              <span className="text-[10px] text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full uppercase font-bold">Enviada</span>
            </div>
            <p className="text-slate-400 text-xs line-clamp-2">Hola a todos, gracias por preferirnos. Este mes tendremos eventos especiales...</p>
            <p className="text-primary-light text-xs mt-3 font-semibold">124 Receptores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMView;
