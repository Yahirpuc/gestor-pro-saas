/**
 * CATÁLOGO DE PLANTILLAS DE CONTRATOS
 * -----------------------------------
 * Este archivo está pensado para que puedas editar el contenido legal sin
 * tocar la lógica de la aplicación.
 *
 *  - `value`       → identificador interno (NO lo cambies si ya hay contratos guardados).
 *  - `label`       → nombre visible en la interfaz.
 *  - `description` → texto de ayuda bajo el selector.
 *  - `scope`       → alcance por defecto (se rellena al elegir la plantilla).
 *  - `ip`          → cláusula de propiedad intelectual por defecto.
 *
 * El diseño visual del documento vive en `ContractDocument.jsx`.
 * El texto completo autogenerado vive en `buildContractText.js`.
 */

export const CONTRACT_TEMPLATES = [
  {
    value: 'Software Development Agreement',
    label: 'Contrato de Desarrollo de Software',
    description: 'Contrato estándar para desarrollo de software a medida.',
    scope:
      'Diseño, desarrollo, pruebas y despliegue del software descrito en el alcance del proyecto, incluyendo las integraciones acordadas por ambas partes.',
    ip: 'El código fuente personalizado será propiedad del Cliente una vez abonado el importe total del contrato. Las librerías y componentes de código abierto conservan sus licencias originales. El Proveedor conserva la titularidad sobre componentes genéricos y reutilizables.',
  },
  {
    value: 'Enterprise Software Agreement',
    label: 'Contrato de Software Empresarial',
    description: 'Para proyectos corporativos con requisitos de compliance y seguridad.',
    scope:
      'Desarrollo e integración de software empresarial, incluyendo auditoría, controles de seguridad, documentación técnica y acompañamiento en la puesta en producción.',
    ip: 'La propiedad intelectual del software desarrollado corresponderá al Cliente. El Proveedor mantiene la titularidad y licencia sobre sus herramientas, frameworks y componentes preexistentes.',
  },
  {
    value: 'SaaS Subscription Agreement',
    label: 'Contrato de Suscripción SaaS',
    description: 'Suscripción mensual o anual a una plataforma alojada.',
    scope:
      'Acceso y uso de la plataforma SaaS, soporte, mantenimiento evolutivo y actualizaciones continuas durante la vigencia de la suscripción.',
    ip: 'La plataforma, su código fuente y su infraestructura permanecen en propiedad del Proveedor. El Cliente recibe una licencia de uso no exclusiva, intransferible y limitada a la vigencia del contrato.',
  },
  {
    value: 'Maintenance Agreement',
    label: 'Contrato de Mantenimiento',
    description: 'Soporte y mantenimiento posterior al lanzamiento.',
    scope:
      'Corrección de errores, actualizaciones de seguridad, mejoras menores, monitoreo y soporte técnico según los niveles de servicio acordados.',
    ip: 'El código existente pertenece al Cliente. Las mejoras desarrolladas durante la vigencia del contrato se licencian al Cliente para su uso indefinido.',
  },
];

export const DEFAULT_TEMPLATE = CONTRACT_TEMPLATES[0];

export const getTemplate = (value) =>
  CONTRACT_TEMPLATES.find((template) => template.value === value) || DEFAULT_TEMPLATE;

/** Devuelve el nombre en español de una plantilla guardada en inglés. */
export const templateLabel = (value) => getTemplate(value).label;
