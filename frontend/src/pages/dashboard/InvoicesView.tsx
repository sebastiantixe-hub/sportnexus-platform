import React from 'react';
import { ArrowLeft, FileText, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoicesView: React.FC = () => {
  const navigate = useNavigate();

  const invoices = [
    { id: 'INV-398123', date: '2026-04-01', amount: '$142,800', status: 'PAID', plan: 'Plan Estándar' },
    { id: 'INV-392012', date: '2026-03-01', amount: '$142,800', status: 'PAID', plan: 'Plan Estándar' },
    { id: 'INV-388291', date: '2026-02-01', amount: '$142,800', status: 'PAID', plan: 'Plan Estándar' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Facturación</h1>
          <p className="text-slate-400 text-sm">Historial de pagos y soporte de suscripciones.</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Tus Facturas Generadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-black/20 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4">No. Factura</th>
                <th scope="col" className="px-6 py-4">Fecha</th>
                <th scope="col" className="px-6 py-4">Concepto</th>
                <th scope="col" className="px-6 py-4">Monto Total</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" /> {inv.id}
                  </td>
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4">{inv.plan}</td>
                  <td className="px-6 py-4 font-bold text-white">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> Pagado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-primary-light hover:text-white transition-colors">
                      <Download className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesView;
