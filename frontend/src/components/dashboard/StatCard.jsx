import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function StatCard({ icon: Icon, label, value, sub, accent = 'brand', delay = 0 }) {
  const accents = {
    brand: {
      icon: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      glow: 'from-brand-500/10',
    },
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-500/10',
    },
    sky: {
      icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      glow: 'from-sky-500/10',
    },
    amber: {
      icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: 'from-amber-500/10',
    },
    violet: {
      icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      glow: 'from-violet-500/10',
    },
  };
  const tone = accents[accent] || accents.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover group relative overflow-hidden p-5"
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          tone.glow
        )}
      />
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tone.icon)}>
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </motion.div>
  );
}
