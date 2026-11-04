import {
  BookOpen,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Moon,
  Palette,
  Server,
  Sun,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, PDF_SERVICE_URL } from '../lib/api';
import { cn } from '../lib/utils';

const statusLabel = (status) =>
  status === 'online' ? 'En línea' : status === 'checking' ? 'Comprobando' : 'Fuera de línea';

function StatusRow({ icon: Icon, label, status, detail }) {
  const ok = status === 'online';
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/[0.05] dark:text-zinc-400">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
        <p className="truncate text-[11px] text-zinc-400">{detail}</p>
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
          ok
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : status === 'checking'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-zinc-500/10 text-zinc-500'
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-emerald-500' : status === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-400')} />
        {statusLabel(status)}
      </span>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { company, refreshCompany } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');
  const [pdfStatus, setPdfStatus] = useState('checking');

  const [companyName, setCompanyName] = useState(company?.name || 'Orbit');
  const [tagline, setTagline] = useState(company?.tagline || '');
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyMsg, setCompanyMsg] = useState('');

  useEffect(() => {
    setCompanyName(company?.name || 'Orbit');
    setTagline(company?.tagline || '');
  }, [company]);

  useEffect(() => {
    let alive = true;
    api
      .health()
      .then(() => alive && setApiStatus('online'))
      .catch(() => alive && setApiStatus('offline'));

    fetch(`${PDF_SERVICE_URL}/health`)
      .then((r) => (r.ok ? setPdfStatus('online') : setPdfStatus('offline')))
      .catch(() => setPdfStatus('offline'));

    return () => {
      alive = false;
    };
  }, []);

  const saveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    setCompanyMsg('');
    try {
      await api.company.update({ name: companyName, tagline });
      await refreshCompany();
      setCompanyMsg('Guardado');
    } catch (err) {
      setCompanyMsg(err.message || 'Error');
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Preferencias"
        title="Ajustes"
        subtitle="Personaliza la apariencia, los datos de tu empresa y revisa el estado de los servicios."
      />

      <div className="space-y-5">
        {/* Empresa */}
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={17} className="text-brand-500" />
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Empresa</h2>
          </div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            El nombre de tu empresa se muestra en la barra lateral, la barra superior y en los documentos.
          </p>
          <form onSubmit={saveCompany} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Nombre de la empresa</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="field w-full"
                placeholder="Orbit"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Eslogan (opcional)</label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="field w-full"
                placeholder="Software Studio"
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={savingCompany}>
                {savingCompany && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                Guardar
              </button>
              {companyMsg && <span className="text-xs text-emerald-500">{companyMsg}</span>}
            </div>
          </form>
        </section>

        {/* Apariencia */}
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Palette size={17} className="text-brand-500" />
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Apariencia</h2>
          </div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Elige cómo se ve la aplicación. El modo oscuro es el tema por defecto para desarrolladores.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                value: 'dark',
                label: 'Oscuro',
                description: 'Bajo brillo y alto contraste, pensado para largas sesiones.',
                icon: Moon,
                preview: 'bg-[#0b0c10] border-white/10',
                bar: 'bg-white/10',
              },
              {
                value: 'light',
                label: 'Claro',
                description: 'Interfaz limpia y nítida para trabajar de día.',
                icon: Sun,
                preview: 'bg-zinc-100 border-zinc-300',
                bar: 'bg-zinc-300',
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'relative rounded-2xl border p-4 text-left transition-all',
                    active
                      ? 'border-brand-500/50 bg-brand-500/[0.04] ring-4 ring-brand-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20'
                  )}
                >
                  <div className={cn('mb-3 h-20 rounded-xl border p-2.5', opt.preview)}>
                    <div className={cn('h-2.5 w-16 rounded-full', opt.bar)} />
                    <div className="mt-2 flex gap-1.5">
                      <div className={cn('h-8 w-8 rounded-lg', opt.bar)} />
                      <div className={cn('h-8 flex-1 rounded-lg', opt.bar)} />
                    </div>
                    <div className={cn('mt-1.5 h-1.5 w-24 rounded-full', opt.bar)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={active ? 'text-brand-500' : 'text-zinc-400'} />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{opt.label}</p>
                    {active && <CheckCircle2 size={14} className="ml-auto text-brand-500" />}
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Estado del sistema */}
        <section className="card p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <Server size={17} className="text-brand-500" />
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Estado del sistema</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
            <StatusRow
              icon={Server}
              label="API Node.js"
              status={apiStatus}
              detail="Express · http://localhost:4000/api"
            />
            <StatusRow
              icon={Database}
              label="Base de datos SQLite"
              status={apiStatus === 'online' ? 'online' : 'offline'}
              detail="Sequelize ORM · database.sqlite local"
            />
            <StatusRow
              icon={Code2}
              label="Servicio Python de PDF"
              status={pdfStatus}
              detail={`FastAPI · ${PDF_SERVICE_URL}`}
            />
          </div>
        </section>

        {/* Stack */}
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={17} className="text-brand-500" />
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Stack y documentación</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Frontend', value: 'React 19 · Vite · Tailwind · Framer Motion' },
              { label: 'Backend', value: 'Node.js · Express 5 · Sequelize (MVC)' },
              { label: 'Base de datos', value: 'SQLite (capa de abstracción lista para Supabase)' },
              { label: 'Servicio auxiliar', value: 'Python · FastAPI · ReportLab (PDF)' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-100 p-3.5 dark:border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{item.label}</p>
                <p className="mt-1 text-[13px] text-zinc-700 dark:text-zinc-200">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="http://localhost:4000/api/clients"
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs"
            >
              <ExternalLink size={13} /> Endpoint de clientes (API)
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs"
            >
              <ExternalLink size={13} /> Documentación del servicio Python
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/60 p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            <strong className="text-zinc-700 dark:text-zinc-200">Espacio de demostración.</strong> La autenticación
            se omite intencionalmente en la fase de desarrollo. La capa de datos vive tras los modelos de Sequelize,
            por lo que migrar a Supabase Postgres solo requiere cambiar la configuración de conexión en{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-white/10">
              backend/src/config/database.js
            </code>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
