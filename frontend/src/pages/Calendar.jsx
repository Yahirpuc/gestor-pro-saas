import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Flag,
  Plus,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EventModal from '../components/modals/EventModal';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { EVENT_TYPES, eventTypeStyles, t } from '../lib/constants';
import { cn, daysUntil, formatDate, relativeDue } from '../lib/utils';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const typeIcons = {
  Deadline: Clock,
  Payment: Wallet,
  Meeting: Users,
  Milestone: Flag,
};

function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Calendar() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => api.events.list(), []);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedType, setSelectedType] = useState('All');
  const [modal, setModal] = useState({ open: false, event: null, date: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const events = data || [];
  const today = new Date();

  const filtered = useMemo(
    () => events.filter((e) => selectedType === 'All' || e.type === selectedType),
    [events, selectedType]
  );

  const matrix = useMemo(() => buildMonthMatrix(cursor.year, cursor.month), [cursor]);
  const monthEvents = filtered.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === cursor.year && d.getMonth() === cursor.month;
  });

  const upcoming = useMemo(
    () =>
      filtered
        .filter((e) => daysUntil(e.date) >= 0 && !e.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6),
    [filtered]
  );

  const shiftMonth = (delta) => {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const toggleCompleted = async (event) => {
    try {
      await api.events.patch(event.id, { completed: !event.completed });
      refetch({ silent: true });
      toast(event.completed ? 'Marcado como pendiente' : 'Marcado como completado');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.events.remove(toDelete.id);
      toast('Evento eliminado');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const paymentTotal = monthEvents
    .filter((e) => e.type === 'Payment')
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="Agenda" title="Calendario" subtitle="Entregas, hitos de pago, reuniones y milestones del proyecto." />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Calendario"
        subtitle="Entregas, hitos de pago, reuniones y milestones del proyecto."
        actions={
          <button className="btn-primary" onClick={() => setModal({ open: true, event: null, date: null })}>
            <Plus size={16} /> Nuevo evento
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1.5">
          <button className="icon-btn border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={17} />
          </button>
          <button className="icon-btn border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]" onClick={() => shiftMonth(1)}>
            <ChevronRight size={17} />
          </button>
          <h2 className="ml-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            {MONTHS[cursor.month]} <span className="text-zinc-400">{cursor.year}</span>
          </h2>
          <button
            className="btn-ghost ml-1 h-8 px-2.5 py-1 text-xs"
            onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
          >
            Hoy
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white/60 p-1 dark:border-white/[0.07] dark:bg-white/[0.02]">
          {['All', ...EVENT_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition',
                selectedType === type
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {type === 'All' ? 'Todos' : t(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/60 dark:border-white/[0.06] dark:bg-white/[0.015]">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d[0]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {matrix.map((day, i) => {
              const inMonth = day.getMonth() === cursor.month;
              const isToday = sameDay(day, today);
              const dayEvents = filtered.filter((e) => sameDay(new Date(e.date), day));
              return (
                <div
                  key={i}
                  onClick={() => setModal({ open: true, event: null, date: day })}
                  className={cn(
                    'group relative min-h-[92px] cursor-pointer border-b border-r border-zinc-100 p-1.5 transition last:border-r-0 dark:border-white/[0.05] sm:min-h-[112px] sm:p-2',
                    !inMonth && 'bg-zinc-50/40 dark:bg-white/[0.01]',
                    'hover:bg-brand-500/[0.03] dark:hover:bg-white/[0.03]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                        isToday
                          ? 'bg-brand-600 text-white'
                          : inMonth
                            ? 'text-zinc-600 dark:text-zinc-300'
                            : 'text-zinc-300 dark:text-zinc-600'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-medium text-zinc-400">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => {
                      const meta = eventTypeStyles[event.type];
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ open: true, event, date: null });
                          }}
                          className={cn(
                            'flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium transition hover:brightness-110',
                            meta.badge,
                            event.completed && 'line-through opacity-50'
                          )}
                        >
                          <span className={cn('h-1 w-1 shrink-0 rounded-full', meta.dot)} />
                          <span className="hidden truncate sm:inline">{event.title}</span>
                          <span className="sm:hidden">•</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="pl-1.5 text-[9px] text-zinc-400">+{dayEvents.length - 2} más</p>
                    )}
                  </div>

                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 opacity-0 transition group-hover:opacity-100">
                    <Plus size={11} className="text-zinc-400" />
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-[10px] text-zinc-400">
            {EVENT_TYPES.map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', eventTypeStyles[type].dot)} /> {t(type)}
              </span>
            ))}
            {paymentTotal > 0 && (
              <span className="ml-auto font-medium text-emerald-500">
                Pagos del mes: 
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">Próximos</h3>
              <Badge className="border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {upcoming.length} eventos
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No hay eventos próximos" description="Añade una entrega o reunión." />
            ) : (
              <div className="space-y-1">
                {upcoming.map((event) => {
                  const Icon = typeIcons[event.type] || Clock;
                  const due = relativeDue(event.date);
                  return (
                    <div
                      key={event.id}
                      className="group flex items-start gap-2.5 rounded-xl px-1.5 py-2 transition hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          eventTypeStyles[event.type].badge
                        )}
                      >
                        <Icon size={13} />
                      </span>
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setModal({ open: true, event, date: null })}
                      >
                        <p className="truncate text-[12px] font-medium text-zinc-800 dark:text-zinc-100">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {formatDate(event.date, { year: undefined })} ·{' '}
                          <span
                            className={cn(
                              due.tone === 'danger' && 'text-rose-500',
                              due.tone === 'warning' && 'text-amber-500'
                            )}
                          >
                            {due.label}
                          </span>
                        </p>
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          className="icon-btn h-6 w-6 text-emerald-500"
                          onClick={() => toggleCompleted(event)}
                          title="Marcar como completado"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          className="icon-btn h-6 w-6 hover:text-rose-500"
                          onClick={() => setToDelete(event)}
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-zinc-900 dark:text-white">
              <CircleAlert size={14} className="text-amber-500" /> Requiere atención
            </h3>
            {filtered.filter((e) => daysUntil(e.date) < 0 && !e.completed).length === 0 ? (
              <p className="text-xs text-zinc-400">Nada vencido. Vas al día 🚀</p>
            ) : (
              <div className="space-y-2">
                {filtered
                  .filter((e) => daysUntil(e.date) < 0 && !e.completed)
                  .slice(0, 4)
                  .map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setModal({ open: true, event: e, date: null })}
                      className="flex w-full items-center justify-between gap-2 rounded-lg bg-rose-500/[0.06] px-2.5 py-2 text-left"
                    >
                      <span className="truncate text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {e.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-rose-500">
                        {Math.abs(daysUntil(e.date))}d de retraso
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventModal
        open={modal.open}
        event={modal.event}
        defaultDate={modal.date}
        onClose={() => setModal({ open: false, event: null, date: null })}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar evento"
        message={`¿Eliminar “${toDelete?.title}”?`}
      />
    </div>
  );
}
