import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import CommandPalette from './CommandPalette';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const { company, user, updateProfile } = useAuth();
  const companyName = company?.name || 'Orbit';
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('orbit-sidebar') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(() => !user?.firstName || !user?.lastName);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setProfileOpen(!user?.firstName || !user?.lastName);
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('orbit-sidebar', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName });
      setProfileOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-500/[0.07] blur-[100px] dark:bg-brand-500/[0.1]" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-violet-500/[0.05] blur-[110px] dark:bg-violet-600/[0.08]" />
        <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-25 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]'
        )}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-zinc-200/60 px-6 py-4 text-center text-[11px] text-zinc-400 dark:border-white/[0.05] dark:text-zinc-600">
          <p>
            {companyName} · Creado por <strong className="text-zinc-600 dark:text-zinc-300">Yahir Alberto Ordoñez Puc</strong>
          </p>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Completa tu perfil</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Necesitamos tu nombre y apellidos para firmar los documentos.
            </p>
            <form onSubmit={saveProfile} className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
                <input className="field w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Apellidos</label>
                <input className="field w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={savingProfile}>
                {savingProfile && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
