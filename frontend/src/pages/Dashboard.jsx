import {
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  FileCheck2,
  FolderKanban,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, CardsSkeleton, EmptyState, ProgressBar, Skeleton, Avatar } from '../components/ui';
import StatCard from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import {
  avatarGradient,
  cn,
  compactCurrency,
  currency,
  formatDate,
  formatDateTime,
  relativeDue,
} from '../lib/utils';
import { eventTypeStyles, projectStatusStyles, t } from '../lib/constants';

const STATUS_COLORS = {
  Backlog: '#a1a1aa',
  'In Progress': '#38bdf8',
  'In Review': '#fbbf24',
  Completed: '#34d399',
};

const KIND_LABELS = {
  project: 'Proyecto',
  contract: 'Contrato',
  proposal: 'Propuesta',
  event: 'Evento',
};

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/10 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#16171f]/95">
      {label && <p className="mb-1 font-medium text-zinc-500 dark:text-zinc-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold text-zinc-800 dark:text-zinc-100">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function Panel({ title, subtitle, action, children, className, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('card p-5 sm:p-6', className)}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const { user, company } = useAuth();
  const displayName = user?.firstName || user?.name?.split(' ')[0] || 'Usuario';
  const { data, loading } = useApi(
    () =>
      Promise.all([
        api.dashboard.summary(),
        api.dashboard.activity(),
        api.projects.list(),
        api.events.upcoming(21),
      ]),
    []
  );

  const [summary, activity, projects, upcoming] = data || [];
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axis = isDark ? '#71717a' : '#a1a1aa';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] rounded-2xl" />
          ))}
        </div>
        <CardsSkeleton count={3} />
      </div>
    );
  }

  const activeProjects = (projects || []).filter((p) => p.status !== 'Completed');
  const workloadData = (summary?.workload || []).map((w) => ({
    name: t(w.status),
    budget: w.budget,
    count: w.count,
    status: w.status,
  }));
  const pieData = (summary?.workload || [])
    .filter((w) => w.count > 0)
    .map((w) => ({ ...w, label: t(w.status) }));

  // Serie acumulada de demostración a partir del pipeline real.
  const revenueSeries = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'].map((month, i) => ({
    month,
    signed: Math.round((summary?.revenue.signed || 0) * (0.35 + i * 0.09)),
    pipeline: Math.round((summary?.revenue.pipeline || 0) * (0.4 + i * 0.08)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
            <Sparkles size={11} /> Resumen del espacio
          </div>
          <h1 className="page-title">
            {greeting}, {displayName} <span className="inline-block">👋</span>
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · Tienes {summary?.projects.active || 0} proyectos activos y {summary?.upcomingEvents || 0}{' '}
            fechas próximas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/projects" className="btn-outline">
            <FolderKanban size={16} /> Proyectos
          </Link>
          <Link to="/clients" className="btn-primary">
            <Plus size={16} /> Nuevo cliente
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Proyectos activos"
          value={summary?.projects.active ?? 0}
          sub={`${summary?.projects.completed ?? 0} completados · ${summary?.projects.avgProgress ?? 0}% de progreso medio`}
          accent="brand"
          delay={0.02}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Ingresos estimados"
          value={compactCurrency(summary?.revenue.estimated)}
          sub={`${currency(summary?.revenue.pipeline)} en pipeline abierto`}
          accent="emerald"
          delay={0.06}
        />
        <StatCard
          icon={FileCheck2}
          label="Contratos firmados"
          value={summary?.contracts.signed ?? 0}
          sub={`${compactCurrency(summary?.revenue.signed)} en valor contratado`}
          accent="sky"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          label="Clientes activos"
          value={summary?.clients.active ?? 0}
          sub={`${summary?.clients.total ?? 0} en total en el CRM`}
          accent="violet"
          delay={0.14}
        />
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Presupuesto por etapa"
          subtitle="Distribución del presupuesto en tu pipeline"
          className="xl:col-span-2"
          action={
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-brand-500"
            >
              Ver todo <ArrowUpRight size={13} />
            </Link>
          }
          delay={0.06}
        >
          <div className="h-[248px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} barSize={38} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: axis }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axis }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => compactCurrency(v)}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                  content={<ChartTooltip formatter={(v) => currency(v)} />}
                />
                <Bar dataKey="budget" name="Presupuesto" radius={[8, 8, 4, 4]}>
                  {workloadData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={
                        entry.status === 'Completed'
                          ? '#34d399'
                          : entry.status === 'In Review'
                            ? '#fbbf24'
                            : entry.status === 'In Progress'
                              ? '#38bdf8'
                              : '#818cf8'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Carga de trabajo" subtitle="Proyectos por estado" delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="relative h-[168px] w-[168px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#818cf8'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  {summary?.projects.total ?? 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">proyectos</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {(summary?.workload || []).map((w) => (
                <div key={w.status} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: STATUS_COLORS[w.status] }}
                  />
                  <span className="flex-1 truncate text-zinc-500 dark:text-zinc-400">{t(w.status)}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{w.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Progreso medio</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {summary?.projects.avgProgress ?? 0}%
              </span>
            </div>
            <ProgressBar value={summary?.projects.avgProgress || 0} className="mt-2" />
          </div>
        </Panel>
      </div>

      {/* Evolución + próximos */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Evolución de ingresos"
          subtitle="Firmado vs. pipeline (acumulado)"
          className="xl:col-span-2"
          delay={0.14}
        >
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="signed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} dy={8} />
                <YAxis
                  tick={{ fontSize: 11, fill: axis }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => compactCurrency(v)}
                />
                <Tooltip content={<ChartTooltip formatter={(v) => currency(v)} />} />
                <Area
                  type="monotone"
                  dataKey="signed"
                  name="Firmado"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#signed)"
                />
                <Area
                  type="monotone"
                  dataKey="pipeline"
                  name="Pipeline"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#pipeline)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Próximas fechas"
          subtitle="Próximos 21 días"
          delay={0.18}
          action={
            <Link to="/calendar" className="text-xs font-medium text-brand-500 hover:text-brand-400">
              Calendario
            </Link>
          }
        >
          {(!upcoming || upcoming.length === 0) && (
            <EmptyState
              icon={CalendarClock}
              title="Nada programado"
              description="Añade hitos, pagos o reuniones."
            />
          )}
          <div className="space-y-1">
            {(upcoming || []).slice(0, 5).map((event) => {
              const due = relativeDue(event.date);
              const meta = eventTypeStyles[event.type];
              return (
                <div
                  key={event.id}
                  className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                >
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', meta.badge)}>
                    {new Date(event.date).getDate()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                      {event.title}
                    </p>
                    <p className="truncate text-[11px] text-zinc-400">
                      {t(event.type)} · {formatDate(event.date, { year: undefined })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-[10px] font-medium',
                      due.tone === 'danger'
                        ? 'text-rose-500'
                        : due.tone === 'warning'
                          ? 'text-amber-500'
                          : 'text-zinc-400'
                    )}
                  >
                    {due.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Proyectos + actividad */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Proyectos activos"
          subtitle={`${activeProjects.length} en curso`}
          className="xl:col-span-2"
          delay={0.22}
          action={
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-brand-500"
            >
              Abrir tablero <ArrowUpRight size={13} />
            </Link>
          }
        >
          {activeProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No hay proyectos activos"
              description="Crea tu primer proyecto para empezar."
            />
          ) : (
            <div className="space-y-2.5">
              {activeProjects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-zinc-200/70 hover:bg-zinc-50/60 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.02]"
                >
                  <Avatar
                    name={project.client?.name || project.title}
                    gradient={avatarGradient(project.client?.name || project.title)}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                        {project.title}
                      </p>
                      <Badge className={projectStatusStyles[project.status]}>{t(project.status)}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={project.progress} className="max-w-[180px]" />
                      <span className="text-[10px] text-zinc-400">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                      {compactCurrency(project.budget)}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      entrega {formatDate(project.endDate, { year: undefined })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Actividad reciente" subtitle="En todo tu espacio" delay={0.26}>
          <div className="relative space-y-4 pl-1">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-white/10 dark:via-white/10" />
            {(activity || []).slice(0, 6).map((item, i) => {
              const dot =
                item.kind === 'project'
                  ? 'bg-brand-500'
                  : item.kind === 'contract'
                    ? 'bg-emerald-500'
                    : item.kind === 'proposal'
                      ? 'bg-sky-500'
                      : 'bg-amber-500';
              const [rawKind, rawStatus] = (item.subtitle || '').split('·').map((s) => s.trim());
              const subtitle = `${KIND_LABELS[item.kind] || rawKind}${rawStatus ? ` · ${t(rawStatus)}` : ''}`;
              return (
                <div key={`${item.kind}-${item.id}-${i}`} className="relative flex gap-3">
                  <span className={cn('relative z-10 mt-1 h-[7px] w-[7px] shrink-0 rounded-full ring-4 ring-zinc-50 dark:ring-[#08090c]', dot)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-400">{subtitle}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-600">
                      {formatDateTime(item.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
