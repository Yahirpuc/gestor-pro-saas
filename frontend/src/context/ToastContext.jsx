import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const tones = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-sky-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = icons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-black/10 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#14151a]/95"
              >
                <Icon size={18} className={cn('mt-0.5 shrink-0', tones[t.type])} />
                <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-0.5 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                  aria-label="Cerrar notificación"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
