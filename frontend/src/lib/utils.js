export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const currency = (value, code = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const compactCurrency = (value, code = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export const formatDate = (value, opts = {}) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const daysUntil = (value) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
};

export const relativeDue = (value) => {
  const days = daysUntil(value);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)}d`, tone: 'danger', days };
  if (days === 0) return { label: 'Hoy', tone: 'warning', days };
  if (days === 1) return { label: 'Mañana', tone: 'warning', days };
  if (days <= 7) return { label: `En ${days} días`, tone: 'warning', days };
  return { label: `En ${days} días`, tone: 'neutral', days };
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

export const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const toInputDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

/** Deterministic gradient per entity name, keeps avatar colors stable. */
export const avatarGradient = (seed = '') => {
  const palettes = [
    'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-fuchsia-500 to-purple-600',
    'from-cyan-500 to-sky-600',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return palettes[hash % palettes.length];
};

export const sum = (arr, pick = (x) => x) => arr.reduce((acc, item) => acc + Number(pick(item) || 0), 0);
