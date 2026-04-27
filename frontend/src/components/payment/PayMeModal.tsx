import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, X, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../api/api-client';

declare global {
  interface Window {
    AlignetVPOS2: any;
  }
}

interface PayMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
}

export const PayMeModal: React.FC<PayMeModalProps> = ({ isOpen, onClose, onSuccess, amount, description }) => {
  const [loading, setLoading] = useState(false);
  const [paymeData, setPaymeData] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && amount > 0) {
      setLoading(true);
      setSuccess(false);
      // Pedir datos de firma de seguridad al backend
      api.post('/payments/create-intent', { amount, description })
        .then((res) => {
          setPaymeData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error pidiendo firma de Payme:", err);
          setLoading(false);
        });
    } else {
      setPaymeData(null);
    }
  }, [isOpen, amount, description]);

  const handlePaymeClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymeData) return;
    
    // Alignet Pay-me usa una libreria global que lee el form con clase "alignet-form-vpos2"
    if (window.AlignetVPOS2) {
       window.AlignetVPOS2.openModal('https://integracion.alignetsac.com/');
    } else {
       console.error("Pay-me Modal script no está cargado");
    }
    
    // NOTA: En ambiente local / sin ngrok, el webhook de Pay-me no nos va a notificar.
    // Para esta presentación simularé el Success después de 4 segundos.
    setTimeout(() => {
      // Si el modal VPOS2 devuelve evento de cierre o success se manejaria aca, simulamos exito para la demo local
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    }, 4500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="bg-[#002f5b] p-6 text-white flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6" /> Pay-me
                </h2>
                <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Autorización Segura (VPOS2)
                </p>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
               {success ? (
                 <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"
                    >
                      <ShieldCheck className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">¡Pago Exitoso!</h3>
                    <p className="text-slate-500 text-sm text-center">Transacción procesada correctamente por Pay-me</p>
                 </div>
               ) : loading ? (
                 <div className="flex flex-col items-center justify-center py-10 gap-3">
                   <Loader2 className="w-8 h-8 text-[#002f5b] animate-spin" />
                   <p className="text-slate-500 text-sm">Generando firma encriptada...</p>
                 </div>
               ) : paymeData ? (
                 <div className="space-y-6">
                    <div className="mb-6 pb-6 border-b border-slate-100 text-center">
                      <p className="text-slate-500 text-sm mb-1">{description}</p>
                      <p className="text-3xl font-extrabold text-slate-800">S/ {amount.toFixed(2)}</p>
                    </div>

                    <form 
                      id="f1" 
                      name="f1" 
                      action="#" 
                      method="post" 
                      className="alignet-form-vpos2"
                      onSubmit={handlePaymeClick}
                      ref={formRef}
                    >
                        {/* Campos obligatorios del Checkout Pay-me */}
                        <input type="hidden" name="acquirerId" value={paymeData.acquirerId} />
                        <input type="hidden" name="idCommerce" value={paymeData.idCommerce} />
                        <input type="hidden" name="purchaseOperationNumber" value={paymeData.purchaseOperationNumber} />
                        <input type="hidden" name="purchaseAmount" value={paymeData.purchaseAmount} />
                        <input type="hidden" name="purchaseCurrencyCode" value={paymeData.purchaseCurrencyCode} />
                        <input type="hidden" name="purchaseVerification" value={paymeData.purchaseVerification} />
                        
                        <button
                          type="submit"
                          className="w-full bg-[#002f5b] hover:bg-[#002242] text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                           <CreditCard className="w-5 h-5" /> Pagar Seguro con Pay-me
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                       <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" /> Transacción certificada por Alignet
                       </p>
                    </div>
                 </div>
               ) : (
                 <p className="text-center text-red-500">Ocurrió un error de conexión.</p>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
