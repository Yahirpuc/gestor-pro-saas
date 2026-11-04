import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClock,
  CheckCircle2,
  Download,
  Eye,
  FileSignature,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProposalModal from '../components/modals/ProposalModal';
import {
  Avatar,
  Badge,
  CardsSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  SearchInput,
  Spinner,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { api, generateProposalPdf } from '../lib/api';
import { PROPOSAL_STATUSES, proposalStatusStyles, t } from '../lib/constants';
import ProposalDocument from '../templates/proposals/ProposalDocument';
import { printProposal } from '../templates/proposals/printProposal';
import { avatarGradient, cn, currency, formatDate, sum } from '../lib/utils';

function ProposalPreview({ proposal, onClose, onCreateContract, onDownload, downloading }) {
  const [creating, setCreating] = useState(false);
  if (!proposal) return null;

  return (
    <Modal
      open={!!proposal}
      onClose={onClose}
      title={proposal.title}
      description={`${proposal.client?.name || 'Cliente'} · ${proposal.client?.company || ''}`}
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-outline" onClick={() => printProposal(proposal)}>
            Imprimir
          </button>
          <button className="btn-outline" onClick={onDownload} disabled={downloading}>
            {downloading ? <Spinner /> : null} Descargar PDF
          </button>
          <button
            className="btn-primary"
            disabled={creating || proposal.status !== 'Accepted'}
            title={proposal.status !== 'Accepted' ? 'Acepta la propuesta primero' : undefined}
            onClick={async () => {
              setCreating(true);
              await onCreateContract(proposal);
              setCreating(false);
            }}
          >
            {creating ? <Spinner /> : <FileSignature size={16} />} Generar contrato
          </button>
        </>
      }
    >
      <ProposalDocument proposal={proposal} />
    </Modal>
  );
}

export default function Proposals() {
  const { toast } = useToast();
  const { user, company } = useAuth();
  const signerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || '';
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() => api.proposals.list(), []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState({ open: false, proposal: null });
  const [preview, setPreview] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const proposals = data || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return proposals.filter((p) => {
      const okStatus = filter === 'All' || p.status === filter;
      const okQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.client?.name || '').toLowerCase().includes(q) ||
        (p.client?.company || '').toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [proposals, search, filter]);

  const totals = useMemo(
    () => ({
      pipeline: sum(proposals.filter((p) => ['Draft', 'Sent'].includes(p.status)), (p) => p.amount),
      accepted: sum(proposals.filter((p) => p.status === 'Accepted'), (p) => p.amount),
      count: proposals.length,
      acceptance:
        proposals.length > 0
          ? Math.round((proposals.filter((p) => p.status === 'Accepted').length / proposals.length) * 100)
          : 0,
    }),
    [proposals]
  );

  const downloadPdf = async (proposal) => {
    setDownloading(true);
    try {
      const payload = {
        ...proposal,
        signer: signerName,
        companyName: company?.name || 'Orbit',
      };
      const blob = await generateProposalPdf(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('PDF descargado');
    } catch (err) {
      toast(err.message || 'El servicio de PDF no está disponible', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.proposals.remove(toDelete.id);
      toast('Propuesta eliminada');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const createContract = async (proposal) => {
    try {
      await api.contracts.create({
        title: `Contrato — ${proposal.title.replace(/^Propuesta\s*—\s*/, '')}`,
        template: 'Software Development Agreement',
        content: proposal.summary || '',
        scope: proposal.scope || '',
        timeline: 'Por acordar',
        amount: proposal.amount,
        currency: proposal.currency,
        intellectualProperty:
          'El código fuente personalizado será propiedad del Cliente tras el pago total. Las librerías open source mantienen sus licencias originales.',
        status: 'Draft',
        clientId: proposal.client?.id,
        projectId: proposal.project?.id || null,
      });
      toast('Borrador de contrato creado a partir de la propuesta');
      setPreview(null);
      navigate('/contracts');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="Comercial" title="Propuestas" subtitle="Crea, envía y haz seguimiento de tus propuestas comerciales." />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Comercial"
        title="Propuestas"
        subtitle="Crea, envía y haz seguimiento de tus propuestas comerciales."
        actions={
          <button className="btn-primary" onClick={() => setModal({ open: true, proposal: null })}>
            <Plus size={16} /> Nueva propuesta
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Propuestas totales', value: totals.count, sub: 'histórico' },
          { label: 'Pipeline abierto', value: currency(totals.pipeline), sub: 'borrador + enviada' },
          { label: 'Valor aceptado', value: currency(totals.accepted), sub: 'tratos ganados' },
          { label: 'Tasa de aceptación', value: `${totals.acceptance}%`, sub: 'aceptadas / total' },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-[11px] text-zinc-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white/60 p-1 dark:border-white/[0.07] dark:bg-white/[0.02]">
          {['All', ...PROPOSAL_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                filter === status
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {status === 'All' ? 'Todas' : t(status)}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar propuestas..." className="w-full sm:w-64" />
      </div>

      {loading ? (
        <CardsSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay propuestas"
          description="Crea una propuesta para formalizar tu próximo encargo."
          action={
            <button className="btn-primary" onClick={() => setModal({ open: true, proposal: null })}>
              <Plus size={16} /> Nueva propuesta
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((proposal, i) => (
            <motion.article
              key={proposal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="card card-hover group flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={proposal.client?.name || 'Cliente'}
                    gradient={avatarGradient(proposal.client?.name || 'client')}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {proposal.client?.name || 'Sin vincular'}
                    </p>
                    <p className="truncate text-[10px] text-zinc-400">{proposal.client?.company || ''}</p>
                  </div>
                </div>
                <Badge className={proposalStatusStyles[proposal.status]}>{t(proposal.status)}</Badge>
              </div>

              <h3 className="mt-3 line-clamp-2 text-[14px] font-semibold leading-snug text-zinc-900 dark:text-white">
                {proposal.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                {proposal.summary || proposal.scope || 'Sin descripción'}
              </p>

              <div className="mt-4 flex items-end justify-between border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {currency(proposal.amount, proposal.currency)}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <CalendarClock size={10} />
                    {proposal.validUntil ? `Válida hasta ${formatDate(proposal.validUntil)}` : 'Sin caducidad'}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button className="icon-btn h-7 w-7" onClick={() => setPreview(proposal)} title="Vista previa">
                    <Eye size={13} />
                  </button>
                  <button
                    className="icon-btn h-7 w-7 opacity-0 transition group-hover:opacity-100"
                    onClick={() => setModal({ open: true, proposal })}
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="icon-btn h-7 w-7 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                    onClick={() => setToDelete(proposal)}
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {proposal.project && (
                <p className="mt-2 flex items-center gap-1 truncate text-[10px] text-zinc-400">
                  <CheckCircle2 size={10} /> {proposal.project.title}
                </p>
              )}
            </motion.article>
          ))}
        </div>
      )}

      <ProposalModal
        open={modal.open}
        proposal={modal.proposal}
        onClose={() => setModal({ open: false, proposal: null })}
        onSaved={refetch}
      />

      <AnimatePresence>
        {preview && (
          <ProposalPreview
            proposal={preview}
            onClose={() => setPreview(null)}
            onCreateContract={createContract}
            onDownload={() => downloadPdf(preview)}
            downloading={downloading}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar propuesta"
        message={`¿Eliminar “${toDelete?.title}”? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
