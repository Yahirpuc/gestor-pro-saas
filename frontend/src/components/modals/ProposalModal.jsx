import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { PROPOSAL_STATUSES, t } from '../../lib/constants';
import { toInputDate } from '../../lib/utils';
import { Field, Input, Modal, Select, Spinner, Textarea } from '../ui';

const empty = {
  title: '',
  clientId: '',
  projectId: '',
  amount: '',
  currency: 'USD',
  validUntil: '',
  status: 'Draft',
  summary: '',
  scope: '',
  deliverables: '',
};

export default function ProposalModal({ open, onClose, proposal, onSaved }) {
  const { toast } = useToast();
  const { data: clients } = useApi(() => api.clients.list(), []);
  const { data: projects } = useApi(() => api.projects.list(), []);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      proposal
        ? {
            title: proposal.title || '',
            clientId: proposal.clientId || proposal.client?.id || '',
            projectId: proposal.projectId || proposal.project?.id || '',
            amount: proposal.amount ?? '',
            currency: proposal.currency || 'USD',
            validUntil: toInputDate(proposal.validUntil),
            status: proposal.status || 'Draft',
            summary: proposal.summary || '',
            scope: proposal.scope || '',
            deliverables: proposal.deliverables || '',
          }
        : empty
    );
  }, [open, proposal]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'El título es obligatorio';
    if (!form.clientId) next.clientId = 'Selecciona un cliente';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: form.amount === '' ? 0 : Number(form.amount),
        validUntil: form.validUntil || null,
        projectId: form.projectId || null,
      };
      if (proposal) {
        await api.proposals.update(proposal.id, payload);
        toast('Propuesta actualizada');
      } else {
        await api.proposals.create(payload);
        toast('Propuesta creada');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message || 'No se pudo guardar la propuesta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clientProjects = (projects || []).filter(
    (p) => !form.clientId || p.client?.id === form.clientId
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={proposal ? 'Editar propuesta' : 'Nueva propuesta'}
      description="Define el alcance, el precio y la validez de tu oferta comercial."
      size="lg"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="proposal-form" className="btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {proposal ? 'Guardar cambios' : 'Crear propuesta'}
          </button>
        </>
      }
    >
      <form id="proposal-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Título de la propuesta" error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={set('title')} placeholder="Propuesta — Nova Commerce Platform" autoFocus />
        </Field>
        <Field label="Cliente" error={errors.clientId}>
          <Select value={form.clientId} onChange={set('clientId')}>
            <option value="">Selecciona un cliente</option>
            {(clients || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `— ${c.company}` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Proyecto (opcional)">
          <Select value={form.projectId} onChange={set('projectId')}>
            <option value="">Sin proyecto</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Importe">
          <Input type="number" min="0" step="100" value={form.amount} onChange={set('amount')} placeholder="12000" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moneda">
            <Select value={form.currency} onChange={set('currency')}>
              {['USD', 'EUR', 'MXN', 'COP', 'ARS'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.status} onChange={set('status')}>
              {PROPOSAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Válida hasta">
          <Input type="date" value={form.validUntil} onChange={set('validUntil')} />
        </Field>
        <Field label="Resumen" className="sm:col-span-2">
          <Textarea
            rows={2}
            value={form.summary}
            onChange={set('summary')}
            placeholder="Descripción breve del encargo."
          />
        </Field>
        <Field label="Alcance" className="sm:col-span-2">
          <Textarea
            rows={3}
            value={form.scope}
            onChange={set('scope')}
            placeholder="Funcionalidades, integraciones, responsabilidades..."
          />
        </Field>
        <Field label="Entregables" className="sm:col-span-2">
          <Textarea
            rows={2}
            value={form.deliverables}
            onChange={set('deliverables')}
            placeholder="Código fuente, documentación, soporte..."
          />
        </Field>
      </form>
    </Modal>
  );
}
