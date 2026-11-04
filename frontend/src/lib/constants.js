export const CLIENT_STATUSES = ['Active', 'Prospect', 'Inactive'];
export const PROJECT_STATUSES = ['Backlog', 'In Progress', 'In Review', 'Completed'];
export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const PROPOSAL_STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected'];
export const CONTRACT_STATUSES = ['Draft', 'Sent', 'Signed', 'Archived'];
export const EVENT_TYPES = ['Deadline', 'Payment', 'Meeting', 'Milestone'];

/**
 * Las etiquetas visibles están en español, pero los valores persistidos
 * (enums de la base de datos y de la API) se mantienen en inglés para no
 * romper la capa de datos.
 */
export const STATUS_LABELS = {
  // Clientes
  Active: 'Activo',
  Prospect: 'Prospecto',
  Inactive: 'Inactivo',
  // Proyectos
  Backlog: 'Backlog',
  'In Progress': 'En progreso',
  'In Review': 'En revisión',
  Completed: 'Completado',
  // Prioridades
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Urgent: 'Urgente',
  // Propuestas
  Draft: 'Borrador',
  Sent: 'Enviado',
  Accepted: 'Aceptada',
  Rejected: 'Rechazada',
  // Contratos
  Signed: 'Firmado',
  Archived: 'Archivado',
  // Eventos
  Deadline: 'Entrega',
  Payment: 'Pago',
  Meeting: 'Reunión',
  Milestone: 'Hito',
};

/** Traduce cualquier valor de enum a su etiqueta visible. */
export const t = (value) => STATUS_LABELS[value] || value;

export const clientStatusStyles = {
  Active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  Prospect: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  Inactive: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400',
};

export const projectStatusStyles = {
  Backlog: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400',
  'In Progress': 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  'In Review': 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  Completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
};

export const projectStatusDot = {
  Backlog: 'bg-zinc-400',
  'In Progress': 'bg-sky-400',
  'In Review': 'bg-amber-400',
  Completed: 'bg-emerald-400',
};

export const priorityStyles = {
  Low: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400',
  Medium: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  High: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
  Urgent: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
};

export const proposalStatusStyles = {
  Draft: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400',
  Sent: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  Accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  Rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
};

export const contractStatusStyles = {
  Draft: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400',
  Sent: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  Signed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  Archived: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-500',
};

export const eventTypeStyles = {
  Deadline: {
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  Payment: {
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Meeting: {
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  Milestone: {
    badge: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
};
