import { currency, formatDate } from '../../lib/utils';
import { buildProposalText } from './buildProposalText';

export default function ProposalDocument({ proposal }) {
  if (!proposal) return null;

  const meta = [
    ['Cliente', proposal.client?.company || proposal.client?.name || '—'],
    ['Proyecto', proposal.project?.title || 'Sin proyecto vinculado'],
    ['Importe', currency(proposal.amount, proposal.currency)],
    ['Estado', proposal.status],
    ['Válida hasta', proposal.validUntil ? formatDate(proposal.validUntil) : 'Sin caducidad'],
  ];

  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-zinc-800 shadow-inner sm:p-9">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/[0.04]" />

      <header className="border-b border-zinc-200 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
              PR
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">Propuesta comercial</p>
              <p className="text-[10px] text-zinc-400">{proposal.client?.name || 'Cliente'}</p>
            </div>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">Confidencial</p>
        </div>

        <h2 className="mt-4 font-serif text-[20px] font-semibold leading-snug text-zinc-900">
          {proposal.title}
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
          {proposal.content || buildProposalText(proposal, proposal.client?.name)}
        </pre>
      </div>

      <footer className="mt-6 border-t border-zinc-100 pt-3 text-[9px] text-zinc-400">
        Documento generado con Norbe Studio OS · Propuesta comercial
      </footer>
    </article>
  );
}
