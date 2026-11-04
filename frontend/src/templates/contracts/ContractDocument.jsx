import { formatDate, currency } from '../../lib/utils';
import { templateLabel } from './catalog';

/**
 * DISEÑO DEL DOCUMENTO DE CONTRATO
 * --------------------------------
 * Este componente es la "hoja" que se muestra en la vista previa.
 * Modifica libremente estructura, tipografía, colores o bloques.
 *
 * El contenedor (modal, botones, etc.) vive en `pages/Contracts.jsx`.
 */
export default function ContractDocument({ contract }) {
  if (!contract) return null;

  const meta = [
    ['Cliente', contract.client?.company || contract.client?.name || '—'],
    ['Proyecto', contract.project?.title || 'Sin proyecto vinculado'],
    ['Importe', currency(contract.amount, contract.currency)],
    ['Estado', contract.status],
    ['Firma', contract.signedAt ? formatDate(contract.signedAt) : 'Pendiente'],
  ];

  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-zinc-800 shadow-inner sm:p-9">
      {/* Marca de agua sutil */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/[0.04]" />

      <header className="border-b border-zinc-200 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
              OR
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                Norbe
              </p>
              <p className="text-[10px] text-zinc-400">{templateLabel(contract.template)}</p>
            </div>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
            Confidencial
          </p>
        </div>

        <h2 className="mt-4 font-serif text-[20px] font-semibold leading-snug text-zinc-900">
          {contract.title}
        </h2>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-zinc-50 p-3.5 text-[11px] sm:grid-cols-5">
        {meta.map(([label, value]) => (
          <div key={label}>
            <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
            <p className="mt-0.5 truncate font-medium text-zinc-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 max-h-[44vh] overflow-y-auto pr-1">
        <pre className="whitespace-pre-wrap font-serif text-[12.5px] leading-[1.85] text-zinc-700">
          {contract.content || 'El contrato aún no tiene contenido. Edítalo para generar el texto legal.'}
        </pre>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 border-t border-zinc-200 pt-6 text-[10px] text-zinc-500">
        <div>
          <div className="mb-3 h-10 border-b border-zinc-300" />
          <p>Firma del Proveedor</p>
        </div>
        <div>
          <div className="mb-3 h-10 border-b border-zinc-300" />
          <p>Firma del Cliente</p>
        </div>
      </div>

      <footer className="mt-6 border-t border-zinc-100 pt-3 text-[9px] text-zinc-400">
        Documento generado con Norbe · {templateLabel(contract.template)}
      </footer>
    </article>
  );
}
