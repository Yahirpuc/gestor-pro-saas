import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { CLIENT_STATUSES, t } from '../../lib/constants';
import { Field, Input, Modal, Select, Spinner, Textarea } from '../ui';

const empty = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'Prospect',
  notes: '',
};

export default function ClientModal({ open, onClose, client, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      client
        ? {
            name: client.name || '',
            company: client.company || '',
            email: client.email || '',
            phone: client.phone || '',
            status: client.status || 'Prospect',
            notes: client.notes || '',
          }
        : empty
    );
  }, [open, client]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'El nombre es obligatorio';
    if (!form.email.trim()) next.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Escribe un correo válido';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      if (client) {
        await api.clients.update(client.id, form);
        toast('Cliente actualizado');
      } else {
        await api.clients.create(form);
        toast('Cliente creado');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message || 'No se pudo guardar el cliente', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? 'Editar cliente' : 'Nuevo cliente'}
      description={client ? 'Actualiza los datos de contacto y CRM.' : 'Añade un nuevo contacto a tu CRM.'}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="client-form" className="btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {client ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </>
      }
    >
      <form id="client-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.name}>
          <Input value={form.name} onChange={set('name')} placeholder="María González" autoFocus />
        </Field>
        <Field label="Empresa">
          <Input value={form.company} onChange={set('company')} placeholder="Nova Retail" />
        </Field>
        <Field label="Correo electrónico" error={errors.email}>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="maria@empresa.com" />
        </Field>
        <Field label="Teléfono">
          <Input value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" />
        </Field>
        <Field label="Estado">
          <Select value={form.status} onChange={set('status')}>
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notas" className="sm:col-span-2">
          <Textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Preferencias, contexto, datos de facturación..."
          />
        </Field>
      </form>
    </Modal>
  );
}
