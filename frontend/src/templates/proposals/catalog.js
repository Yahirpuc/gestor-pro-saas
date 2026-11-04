import { currency, formatDate } from '../../lib/utils';

/**
 * CATÁLOGO DE SECCIONES DE PROPUESTA
 * -----------------------------------
 * Define las secciones editables de una propuesta comercial.
 * Puedes añadir o quitar secciones sin tocar la lógica de la app.
 */
export const PROPOSAL_SECTIONS = [
  { key: 'summary', label: 'Resumen', placeholder: 'Descripción breve del encargo.' },
  { key: 'scope', label: 'Alcance del trabajo', placeholder: 'Funcionalidades, integraciones, responsabilidades...' },
  { key: 'deliverables', label: 'Entregables', placeholder: 'Código fuente, documentación, soporte...' },
];

export const getSectionLabel = (key) =>
  PROPOSAL_SECTIONS.find((s) => s.key === key)?.label || key;

export const DEFAULT_PROPOSAL_TEMPLATE = 'Commercial Proposal';
