import { currency, formatDate } from '../../lib/utils';
import { templateLabel } from './catalog';

/**
 * Abre una ventana de impresión con una maqueta limpia, moderna y profesional del contrato.
 */
export function printContract(contract) {
  if (!contract) return;

  const win = window.open('', '_blank', 'width=850,height=1100');
  if (!win) return;

  const esc = (value = '') =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const metaItems = [
    ['Cliente', `${contract.client?.name || 'No especificado'}${contract.client?.company ? ` · ${contract.client.company}` : ''}`],
    ['Tipo de Plantilla', templateLabel(contract.template)],
    ['Importe Total', currency(contract.amount, contract.currency)],
    ['Estado del Contrato', contract.status || 'Borrador'],
    ['Fecha de Firma', contract.signedAt ? formatDate(contract.signedAt) : 'Pendiente de firma'],
  ];

  const metaHtml = metaItems
    .map(([label, value]) => `
      <div class="meta-item">
        <span class="meta-label">${label}</span>
        <span class="meta-value">${esc(value)}</span>
      </div>
    `)
    .join('');

  win.document.write(`<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>${esc(contract.title || 'Contrato')} - Norbe</title>
    <style>
      :root {
        --primary: #09090b;
        --text: #27272a;
        --muted: #71717a;
        --border: #e4e4e7;
        --bg-light: #fafafa;
      }

      @page {
        size: A4;
        margin: 20mm 20mm 20mm 20mm;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: var(--text);
        background-color: #ffffff;
        font-size: 13.5px;
        line-height: 1.65;
        padding: 40px;
      }

      .brand-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--muted);
        border-bottom: 1px solid var(--border);
        padding-bottom: 12px;
        margin-bottom: 24px;
      }

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary);
        line-height: 1.25;
        margin-bottom: 20px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px 24px;
        background-color: var(--bg-light);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 16px 20px;
        margin-bottom: 32px;
      }

      .meta-item {
        display: flex;
        flex-direction: column;
      }

      .meta-label {
        font-size: 9.5px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
        font-weight: 600;
        margin-bottom: 2px;
      }

      .meta-value {
        font-size: 12.5px;
        color: var(--primary);
        font-weight: 500;
      }

      .contract-body {
        font-family: Georgia, Cambria, "Times New Roman", Times, serif; /* Tipografía clásica para lectura formal del contrato */
        font-size: 13px;
        line-height: 1.8;
        color: #18181b;
        white-space: pre-wrap;
        word-break: break-word;
        margin-bottom: 48px;
      }

      .signatures {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 60px;
        page-break-inside: avoid;
      }

      .signature-box {
        border-top: 1px solid var(--primary);
        padding-top: 8px;
        text-align: center;
      }

      .signature-box p {
        font-size: 11px;
        color: var(--muted);
      }

      .signature-box .sig-name {
        font-weight: 600;
        color: var(--primary);
        margin-bottom: 2px;
      }

      footer {
        margin-top: 40px;
        border-top: 1px solid var(--border);
        padding-top: 12px;
        font-size: 9.5px;
        color: var(--muted);
        display: flex;
        justify-content: space-between;
      }

      @media print {
        body {
          padding: 0;
        }
        .no-print {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="brand-header">
      <span>Norbe</span>
      <span>Documento Confidencial</span>
    </div>

    <h1>${esc(contract.title)}</h1>

    <div class="meta-grid">
      ${metaHtml}
    </div>

    <div class="contract-body">${esc(contract.content || 'Sin contenido especificado para este contrato.')}</div>

    <div class="signatures">
      <div class="signature-box">
        <p class="sig-name">Por Norbe</p>
        <p>Representante Autorizado</p>
      </div>
      <div class="signature-box">
        <p class="sig-name">${esc(contract.client?.name || 'Cliente')}</p>
        <p>${esc(contract.client?.company || 'Firma de aceptación')}</p>
      </div>
    </div>

    <footer>
      <span>Generado por Norbe</span>
      <span>${esc(templateLabel(contract.template))}</span>
    </footer>
  </body>
  </html>`);

  win.document.close();
  win.focus();

  // Se extiende ligeramente el timeout para asegurar que fuentes y estilos carguen sin parpadeos en navegadores pesados
  setTimeout(() => {
    win.print();
  }, 500);
}