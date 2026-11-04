/**
 * GENERADOR DEL CUERPO DE LA PROPUESTA
 * -------------------------------------
 * Devuelve el texto completo de la propuesta en español a partir de los datos
 * del formulario. Edita libremente las secciones.
 */
export function buildProposalText(form, clientName = '') {
  const monto = Number(form.amount || 0).toLocaleString('es-ES');
  const moneda = form.currency || 'USD';
  const cliente = clientName?.trim() || 'el Cliente';
  const proyecto = form.title?.trim() || 'Proyecto sin título';
  const resumen = form.summary?.trim() || 'Sin resumen.';
  const alcance = form.scope?.trim() || 'Por definir.';
  const entregables = form.deliverables?.trim() || 'Por definir.';
  const validez = form.validUntil ? new Date(form.validUntil).toLocaleDateString('es-ES') : 'Sin caducidad';

  return `PROPUESTA COMERCIAL

Para: ${cliente}
Proyecto: ${proyecto}

1. RESUMEN
${resumen}

2. ALCANCE DEL TRABAJO
${alcance}

3. ENTREGABLES
${entregables}

4. CONTRAPRESTACIÓN ECONÓMICA
El importe total de la propuesta asciende a ${moneda} ${monto}. Las condiciones de pago se acordarán en el contrato correspondiente.

5. VALIDEZ
Esta propuesta es válida hasta el ${validez}.

En espera de su confirmación, quedamos a su disposición.`;
}

export const defaultProposalSummary = (form) => form.summary?.trim() || '';
