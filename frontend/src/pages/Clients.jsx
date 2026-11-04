import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ClientModal from '../components/modals/ClientModal';
import {
  Avatar,
  Badge,
  CardsSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  ProgressBar,
  SearchInput,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { CLIENT_STATUSES, clientStatusStyles, projectStatusStyles, t } from '../lib/constants';
import { avatarGradient, cn, compactCurrency, currency, formatDate, sum } from '../lib/utils';

function ClientDrawer({ clientId, onClose, onEdit }) {
  const { data: client, loading } = useApi(
    () => (clientId ? api.clients.get(clientId) : Promise.resolve(null)),
    [clientId]
  );

  const projectBudget = sum(client?.projects || [], (p) => p.budget);
  const contractValue = sum(client?.contracts || [], (c) => c.amount);

  return (
    <AnimatePresence>
      {clientId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d0e13]"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-white/[0.06]">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Ficha del cliente</p>
              <div className="flex items-center gap-1">
                <button onClick={onEdit} className="icon-btn" title="Editar cliente">
                  <Pencil size={16} />
                </button>
                <button onClick={onClose} className="icon-btn" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading || !client ? (
                <div className="space-y-4">
                  <div className="skeleton h-20 w-full rounded-2xl" />
                  <div className="skeleton h-32 w-full rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={client.name}
                      gradient={avatarGradient(client.name)}
                      size="lg"
                      className="h-14 w-14 text-base"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
                        {client.name}
                      </h2>
                      <p className="truncate text-sm text-zinc-500">{client.company || 'Independiente'}</p>
                      <Badge className={cn('mt-1.5', clientStatusStyles[client.status])}>
                        {t(client.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-zinc-100 p-3.5 dark:border-white/[0.06]">
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-2.5 text-sm text-zinc-600 transition hover:text-brand-500 dark:text-zinc-300"
                    >
                      <Mail size={15} className="text-zinc-400" /> {client.email}
                    </a>
                    {client.phone && (
                      <p className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                        <Phone size={15} className="text-zinc-400" /> {client.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <Building2 size={15} className="text-zinc-400" /> {client.company || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Proyectos', value: client.projects?.length || 0 },
                      { label: 'Propuestas', value: client.proposals?.length || 0 },
                      { label: 'Contratos', value: client.contracts?.length || 0 },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-white/[0.03]">
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Finanzas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-zinc-100 p-3 dark:border-white/[0.06]">
                        <p className="text-[11px] text-zinc-400">Presupuesto de proyectos</p>
                        <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {currency(projectBudget)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-zinc-100 p-3 dark:border-white/[0.06]">
                        <p className="text-[11px] text-zinc-400">Valor de contratos</p>
                        <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {currency(contractValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Proyectos
                    </h3>
                    {(client.projects || []).length === 0 && (
                      <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400 dark:border-white/10">
                        Todavía no hay proyectos vinculados.
                      </p>
                    )}
                    <div className="space-y-2">
                      {(client.projects || []).map((p) => (
                        <div key={p.id} className="rounded-xl border border-zinc-100 p-3 dark:border-white/[0.06]">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                              {p.title}
                            </p>
                            <Badge className={projectStatusStyles[p.status]}>{t(p.status)}</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <ProgressBar value={p.progress} />
                            <span className="text-[10px] text-zinc-400">{p.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {client.notes && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notas</h3>
                      <p className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-3.5 text-sm leading-relaxed text-zinc-600 dark:bg-white/[0.03] dark:text-zinc-300">
                        {client.notes}
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400">
                    Añadido el {formatDate(client.createdAt)} · Última actualización {formatDate(client.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Clients() {
  const { toast } = useToast();
  const { data: clients, loading, error, refetch } = useApi(() => api.clients.list(), []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState({ open: false, client: null });
  const [detailId, setDetailId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const list = clients || [];
    const q = search.toLowerCase().trim();
    return list.filter((c) => {
      const matchStatus = filter === 'All' || c.status === filter;
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [clients, search, filter]);

  const counts = useMemo(() => {
    const list = clients || [];
    return {
      All: list.length,
      Active: list.filter((c) => c.status === 'Active').length,
      Prospect: list.filter((c) => c.status === 'Prospect').length,
      Inactive: list.filter((c) => c.status === 'Inactive').length,
    };
  }, [clients]);

  const totalPipeline = sum(
    (clients || []).flatMap((c) => c.projects || []),
    (p) => p.budget
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.clients.remove(toDelete.id);
      toast('Cliente eliminado');
      setToDelete(null);
      if (detailId === toDelete.id) setDetailId(null);
      refetch();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="CRM" title="Clientes" subtitle="Gestiona contactos, empresas y relaciones." />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Clientes"
        subtitle="Gestiona contactos, empresas y relaciones en un solo lugar."
        actions={
          <button className="btn-primary" onClick={() => setModal({ open: true, client: null })}>
            <Plus size={16} /> Nuevo cliente
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Clientes totales', value: counts.All, accent: 'text-zinc-900 dark:text-white' },
          { label: 'Activos', value: counts.Active, accent: 'text-emerald-500' },
          { label: 'Prospectos', value: counts.Prospect, accent: 'text-amber-500' },
          {
            label: 'Valor de la cartera',
            value: compactCurrency(totalPipeline),
            accent: 'text-brand-500',
          },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{s.label}</p>
            <p className={cn('mt-1 text-xl font-semibold tracking-tight', s.accent)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white/60 p-1 dark:border-white/[0.07] dark:bg-white/[0.02]">
          {['All', ...CLIENT_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                filter === status
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {status === 'All' ? 'Todos' : t(status)} <span className="opacity-60">{counts[status] ?? 0}</span>
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar clientes..."
          className="w-full sm:w-64"
        />
      </div>

      {loading ? (
        <CardsSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay clientes"
          description={
            search || filter !== 'All'
              ? 'Prueba con otro término de búsqueda o filtro.'
              : 'Añade tu primer cliente para empezar a registrar proyectos y contratos.'
          }
          action={
            <button className="btn-primary" onClick={() => setModal({ open: true, client: null })}>
              <UserPlus size={16} /> Añadir cliente
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client, i) => (
            <motion.article
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setDetailId(client.id)}
              className="card card-hover group cursor-pointer p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar name={client.name} gradient={avatarGradient(client.name)} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                    {client.name}
                  </p>
                  <p className="truncate text-xs text-zinc-400">{client.company || 'Independiente'}</p>
                </div>
                <Badge className={clientStatusStyles[client.status]} dot={client.status === 'Active' ? 'bg-emerald-500' : undefined}>
                  {t(client.status)}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <p className="flex items-center gap-2 truncate">
                  <Mail size={13} className="shrink-0 text-zinc-400" /> {client.email}
                </p>
                {client.phone && (
                  <p className="flex items-center gap-2 truncate">
                    <Phone size={13} className="shrink-0 text-zinc-400" /> {client.phone}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={12} /> {client.projects?.length || 0}{' '}
                    {(client.projects?.length || 0) === 1 ? 'proyecto' : 'proyectos'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={12} /> {compactCurrency(sum(client.projects || [], (p) => p.budget))}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    className="icon-btn h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ open: true, client });
                    }}
                    aria-label="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="icon-btn h-7 w-7 hover:text-rose-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(client);
                    }}
                    aria-label="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <ClientModal
        open={modal.open}
        client={modal.client}
        onClose={() => setModal({ open: false, client: null })}
        onSaved={refetch}
      />

      <ClientDrawer
        clientId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          const client = (clients || []).find((c) => c.id === detailId);
          setDetailId(null);
          setModal({ open: true, client });
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar cliente"
        message={`¿Eliminar a “${toDelete?.name}”? Los proyectos y contratos vinculados se mantendrán, pero perderán la asociación.`}
      />
    </div>
  );
}
