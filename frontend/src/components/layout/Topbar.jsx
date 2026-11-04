import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Wallet,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { api } from '../../lib/api';
import { cn, formatDate, relativeDue } from '../../lib/utils';
import { Avatar } from '../ui';

const titles = {
  '/': 'Panel',
  '/clients': 'Clientes',
  '/projects': 'Proyectos',
  '/proposals': 'Propuestas',
  '/contracts': 'Contratos',
  '/calendar': 'Calendario',
  '/settings': 'Ajustes',
};

const toneStyles = {
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  neutral: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400',
};

export default function Topbar({ onOpenMobile, onOpenPalette }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { company, user, logout } = useAuth();
  const companyName = company?.name || 'Norbe';
  const userName = user?.name || 'Administrador';
  const userEmail = user?.email || '';
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useOnClickOutside(notifRef, () => setNotifOpen(false));
  useOnClickOutside(profileRef, () => setProfileOpen(false));

  const { data: events } = useApi(() => api.events.upcoming(30), []);
  const upcoming = useMemo(() => (events || []).slice(0, 5), [events]);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-zinc-50/75 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#08090c]/75">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="icon-btn lg:hidden" onClick={onOpenMobile} aria-label="Abrir menú">
          <Menu size={19} />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
          <span className="text-zinc-400 dark:text-zinc-500">{companyName}</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {titles[location.pathname] || 'Espacio de trabajo'}
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={onOpenPalette}
          className="group hidden h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-3 text-sm text-zinc-400 shadow-sm transition hover:border-zinc-300 hover:text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:text-zinc-300 sm:flex sm:w-64"
        >
          <Search size={15} />
          <span className="flex-1 text-left text-[13px]">Buscar en todo…</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-white/10">
            <Command size={9} /> K
          </kbd>
        </button>

        <button className="icon-btn sm:hidden" onClick={onOpenPalette} aria-label="Buscar">
          <Search size={18} />
        </button>

        {/* Tema */}
        <button
          onClick={toggleTheme}
          className="icon-btn relative overflow-hidden"
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'moon' : 'sun'}
              initial={{ y: 12, opacity: 0, rotate: -30 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -12, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="icon-btn relative"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {upcoming.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12131a]"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Próximos</p>
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {upcoming.length} alertas
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {upcoming.length === 0 && (
                    <p className="px-3 py-8 text-center text-sm text-zinc-500">No hay eventos próximos.</p>
                  )}
                  {upcoming.map((event) => {
                    const due = relativeDue(event.date);
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/calendar');
                        }}
                        className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            toneStyles[due.tone]
                          )}
                        >
                          {event.type === 'Payment' ? <Wallet size={14} /> : <Bell size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                            {event.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                            {formatDate(event.date)}
                            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                            <span
                              className={cn(
                                due.tone === 'danger'
                                  ? 'text-rose-500'
                                  : due.tone === 'warning'
                                    ? 'text-amber-500'
                                    : ''
                              )}
                            >
                              {due.label}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Link
                  to="/calendar"
                  onClick={() => setNotifOpen(false)}
                  className="block border-t border-zinc-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 transition hover:bg-zinc-50 dark:border-white/[0.06] dark:text-brand-400 dark:hover:bg-white/[0.03]"
                >
                  Ver calendario
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Perfil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-1.5 transition hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          >
            <Avatar name="{userName}" gradient="from-indigo-500 to-violet-600" size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-medium leading-tight text-zinc-800 dark:text-zinc-100">
                {userName}
              </p>
              <p className="text-[11px] leading-tight text-zinc-400">Administrador</p>
            </div>
            <ChevronDown size={14} className="hidden text-zinc-400 sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#12131a]"
              >
                <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-white/[0.06]">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{userName}</p>
                  <p className="truncate text-xs text-zinc-400">alex@orbit.studio</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                >
                  <Settings size={15} /> Ajustes
                </Link>
                <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.05]">
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
