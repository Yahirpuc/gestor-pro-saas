import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  FileSignature,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

const pages = [
  { label: 'Panel', to: '/', icon: LayoutDashboard, keywords: 'inicio metricas resumen dashboard' },
  { label: 'Clientes', to: '/clients', icon: Users, keywords: 'crm contactos empresas' },
  { label: 'Proyectos', to: '/projects', icon: FolderKanban, keywords: 'kanban tablero desarrollo' },
  { label: 'Propuestas', to: '/proposals', icon: FileText, keywords: 'cotizaciones comercial propuestas' },
  { label: 'Contratos', to: '/contracts', icon: FileSignature, keywords: 'acuerdos legal pdf contratos' },
  { label: 'Calendario', to: '/calendar', icon: CalendarDays, keywords: 'eventos fechas hitos calendario' },
  { label: 'Ajustes', to: '/settings', icon: Settings, keywords: 'tema preferencias configuracion' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCursor(0);
    setTimeout(() => inputRef.current?.focus(), 40);
    Promise.all([api.clients.list(), api.projects.list()])
      .then(([c, p]) => {
        setClients(c || []);
        setProjects(p || []);
      })
      .catch(() => {});
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const match = (text) => !q || text.toLowerCase().includes(q);

    const nav = pages
      .filter((p) => match(p.label) || match(p.keywords))
      .map((p) => ({ type: 'Página', id: p.to, label: p.label, sub: 'Ir a', icon: p.icon, to: p.to }));

    const clientResults = clients
      .filter((c) => match(c.name) || match(c.company || ''))
      .slice(0, 4)
      .map((c) => ({
        type: 'Cliente',
        id: c.id,
        label: c.name,
        sub: c.company || c.email,
        icon: Users,
        to: '/clients',
      }));

    const projectResults = projects
      .filter((p) => match(p.title))
      .slice(0, 4)
      .map((p) => ({
        type: 'Proyecto',
        id: p.id,
        label: p.title,
        sub: p.client?.name || p.status,
        icon: FolderKanban,
        to: '/projects',
      }));

    return [...nav, ...clientResults, ...projectResults];
  }, [query, clients, projects]);

  useEffect(() => {
    if (cursor >= results.length) setCursor(0);
  }, [results.length, cursor]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      go(results[cursor]);
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm dark:bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0f14]"
          >
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 dark:border-white/[0.06]">
              <Search size={17} className="text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar páginas, clientes, proyectos..."
                className="h-14 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
              />
              <kbd className="hidden rounded-md border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-white/10 sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-500">Sin resultados para “{query}”</p>
              )}
              {results.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                      index === cursor
                        ? 'bg-zinc-100 dark:bg-white/[0.07]'
                        : 'hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-zinc-400">{item.sub}</span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 dark:text-zinc-600">
                      {item.type}
                    </span>
                    <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-zinc-100 px-4 py-2.5 text-[10px] text-zinc-400 dark:border-white/[0.06]">
              <span>
                <kbd className="rounded border border-zinc-200 px-1 dark:border-white/10">↑</kbd>{' '}
                <kbd className="rounded border border-zinc-200 px-1 dark:border-white/10">↓</kbd> navegar
              </span>
              <span>
                <kbd className="rounded border border-zinc-200 px-1 dark:border-white/10">↵</kbd> abrir
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
