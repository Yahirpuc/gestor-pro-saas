import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { EVENT_TYPES, t } from '../../lib/constants';
import { Field, Input, Modal, Select, Spinner, Textarea } from '../ui';

const empty = {
  title: '',
  description: '',
  type: 'Deadline',
  date: '',
  amount: '',
  clientId: '',
  projectId: '',
  completed: false,
};

const toLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EventModal({ open, onClose, event, onSaved, defaultDate }) {
  const { toast } = useToast();
  const { data: clients } = useApi(() => api.clients.list(), []);
  const { data: projects } = useApi(() => api.projects.list(), []);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'Deadline',
        date: toLocalInput(event.date),
        amount: event.amount ?? '',
        clientId: event.clientId || event.client?.id || '',
        projectId: event.projectId || event.project?.id || '',
        completed: !!event.completed,
      });
    } else {
      setForm({
        ...empty,
        date: defaultDate ? toLocalInput(defaultDate) : '',
      });
    }
  }, [open, event, defaultDate]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'El título es obligatorio';
    if (!form.date) next.date = 'La fecha es obligatoria';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        amount: form.amount === '' ? null : Number(form.amount),
        clientId: form.clientId || null,
        projectId: form.projectId || null,
      };
      if (event) {
        await api.events.update(event.id, payload);
        toast('Evento actualizado');
      } else {
        await api.events.create(payload);
        toast('Evento creado');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message || 'No se pudo guardar el evento', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clientProjects = (projects || []).filter((p) => !form.clientId || p.client?.id === form.clientId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? 'Editar evento' : 'Nuevo evento'}
      description="Entregas, hitos de pago, reuniones y milestones del proyecto."
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="event-form" className="btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {event ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={set('title')} placeholder="Hito de pago — 40%" autoFocus />
        </Field>
        <Field label="Tipo">
          <Select value={form.type} onChange={set('type')}>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(type)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha y hora" error={errors.date}>
          <Input type="datetime-local" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Cliente">
          <Select value={form.clientId} onChange={set('clientId')}>
            <option value="">Sin cliente</option>
            {(clients || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Proyecto">
          <Select value={form.projectId} onChange={set('projectId')}>
            <option value="">Sin proyecto</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>
        {form.type === 'Payment' && (
          <Field label="Importe">
            <Input type="number" min="0" step="100" value={form.amount} onChange={set('amount')} placeholder="5000" />
          </Field>
        )}
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={3} value={form.description} onChange={set('description')} />
        </Field>
        {event && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.completed}
              onChange={set('completed')}
              className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
            />
            Marcar como completado
          </label>
        )}
      </form>
    </Modal>
  );
}
