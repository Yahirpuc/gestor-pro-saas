import { getTemplate } from './catalog';

/**
 * GENERADOR DEL CUERPO DEL CONTRATO
 * ----------------------------------
 * Devuelve el texto completo del contrato en español a partir de los datos
 * del formulario. Edita libremente las secciones, el orden o los títulos.
 *
 * Variables disponibles en `form`:
 *   title, template, scope, timeline, amount, currency, intellectualProperty
 * Y `clientName` (string).
 */
export function buildContractText(form, clientName = '') {
  const tpl = getTemplate(form.template);
  const monto = Number(form.amount || 0).toLocaleString('es-ES');
  const moneda = form.currency || 'USD';
  const alcance = form.scope?.trim() || tpl.scope;
  const plazo = form.timeline?.trim() || 'El plazo se acordará entre ambas partes.';
  const propiedad = form.intellectualProperty?.trim() || tpl.ip;
  const cliente = clientName?.trim() || 'el Cliente';
  const proyecto = form.title?.trim() || 'Proyecto sin título';

  return `CONTRATO DE DESARROLLO DE SOFTWARE

Entre el Proveedor de Servicios (en adelante, "el Proveedor") y ${cliente} (en adelante, "el Cliente"), se celebra el presente contrato para el proyecto "${proyecto}".

1. OBJETO DEL CONTRATO
El Proveedor se compromete a prestar los servicios de diseño, desarrollo e implementación descritos en el alcance del presente documento, de acuerdo con los requisitos y especificaciones acordados por ambas partes.

2. ALCANCE DEL TRABAJO
${alcance}

3. PLAZOS Y ENTREGAS
${plazo}
Las fechas de entrega podrán ajustarse de mutuo acuerdo cuando existan cambios en el alcance o retrasos imputables a cualquiera de las partes.

4. CONTRAPRESTACIÓN ECONÓMICA
El importe total del contrato asciende a ${moneda} ${monto}, que se abonará conforme al calendario de hitos acordado por ambas partes. Los pagos se considerarán realizados una vez recibidos en la cuenta indicada por el Proveedor.

5. PROPIEDAD INTELECTUAL
${propiedad}

6. CONFIDENCIALIDAD
Ambas partes se comprometen a mantener la confidencialidad de toda la información técnica, comercial y financiera intercambiada durante la relación contractual, así como con posterioridad a su finalización.

7. ACEPTACIÓN DE ENTREGABLES
El Cliente dispondrá de diez (10) días hábiles para revisar cada entregable y comunicar por escrito las observaciones razonables. Transcurrido dicho plazo sin objeciones, el entregable se considerará aceptado.

8. GARANTÍA Y SOPORTE
El Proveedor garantiza la corrección de defectos funcionales imputables al desarrollo durante los treinta (30) días siguientes a la entrega, sin coste adicional para el Cliente.

9. TERMINACIÓN
Cualquiera de las partes podrá resolver el contrato mediante notificación escrita con treinta (30) días de antelación. Los trabajos ejecutados hasta la fecha de terminación serán abonados proporcionalmente.

10. LEY APLICABLE
El presente contrato se regirá por la legislación que ambas partes acuerden por escrito, sometiéndose a los juzgados y tribunales competentes.

En prueba de conformidad, ambas partes firman el presente documento en la fecha indicada.

Proveedor: ____________________________          Cliente: ____________________________`;
}

/** Contenido corto para el resumen del contrato. */
export const defaultSummary = (form) =>
  form.scope?.trim() ||
  getTemplate(form.template).scope;
