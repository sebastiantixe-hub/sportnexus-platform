import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, X, Loader2, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/api-client';

// Reemplazar con clave real pública en producción de Stripe (desde el env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

interface PayMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
}

const CheckoutForm: React.FC<{
  amount: number;
  description: string;
  onSuccess: () => void;
  clientSecret: string | null;
}> = ({ amount, description, onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setErrorMsg('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Si estás usando `client_secret` falso (modo sandbox en local sin STRIPE_SECRET_KEY)
    if (clientSecret === 'pi_dummy_secret_dummy') {
       setTimeout(() => {
         setLoading(false);
         setSuccess(true);
         setTimeout(() => {
            onSuccess();
         }, 1500);
       }, 2000);
       return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Ocurrió un error con la tarjeta.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"
        >
          <ShieldCheck className="w-8 h-8" />
        </motion.div>
        <h3 className="text-xl font-bold text-slate-800">¡Pago Exitoso!</h3>
        <p className="text-slate-500 text-sm">Transacción aprobada y verificada</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm mb-1">{description}</p>
        <p className="text-3xl font-extrabold text-slate-800">${amount.toFixed(2)}</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <label className="block text-slate-700 text-sm font-bold mb-3">
          Datos de la Tarjeta Segura (Stripe)
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full mt-6 bg-[#002f5b] hover:bg-[#002242] text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Procesando pago...
          </>
        ) : (
          `Pagar $${amount.toFixed(2)} Seguro`
        )}
      </button>

      <div className="text-center mt-4">
         <img src="https://pay-me.com/wp-content/uploads/2020/09/Recurso-3.png" alt="Pay-Me Logo" className="h-6 mx-auto opacity-50 grayscale" onError={(e) => e.currentTarget.style.display = 'none'} />
         <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1"><Lock className="w-2 h-2" /> Powered by Stripe</p>
      </div>
    </form>
  );
};

export const PayMeModal: React.FC<PayMeModalProps> = ({ isOpen, onClose, onSuccess, amount, description }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && amount > 0) {
      // Pedir intencion de pago al backend
      api.post('/payments/create-intent', { amount, description })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        })
        .catch((err) => {
          console.error("Error pidiendo client secret:", err);
        });
    } else {
      setClientSecret(null);
    }
  }, [isOpen, amount, description]);

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
                  <CreditCard className="w-6 h-6" /> Pay-Me
                </h2>
                <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Transacción en Vivo Segmentada
                </p>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    amount={amount} 
                    description={description} 
                    onSuccess={onSuccess} 
                    clientSecret={clientSecret} 
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-[#002f5b] animate-spin" />
                  <p className="text-slate-500 text-sm">Conectando con el banco (Stripe)...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
