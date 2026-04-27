import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Watch, Activity, Flame, HeartPulse, RefreshCw,
  CheckCircle2, Unplug, Wifi, WifiOff, Footprints, Moon,
  Zap, AlertCircle, ExternalLink, Loader2, TrendingUp,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api-client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface FitbitStatus {
  connected: boolean;
  provider?: string;
  fitbitUserId?: string;
  tokenExpiry?: string;
  isExpired?: boolean;
  scope?: string;
  connectedSince?: string;
  lastSync?: string;
}

interface MetricData {
  steps: number;
  calories: number;
  heartRateAvg: number | null;
  distance?: number;
  activeMinutes?: number;
  sleepMinutes?: number | null;
  date: string;
}

interface WearableMetric {
  id: string;
  date: string;
  steps: number;
  calories: number;
  heartRateAvg: number | null;
  deviceType: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fitbit Callback Handler Component
// ─────────────────────────────────────────────────────────────────────────────
export const FitbitCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast.error(`Fitbit rechazó la autorización: ${error}`);
        setTimeout(() => navigate('/dashboard/wearables'), 2500);
        return;
      }

      if (!code) {
        setStatus('error');
        toast.error('No se recibió el código de autorización de Fitbit');
        setTimeout(() => navigate('/dashboard/wearables'), 2500);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/dashboard/wearables/fitbit-callback`;
        await api.post('/wearables/fitbit/callback', { code, redirect_uri: redirectUri });

        // Auto-sync after connecting
        await api.post('/wearables/fitbit/sync');

        setStatus('success');
        toast.success('¡Fitbit conectado! Datos sincronizados correctamente.');
        setTimeout(() => navigate('/dashboard/wearables'), 2000);
      } catch (err: any) {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Error conectando Fitbit');
        setTimeout(() => navigate('/dashboard/wearables'), 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-6 p-8">
        {status === 'processing' && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary-light animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white">Conectando Fitbit...</h2>
            <p className="text-slate-400">Procesando tu autorización y sincronizando datos.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">¡Fitbit Conectado!</h2>
            <p className="text-slate-400">Redirigiendo a tu dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Error de Conexión</h2>
            <p className="text-slate-400">Redirigiendo de regreso...</p>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main WearablesView
// ─────────────────────────────────────────────────────────────────────────────
const WearablesView: React.FC = () => {
  const navigate = useNavigate();
  const [fitbitStatus, setFitbitStatus] = useState<FitbitStatus>({ connected: false });
  const [latestSync, setLatestSync] = useState<MetricData | null>(null);
  const [history, setHistory] = useState<WearableMetric[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // ── Load data on mount ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [statusRes, metricsRes] = await Promise.all([
        api.get('/wearables/fitbit/status'),
        api.get('/wearables/metrics'),
      ]);
      setFitbitStatus(statusRes.data);
      if (metricsRes.data && metricsRes.data.length > 0) {
        const latest = metricsRes.data[0];
        setLatestSync({
          steps: latest.steps,
          calories: latest.calories,
          heartRateAvg: latest.heartRateAvg,
          date: latest.date,
        });
        setHistory(metricsRes.data);
      }
    } catch (err) {
      console.error('Error loading wearables data', err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Connect Fitbit (OAuth2 flow) ─────────────────────────────────────────
  const handleConnectFitbit = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/dashboard/wearables/fitbit-callback`;
      const { data } = await api.get(`/wearables/fitbit/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      // Redirect the browser to Fitbit authorization page
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error iniciando conexión con Fitbit');
      setConnecting(false);
    }
  };

  // ── Sync now ─────────────────────────────────────────────────────────────
  const handleSync = async () => {
    if (!fitbitStatus.connected) {
      toast.error('Conecta tu Fitbit primero');
      return;
    }
    setSyncing(true);
    try {
      const { data } = await api.post('/wearables/fitbit/sync');
      setLatestSync(data.data);
      toast.success('¡Datos sincronizados desde Fitbit API en tiempo real!');
      await loadAll();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error sincronizando';
      toast.error(msg);
      if (msg.includes('expirado') || msg.includes('inválido')) {
        setFitbitStatus({ connected: false });
      }
    } finally {
      setSyncing(false);
    }
  };

  // ── Disconnect ───────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!window.confirm('¿Desconectar Fitbit? Se revocarán los tokens de acceso.')) return;
    setDisconnecting(true);
    try {
      await api.delete('/wearables/fitbit/disconnect');
      setFitbitStatus({ connected: false });
      setLatestSync(null);
      toast.success('Fitbit desconectado correctamente');
    } catch {
      toast.error('Error al desconectar');
    } finally {
      setDisconnecting(false);
    }
  };

  // ── BLE fallback ─────────────────────────────────────────────────────────
  const handleBluetooth = async () => {
    try {
      if (!(navigator as any).bluetooth) {
        toast.error('Tu navegador no soporta Web Bluetooth. Usa Chrome en Android/Windows.');
        return;
      }
      setSyncing(true);
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', async (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const hr = flags & 0x1 ? value.getUint16(1, true) : value.getUint8(1);

        await api.post('/wearables/sync', {
          deviceType: device.name || 'BLE_HEART_RATE_MONITOR',
          steps: latestSync?.steps || 0,
          calories: latestSync?.calories || 0,
          heartRateAvg: hr,
        });
        await loadAll();
        toast.success(`Ritmo cardíaco: ${hr} bpm sincronizado vía Bluetooth`);
      });
      toast.success(`Dispositivo BLE "${device.name}" conectado`);
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        toast.error('Error BLE: ' + err.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

  const tokenExpiryLabel = () => {
    if (!fitbitStatus.tokenExpiry) return null;
    const exp = new Date(fitbitStatus.tokenExpiry);
    const diff = exp.getTime() - Date.now();
    if (diff < 0) return <span className="text-red-400 text-xs">Token expirado</span>;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    return (
      <span className="text-green-400 text-xs">
        Token válido por {days > 0 ? `${days} días` : `${hours} horas`}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Wearables
            <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 tracking-wider font-bold">
              OAUTH2 REAL
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Conecta tu Fitbit con OAuth2 oficial y sincroniza datos reales de actividad.
          </p>
        </div>
      </div>

      {/* Connection Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-8 border relative overflow-hidden ${
          fitbitStatus.connected
            ? 'bg-gradient-to-r from-primary/10 to-slate-900 border-primary/30'
            : 'bg-gradient-to-r from-slate-800 to-slate-900 border-white/10'
        }`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Watch className="w-48 h-48 text-white" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Device Icon */}
          <div className={`p-5 rounded-2xl border ${
            fitbitStatus.connected ? 'bg-primary/10 border-primary/30' : 'bg-slate-800 border-white/10'
          }`}>
            {fitbitStatus.connected ? (
              <Wifi className="w-10 h-10 text-primary-light" />
            ) : (
              <WifiOff className="w-10 h-10 text-slate-500" />
            )}
          </div>

          {/* Status Info */}
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">
                {fitbitStatus.connected ? 'Fitbit Conectado' : 'Sin Dispositivo Conectado'}
              </h2>
              {fitbitStatus.connected && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">Activo</span>
                </span>
              )}
            </div>

            {fitbitStatus.connected ? (
              <div className="space-y-0.5">
                <p className="text-slate-400 text-sm">
                  ID Fitbit: <span className="text-white font-mono">{fitbitStatus.fitbitUserId || '—'}</span>
                </p>
                <div>{tokenExpiryLabel()}</div>
                {fitbitStatus.lastSync && (
                  <p className="text-slate-500 text-xs">
                    Última sync: {new Date(fitbitStatus.lastSync).toLocaleString('es-CO')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Conecta tu cuenta Fitbit con OAuth2 oficial para sincronizar pasos, calorías y ritmo cardíaco reales.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {fitbitStatus.connected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all ${
                    syncing ? 'bg-slate-700 text-slate-400' : 'btn-primary'
                  }`}
                >
                  {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-2 font-bold py-3 px-5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                >
                  {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
                  Desconectar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnectFitbit}
                  disabled={connecting || loadingStatus}
                  className="flex items-center gap-2 font-bold py-3 px-6 rounded-xl btn-primary transition-all"
                >
                  {connecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  {connecting ? 'Abriendo Fitbit...' : 'Conectar con Fitbit'}
                </button>
                <button
                  onClick={handleBluetooth}
                  className="flex items-center gap-2 font-bold py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                >
                  <Activity className="w-5 h-5 text-blue-400" />
                  Bluetooth BLE
                </button>
              </>
            )}
          </div>
        </div>

        {/* OAuth Flow Explainer (if not connected) */}
        {!fitbitStatus.connected && !loadingStatus && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: 'Haz click en "Conectar con Fitbit"' },
              { step: '2', label: 'Autoriza SportNexus en la página de Fitbit' },
              { step: '3', label: 'Tus datos se sincronizan automáticamente' },
            ].map(({ step, label }) => (
              <div key={step} className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary-light font-bold text-sm flex items-center justify-center mx-auto">
                  {step}
                </div>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Metrics Grid */}
      <AnimatePresence>
        {latestSync && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-light" />
                Métricas de Hoy
                <span className="text-slate-500 text-sm font-normal">
                  — {formatDate(latestSync.date)}
                </span>
              </h3>
              <span className="text-[10px] text-primary-light bg-primary/10 px-2 py-1 rounded-full border border-primary/20 font-bold">
                FITBIT API OFICIAL
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Footprints,
                  label: 'Pasos',
                  value: latestSync.steps.toLocaleString('es-CO'),
                  color: 'blue',
                  goal: '10,000',
                  pct: Math.min((latestSync.steps / 10000) * 100, 100),
                },
                {
                  icon: Flame,
                  label: 'Calorías',
                  value: `${latestSync.calories.toLocaleString('es-CO')} kcal`,
                  color: 'orange',
                  goal: '2,500 kcal',
                  pct: Math.min((latestSync.calories / 2500) * 100, 100),
                },
                {
                  icon: HeartPulse,
                  label: 'Ritmo Cardíaco',
                  value: latestSync.heartRateAvg ? `${latestSync.heartRateAvg} bpm` : '— bpm',
                  color: 'red',
                  goal: 'Promedio',
                  pct: latestSync.heartRateAvg ? Math.min((latestSync.heartRateAvg / 180) * 100, 100) : 0,
                },
                {
                  icon: latestSync.activeMinutes !== undefined ? Zap : Moon,
                  label: latestSync.activeMinutes !== undefined ? 'Minutos Activos' : 'Sueño',
                  value: latestSync.activeMinutes !== undefined
                    ? `${latestSync.activeMinutes} min`
                    : latestSync.sleepMinutes
                    ? `${Math.floor(latestSync.sleepMinutes / 60)}h ${latestSync.sleepMinutes % 60}m`
                    : '— h',
                  color: 'purple',
                  goal: '30 min',
                  pct: latestSync.activeMinutes !== undefined
                    ? Math.min((latestSync.activeMinutes / 30) * 100, 100)
                    : 0,
                },
              ].map(({ icon: Icon, label, value, color, goal, pct }) => {
                const colorMap: Record<string, string> = {
                  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                  red: 'text-red-400 bg-red-500/10 border-red-500/20',
                  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                };
                const barMap: Record<string, string> = {
                  blue: 'bg-blue-500',
                  orange: 'bg-orange-500',
                  red: 'bg-red-500',
                  purple: 'bg-purple-500',
                };
                return (
                  <div key={label} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colorMap[color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Meta: {goal}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${barMap[color]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History (last 7 days) */}
      {history.length > 1 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary-light" />
            Historial — Últimos 7 días
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-slate-500 uppercase">
              <span>Fecha</span>
              <span className="text-center">Pasos</span>
              <span className="text-center">Calorías</span>
              <span className="text-center">Ritmo Card.</span>
            </div>
            {history.map((metric, i) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <span className="text-slate-300 text-sm">{formatDate(metric.date)}</span>
                <span className="text-center text-white font-bold text-sm">{metric.steps.toLocaleString()}</span>
                <span className="text-center text-white font-bold text-sm">{metric.calories.toLocaleString()}</span>
                <span className={`text-center font-bold text-sm ${metric.heartRateAvg ? 'text-red-400' : 'text-slate-600'}`}>
                  {metric.heartRateAvg ? `${metric.heartRateAvg} bpm` : '—'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {!loadingStatus && !latestSync && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-16 text-center">
          <Watch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Sin datos de actividad</h3>
          <p className="text-slate-400 text-sm">
            {fitbitStatus.connected
              ? 'Haz click en "Sincronizar Ahora" para obtener tus métricas de hoy.'
              : 'Conecta tu Fitbit para empezar a registrar tu actividad diaria.'}
          </p>
        </div>
      )}

      {/* Webhook reference */}
      <div className="bg-black/40 rounded-2xl border border-white/5 p-5">
        <p className="text-slate-500 text-xs font-mono mb-2 font-bold">// Webhook manual (sin Fitbit):</p>
        <code className="text-green-400 text-xs font-mono break-all">
          curl -X POST {window.location.origin.replace('5173', '3000')}/api/wearables/sync \<br />
          {'  '}-H "Authorization: Bearer TU_JWT" \<br />
          {'  '}-H "Content-Type: application/json" \<br />
          {'  '}-d '{"{ \"deviceType\": \"WEBHOOK\", \"steps\": 9400, \"calories\": 520, \"heartRateAvg\": 88 }"}'
        </code>
      </div>
    </div>
  );
};

export default WearablesView;
