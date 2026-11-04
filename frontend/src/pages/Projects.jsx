import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CircleDollarSign,
  Columns3,
  FolderKanban,
  GripVertical,
  LayoutList,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProjectModal from '../components/modals/ProjectModal';
import {
  Avatar,
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  ProgressBar,
  SearchInput,
  Select,
  Skeleton,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { PROJECT_PRIORITIES, PROJECT_STATUSES, priorityStyles, projectStatusDot, projectStatusStyles, t } from '../lib/constants';
import { avatarGradient, cn, compactCurrency, formatDate, relativeDue } from '../lib/utils';

const columnAccent = {
  Backlog: 'bg-zinc-400',
  'In Progress': 'bg-sky-400',
  'In Review': 'bg-amber-400',
  Completed: 'bg-emerald-400',
};

function ProjectCard({ project, onEdit, onDelete, onDragStart, dragging }) {
  const due = relativeDue(project.endDate);
  return (
    <motion.article
      layout
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', project.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(project.id);
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dragging ? 0.4 : 1, y: 0 }}
      className="group cursor-grab rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-sm transition hover:border-zinc-300 hover:shadow-md active:cursor-grabbing dark:border-white/[0.07] dark:bg-white/[0.035] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.055]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <GripVertical size={13} className="mt-0.5 shrink-0 text-zinc-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-600" />
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
            {project.title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button className="icon-btn h-6 w-6" onClick={() => onEdit(project)} aria-label="Editar">
            <Pencil size={12} />
          </button>
          <button
            className="icon-btn h-6 w-6 hover:text-rose-500"
            onClick={() => onDelete(project)}
            aria-label="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {project.client && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <Avatar name={project.client.name} gradient={avatarGradient(project.client.name)} size="sm" className="h-5 w-5 text-[8px]" />
          <span className="truncate text-[11px] text-zinc-400">{project.client.company || project.client.name}</span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge className={priorityStyles[project.priority]}>{t(project.priority)}</Badge>
        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
          <CircleDollarSign size={11} /> {compactCurrency(project.budget)}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={11} />
            {project.endDate ? formatDate(project.endDate, { year: undefined }) : 'Sin fecha límite'}
          </span>
          <span className={cn(due.tone === 'danger' && 'font-medium text-rose-500', due.tone === 'warning' && 'text-amber-500')}>
            {project.endDate && project.status !== 'Completed' ? due.label : ''}
          </span>
        </div>
        <ProgressBar
          value={project.progress}
          tone={project.progress === 100 ? 'success' : project.progress > 60 ? 'brand' : 'warning'}
        />
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useApi(() => api.projects.list(), []);
  const [items, setItems] = useState([]);
  const [view, setView] = useState(() => localStorage.getItem('orbit-project-view') || 'board');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [modal, setModal] = useState({ open: false, project: null, status: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => {
    setItems(data || []);
  }, [data]);

  useEffect(() => {
    localStorage.setItem('orbit-project-view', view);
  }, [view]);

  const clients = useMemo(() => {
    const map = new Map();
    items.forEach((p) => {
      if (p.client) map.set(p.client.id, p.client);
    });
    return Array.from(map.values());
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((p) => {
      const okClient = clientFilter === 'All' || p.client?.id === clientFilter;
      const okPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      const okQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.client?.name || '').toLowerCase().includes(q);
      return okClient && okPriority && okQuery;
    });
  }, [items, search, clientFilter, priorityFilter]);

  const byStatus = (status) => filtered.filter((p) => p.status === status);
  const totalBudget = filtered.reduce((acc, p) => acc + Number(p.budget || 0), 0);

  const moveProject = async (id, status) => {
    const previous = items;
    setItems((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
    setDraggingId(null);
    setDropTarget(null);
    try {
      await api.projects.patch(id, { status });
      toast(`Movido a ${t(status).toLowerCase()}`, 'success', 2000);
      refetch({ silent: true });
    } catch (err) {
      setItems(previous);
      toast(err.message || 'No se pudo mover el proyecto', 'error');
    }
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    if (id) moveProject(id, status);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.projects.remove(toDelete.id);
      toast('Proyecto eliminado');
      setToDelete(null);
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
        <PageHeader eyebrow="Entrega" title="Proyectos" subtitle="Sigue el ciclo de vida de tu desarrollo de software." />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Entrega"
        title="Proyectos"
        subtitle={`${items.length} proyectos · ${compactCurrency(totalBudget)} de presupuesto total`}
        actions={
          <>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]">
              <button
                onClick={() => setView('board')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                  view === 'board'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                )}
              >
                <Columns3 size={14} /> Tablero
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                  view === 'list'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                )}
              >
                <LayoutList size={14} /> Lista
              </button>
            </div>
            <button
              className="btn-primary"
              onClick={() => setModal({ open: true, project: null, status: null })}
            >
              <Plus size={16} /> Nuevo proyecto
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar proyectos..." className="lg:w-72" />
        <div className="flex flex-1 gap-2">
          <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="w-full sm:w-auto">
            <option value="All">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-auto"
          >
            <option value="All">Todas las prioridades</option>
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No hay proyectos todavía"
          description="Crea tu primer proyecto para organizar tu flujo de desarrollo."
          action={
            <button className="btn-primary" onClick={() => setModal({ open: true, project: null, status: null })}>
              <Plus size={16} /> Crear proyecto
            </button>
          }
        />
      ) : view === 'board' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PROJECT_STATUSES.map((status) => {
            const list = byStatus(status);
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget((s) => (s === status ? null : s))}
                onDrop={(e) => onDrop(e, status)}
                className={cn(
                  'flex min-h-[220px] flex-col rounded-2xl border border-dashed border-zinc-200/80 bg-zinc-100/40 p-2.5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.015]',
                  dropTarget === status && 'border-brand-400/60 bg-brand-500/[0.06] dark:border-brand-500/40'
                )}
              >
                <div className="mb-2.5 flex items-center gap-2 px-1.5 py-1">
                  <span className={cn('h-2 w-2 rounded-full', columnAccent[status])} />
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t(status)}</p>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 shadow-sm dark:bg-white/10 dark:text-zinc-400">
                    {list.length}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => setModal({ open: true, project: null, status })}
                    className="icon-btn h-6 w-6"
                    aria-label={`Añadir proyecto a ${t(status)}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {list.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        dragging={draggingId === project.id}
                        onDragStart={setDraggingId}
                        onEdit={(p) => setModal({ open: true, project: p, status: null })}
                        onDelete={setToDelete}
                      />
                    ))}
                  </AnimatePresence>
                  {list.length === 0 && (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-200 py-8 text-[11px] text-zinc-400 dark:border-white/[0.07]">
                      Suelta proyectos aquí
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-zinc-100 bg-zinc-50/60 dark:border-white/[0.06] dark:bg-white/[0.015]">
                <tr>
                  <th className="th">Proyecto</th>
                  <th className="th">Cliente</th>
                  <th className="th">Estado</th>
                  <th className="th">Prioridad</th>
                  <th className="th">Progreso</th>
                  <th className="th">Fecha límite</th>
                  <th className="th text-right">Presupuesto</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                {filtered.map((project) => (
                  <tr key={project.id} className="group transition hover:bg-zinc-50/60 dark:hover:bg-white/[0.02]">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full', projectStatusDot[project.status])} />
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">{project.title}</span>
                      </div>
                    </td>
                    <td className="td">
                      {project.client ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={project.client.name}
                            gradient={avatarGradient(project.client.name)}
                            size="sm"
                            className="h-6 w-6 text-[9px]"
                          />
                          <span className="text-xs">{project.client.company || project.client.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="td">
                      <select
                        value={project.status}
                        onChange={(e) => moveProject(project.id, e.target.value)}
                        className={cn(
                          'cursor-pointer rounded-full border px-2 py-1 text-[11px] font-medium outline-none',
                          projectStatusStyles[project.status]
                        )}
                      >
                        {PROJECT_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                            {t(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="td">
                      <Badge className={priorityStyles[project.priority]}>{t(project.priority)}</Badge>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={project.progress} className="w-20" />
                        <span className="text-[11px] text-zinc-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="td text-xs">{project.endDate ? formatDate(project.endDate) : '—'}</td>
                    <td className="td text-right text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {compactCurrency(project.budget)}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-0.5 opacity-0 transition group-hover:opacity-100">
                        <button className="icon-btn h-7 w-7" onClick={() => setModal({ open: true, project, status: null })}>
                          <Pencil size={13} />
                        </button>
                        <button className="icon-btn h-7 w-7 hover:text-rose-500" onClick={() => setToDelete(project)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProjectModal
        open={modal.open}
        project={modal.project}
        defaultStatus={modal.status}
        onClose={() => setModal({ open: false, project: null, status: null })}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar proyecto"
        message={`¿Eliminar “${toDelete?.title}”? Las propuestas y eventos vinculados se mantendrán, pero perderán la asociación.`}
      />
    </div>
  );
}
