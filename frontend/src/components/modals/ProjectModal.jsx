import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { PROJECT_PRIORITIES, PROJECT_STATUSES, t } from '../../lib/constants';
import { toInputDate } from '../../lib/utils';
import { Field, Input, Modal, Select, Spinner, Textarea } from '../ui';

const empty = {
  title: '',
  description: '',
  clientId: '',
  status: 'Backlog',
  priority: 'Medium',
  progress: 0,
  startDate: '',
  endDate: '',
  budget: '',
};

export default function ProjectModal({ open, onClose, project, onSaved, defaultStatus }) {
  const { toast } = useToast();
  const { data: clients } = useApi(() => api.clients.list(), []);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      project
        ? {
            title: project.title || '',
            description: project.description || '',
            clientId: project.clientId || project.client?.id || '',
            status: project.status || 'Backlog',
            priority: project.priority || 'Medium',
            progress: project.progress ?? 0,
            startDate: toInputDate(project.startDate),
            endDate: toInputDate(project.endDate),
            budget: project.budget ?? '',
          }
        : { ...empty, status: defaultStatus || 'Backlog' }
    );
  }, [open, project, defaultStatus]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'El título es obligatorio';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const payload = {
      ...form,
      clientId: form.clientId || null,
      budget: form.budget === '' ? 0 : Number(form.budget),
      progress: Number(form.progress) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    try {
      if (project) {
        await api.projects.update(project.id, payload);
        toast('Proyecto actualizado');
      } else {
        await api.projects.create(payload);
        toast('Proyecto creado');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message || 'No se pudo guardar el proyecto', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Editar proyecto' : 'Nuevo proyecto'}
      description={
        project ? 'Actualiza el alcance, el estado y las fechas de entrega.' : 'Configura un nuevo proyecto de desarrollo.'
      }
      size="lg"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="project-form" className="btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {project ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Título del proyecto" error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={set('title')} placeholder="Nova Commerce Platform" autoFocus />
        </Field>
        <Field label="Cliente">
          <Select value={form.clientId} onChange={set('clientId')}>
            <option value="">Sin cliente</option>
            {(clients || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `— ${c.company}` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Presupuesto (USD)">
          <Input type="number" min="0" step="100" value={form.budget} onChange={set('budget')} placeholder="15000" />
        </Field>
        <Field label="Estado">
          <Select value={form.status} onChange={set('status')}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prioridad">
          <Select value={form.priority} onChange={set('priority')}>
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de inicio">
          <Input type="date" value={form.startDate} onChange={set('startDate')} />
        </Field>
        <Field label="Fecha límite">
          <Input type="date" value={form.endDate} onChange={set('endDate')} />
        </Field>
        <Field label={`Progreso — ${form.progress}%`} className="sm:col-span-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={form.progress}
            onChange={set('progress')}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-brand-600 dark:bg-white/10"
          />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={set('description')}
            placeholder="Alcance, stack tecnológico, entregables..."
          />
        </Field>
      </form>
    </Modal>
  );
}
