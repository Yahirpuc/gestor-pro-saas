import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  FileSignature,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const groups = [
  {
    label: 'Espacio de trabajo',
    items: [
      { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
      { to: '/clients', label: 'Clientes', icon: Users },
      { to: '/projects', label: 'Proyectos', icon: FolderKanban },
      { to: '/calendar', label: 'Calendario', icon: CalendarDays },
    ],
  },
  {
    label: 'Negocio',
    items: [
      { to: '/proposals', label: 'Propuestas', icon: FileText },
      { to: '/contracts', label: 'Contratos', icon: FileSignature },
      { to: '/settings', label: 'Ajustes', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { company, logout } = useAuth();
  const companyName = company?.name || 'Orbit';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
          {companyName.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{companyName}</p>
            <p className="truncate text-[10px] text-zinc-400">Gestor de proyectos</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen?.(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition',
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-zinc-100',
                        collapsed && 'justify-center'
                      )
                    }
                  >
                    <Icon size={17} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>



      <div className="border-t border-zinc-100 p-3 dark:border-white/[0.06]">
        <button
          onClick={() => {
            logout();
          }}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-500 dark:text-zinc-400',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={17} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed?.(!collapsed)}
          className={cn(
            'mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200',
            collapsed && 'justify-center'
          )}
        >
          <ChevronLeft size={17} className={cn('transition', collapsed && 'rotate-180')} />
          {!collapsed && <span>{collapsed ? 'Expandir menú' : 'Contraer menú'}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden h-screen border-r border-zinc-200 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-white/[0.06] dark:bg-[#08090c]/70 lg:block',
          collapsed ? 'w-[72px]' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d0e13] lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 icon-btn"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
