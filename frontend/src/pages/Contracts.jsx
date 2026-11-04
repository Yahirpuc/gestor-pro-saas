import {
  Download,
  Eye,
  FileCheck2,
  FileSignature,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ContractModal from '../components/modals/ContractModal';
import {
  Avatar,
  Badge,
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
import { generateContractPdf, api } from '../lib/api';
import { CONTRACT_STATUSES, contractStatusStyles, t } from '../lib/constants';
import { avatarGradient, cn, currency, formatDate, sum } from '../lib/utils';
import ContractDocument from '../templates/contracts/ContractDocument';
import { printContract } from '../templates/contracts/printContract';
import { templateLabel } from '../templates/contracts/catalog';

function ContractPreview({ contract, onClose, onDownload, downloading, onEdit }) {
  if (!contract) return null;

  return (
    <Modal
      open={!!contract}
      onClose={onClose}
      title="Vista previa del contrato"
      description={templateLabel(contract.template)}
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onEdit}>
            <Pencil size={15} /> Editar
          </button>
          <button className="btn-outline" onClick={() => printContract(contract)}>
            <Printer size={15} /> Imprimir
          </button>
          <button className="btn-primary" onClick={onDownload} disabled={downloading}>
            {downloading ? <Spinner /> : <Download size={15} />} Descargar PDF
          </button>
        </>
      }
    >
      <ContractDocument contract={contract} />
    </Modal>
  );
}

export default function Contracts() {
  const { toast } = useToast();
  const { user, company } = useAuth();
  const signerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || '';
  const { data, loading, error, refetch } = useApi(() => api.contracts.list(), []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState({ open: false, contract: null });
  const [preview, setPreview] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const contracts = data || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const okStatus = filter === 'All' || c.status === filter;
      const okQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.client?.name || '').toLowerCase().includes(q) ||
        templateLabel(c.template).toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [contracts, search, filter]);

  const signedValue = sum(contracts.filter((c) => c.status === 'Signed'), (c) => c.amount);
  const pending = sum(contracts.filter((c) => ['Draft', 'Sent'].includes(c.status)), (c) => c.amount);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.contracts.remove(toDelete.id);
      toast('Contrato eliminado');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const changeStatus = async (contract, status) => {
    try {
      await api.contracts.patch(contract.id, { status });
      toast(`Contrato marcado como ${t(status).toLowerCase()}`);
      refetch({ silent: true });
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const downloadPdf = async (contract) => {
    setDownloading(true);
    try {
      const payload = {
        ...contract,
        signer: signerName,
        companyName: company?.name || 'Norbe',
      };
      const blob = await generateContractPdf(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
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

  if (error) {
    return (
      <div>
        <PageHeader
          eyebrow="Legal"
          title="Contratos"
          subtitle="Redacta, envía, firma y archiva tus contratos de software."
        />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Contratos"
        subtitle="Redacta, envía, firma y archiva tus contratos de software."
        actions={
          <button className="btn-primary" onClick={() => setModal({ open: true, contract: null })}>
            <Plus size={16} /> Nuevo contrato
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Contratos', value: contracts.length, sub: 'documentos totales' },
          { label: 'Valor firmado', value: currency(signedValue), sub: 'ingresos cerrados' },
          { label: 'Pendiente de firma', value: currency(pending), sub: 'borrador + enviado' },
          {
            label: 'Tasa de firma',
            value: `${
              contracts.length
                ? Math.round((contracts.filter((c) => c.status === 'Signed').length / contracts.length) * 100)
                : 0
            }%`,
            sub: 'firmados / total',
          },
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
          {['All', ...CONTRACT_STATUSES].map((status) => (
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
              {status === 'All' ? 'Todos' : t(status)}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar contratos..." className="w-full sm:w-64" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No hay contratos"
          description="Crea un contrato desde una plantilla o genéralo a partir de una propuesta aceptada."
          action={
            <button className="btn-primary" onClick={() => setModal({ open: true, contract: null })}>
              <Plus size={16} /> Nuevo contrato
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((contract) => (
            <div
              key={contract.id}
              className="card card-hover group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/[0.08] text-brand-500 dark:text-brand-400">
                {contract.status === 'Signed' ? <FileCheck2 size={19} /> : <FileText size={19} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14px] font-semibold text-zinc-900 dark:text-white">
                    {contract.title}
                  </p>
                  <Badge className={contractStatusStyles[contract.status]}>{t(contract.status)}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar
                      name={contract.client?.name || 'Cliente'}
                      gradient={avatarGradient(contract.client?.name || 'client')}
                      size="sm"
                      className="h-4 w-4 text-[7px]"
                    />
                    {contract.client?.company || contract.client?.name || 'Sin cliente'}
                  </span>
                  <span>·</span>
                  <span>{templateLabel(contract.template)}</span>
                  {contract.signedAt && (
                    <>
                      <span>·</span>
                      <span>Firmado {formatDate(contract.signedAt)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {currency(contract.amount, contract.currency)}
                </p>
                <select
                  value={contract.status}
                  onChange={(e) => changeStatus(contract, e.target.value)}
                  className={cn(
                    'cursor-pointer rounded-full border px-2 py-1 text-[11px] font-medium outline-none',
                    contractStatusStyles[contract.status]
                  )}
                >
                  {CONTRACT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                      {t(s)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-0.5">
                  <button className="icon-btn h-8 w-8" onClick={() => setPreview(contract)} title="Vista previa">
                    <Eye size={15} />
                  </button>
                  <button
                    className="icon-btn h-8 w-8"
                    onClick={() => downloadPdf(contract)}
                    title="Descargar PDF"
                    disabled={downloading}
                  >
                    {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  </button>
                  <button
                    className="icon-btn h-8 w-8 opacity-0 transition group-hover:opacity-100"
                    onClick={() => setModal({ open: true, contract })}
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn h-8 w-8 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                    onClick={() => setToDelete(contract)}
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContractModal
        open={modal.open}
        contract={modal.contract}
        onClose={() => setModal({ open: false, contract: null })}
        onSaved={refetch}
      />

      <ContractPreview
        contract={preview}
        onClose={() => setPreview(null)}
        onDownload={() => downloadPdf(preview)}
        downloading={downloading}
        onEdit={() => {
          const contract = preview;
          setPreview(null);
          setModal({ open: true, contract });
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar contrato"
        message={`¿Eliminar “${toDelete?.title}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
}
