import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Search, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { cn } from '../../lib/utils';

/* ---------------------------------- Badge --------------------------------- */
export function Badge({ children, className, dot }) {
  return (
    <span className={cn('chip', className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}

/* --------------------------------- Button --------------------------------- */
export function Spinner({ size = 16, className }) {
  return <Loader2 size={size} className={cn('animate-spin', className)} />;
}

/* --------------------------------- Avatar --------------------------------- */
export function Avatar({ name = '', gradient = 'from-indigo-500 to-violet-500', size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  };
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        gradient,
        sizes[size],
        className
      )}
    >
      {name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('') || '?'}
    </div>
  );
}

/* --------------------------------- Inputs --------------------------------- */
export function Field({ label, children, hint, error, className }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn('field', className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn('field resize-none', className)} {...props} />;
}

export function Select({ value, onChange, children, className, disabled, ...props }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const options = React.useMemo(() => {
    const opts = [];
    React.Children.toArray(children).forEach((child) => {
      if (!child || typeof child !== 'object') return;
      if (child.type === 'option') {
        opts.push({ value: child.props.value, label: child.props.children });
      } else if (child.props && child.props.children) {
        React.Children.toArray(child.props.children).forEach((c) => {
          if (c && typeof c === 'object' && c.type === 'option') {
            opts.push({ value: c.props.value, label: c.props.children });
          }
        });
      }
    });
    return opts;
  }, [children]);

  const selected = options.find((o) => String(o.value) === String(value));

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (v) => {
    setOpen(false);
    if (onChange) onChange({ target: { value: v } });
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn('field cursor-pointer appearance-none pr-9 text-left', className)}
        {...props}
      >
        {selected ? selected.label : options[0]?.label ?? ''}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
        ▾
      </span>
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-zinc-900">
          {options.map((o, i) => (
            <li key={`${String(o.value)}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(o.value)}
                className={cn(
                  'w-full px-3.5 py-2 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-white/[0.06]',
                  String(o.value) === String(value)
                    ? 'bg-zinc-100 font-medium dark:bg-white/[0.08]'
                    : ''
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field pl-9"
      />
    </div>
  );
}

/* -------------------------------- Progress -------------------------------- */
export function ProgressBar({ value = 0, className, tone = 'brand' }) {
  const tones = {
    brand: 'from-brand-500 to-violet-500',
    success: 'from-emerald-500 to-teal-400',
    warning: 'from-amber-500 to-orange-400',
    danger: 'from-rose-500 to-pink-500',
  };
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/[0.08]', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn('h-full rounded-full bg-gradient-to-r', tones[tone])}
      />
    </div>
  );
}

/* --------------------------------- Modal ---------------------------------- */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      panelRef.current?.querySelector('input, select, textarea, button')?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm dark:bg-black/70"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0f14] sm:rounded-2xl',
              widths[size]
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 dark:border-white/[0.06]">
              <div>
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                )}
              </div>
              <button onClick={onClose} className="icon-btn -mr-2 -mt-1" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-white/[0.06] dark:bg-white/[0.015]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ ConfirmDialog ----------------------------- */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel = 'Eliminar' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || '¿Estás seguro?'}
      size="sm"
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn bg-rose-600 text-white hover:bg-rose-500"
          >
            {loading && <Spinner />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {message || 'Esta acción no se puede deshacer.'}
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------- EmptyState ------------------------------- */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center dark:border-white/10">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[0.05] dark:text-zinc-500">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------- ErrorState ------------------------------- */
export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <AlertTriangle size={20} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Algo salió mal</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {error?.message || 'No se pudo conectar con la API. Verifica que el backend esté corriendo en el puerto 4000.'}
      </p>
      {onRetry && (
        <button className="btn-outline mt-4" onClick={() => onRetry()}>
          Reintentar
        </button>
      )}
    </div>
  );
}

/* --------------------------------- Skeleton ------------------------------- */
export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function CardsSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-5 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- PageHeader ------------------------------ */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
