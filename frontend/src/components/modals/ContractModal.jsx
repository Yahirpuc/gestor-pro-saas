import { useEffect, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { CONTRACT_STATUSES, t } from '../../lib/constants';
import {
  CONTRACT_TEMPLATES,
  DEFAULT_TEMPLATE,
  getTemplate,
} from '../../templates/contracts/catalog';
import { buildContractText } from '../../templates/contracts/buildContractText';
import { Field, Input, Modal, Select, Spinner, Textarea } from '../ui';

const empty = {
  title: '',
  clientId: '',
  projectId: '',
  template: DEFAULT_TEMPLATE.value,
  timeline: '',
  amount: '',
  currency: 'USD',
  status: 'Draft',
  scope: '',
  intellectualProperty: '',
  content: '',
};

export default function ContractModal({ open, onClose, contract, onSaved }) {
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
      contract
        ? {
            title: contract.title || '',
            clientId: contract.clientId || contract.client?.id || '',
            projectId: contract.projectId || contract.project?.id || '',
            template: contract.template || DEFAULT_TEMPLATE.value,
            timeline: contract.timeline || '',
            amount: contract.amount ?? '',
            currency: contract.currency || 'USD',
            status: contract.status || 'Draft',
            scope: contract.scope || '',
            intellectualProperty: contract.intellectualProperty || '',
            content: contract.content || '',
          }
        : empty
    );
  }, [open, contract]);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'template' && !contract) {
        const tpl = getTemplate(value);
        next.scope = tpl.scope;
        next.intellectualProperty = tpl.ip;
      }
      return next;
    });
  };

  const client = (clients || []).find((c) => c.id === form.clientId);
  const clientProjects = (projects || []).filter((p) => !form.clientId || p.client?.id === form.clientId);

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
        projectId: form.projectId || null,
        content: form.content || buildContractText(form, client?.name),
      };
      if (contract) {
        await api.contracts.update(contract.id, payload);
        toast('Contrato actualizado');
      } else {
        await api.contracts.create(payload);
        toast('Contrato creado');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message || 'No se pudo guardar el contrato', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contract ? 'Editar contrato' : 'Nuevo contrato'}
      description="Elige una plantilla y completa las variables legales y comerciales."
      size="lg"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="contract-form" className="btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {contract ? 'Guardar cambios' : 'Crear contrato'}
          </button>
        </>
      }
    >
      <form id="contract-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Título del contrato" error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={set('title')} placeholder="Contrato — Nova Commerce Platform" autoFocus />
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
        <Field label="Plantilla" className="sm:col-span-2">
          <Select value={form.template} onChange={set('template')}>
            {CONTRACT_TEMPLATES.map((tpl) => (
              <option key={tpl.value} value={tpl.value}>
                {tpl.label}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-zinc-400">{getTemplate(form.template).description}</p>
        </Field>
        <Field label="Importe">
          <Input type="number" min="0" step="100" value={form.amount} onChange={set('amount')} placeholder="15000" />
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
              {CONTRACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Plazo de ejecución" className="sm:col-span-2">
          <Input value={form.timeline} onChange={set('timeline')} placeholder="16 semanas desde la firma" />
        </Field>
        <Field label="Alcance del trabajo" className="sm:col-span-2">
          <Textarea rows={3} value={form.scope} onChange={set('scope')} />
        </Field>
        <Field label="Cláusula de propiedad intelectual" className="sm:col-span-2">
          <Textarea rows={3} value={form.intellectualProperty} onChange={set('intellectualProperty')} />
        </Field>
        <Field label="Cuerpo del contrato" className="sm:col-span-2">
          <Textarea
            rows={8}
            value={form.content}
            onChange={set('content')}
            placeholder="Déjalo vacío para autogenerar el contrato completo a partir de la plantilla."
            className="font-mono text-[12px] leading-relaxed"
          />
        </Field>
        <div className="sm:col-span-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setForm((f) => ({ ...f, content: buildContractText(f, client?.name) }));
              toast('Texto del contrato generado', 'info');
            }}
          >
            <Wand2 size={15} /> Generar texto del contrato
          </button>
        </div>
      </form>
    </Modal>
  );
}
