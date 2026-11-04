import { currency, formatDate } from '../../lib/utils';

export function printProposal(proposal) {
  if (!proposal) return;
  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) return;

  const esc = (value = '') =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const metaRows = [
    ['Cliente', `${proposal.client?.name || ''}${proposal.client?.company ? ` · ${proposal.client.company}` : ''}`],
    ['Importe', currency(proposal.amount, proposal.currency)],
    ['Estado', proposal.status],
    ['Válida hasta', proposal.validUntil ? formatDate(proposal.validUntil) : 'Sin caducidad'],
  ]
    .map(([label, value]) => `<div><b>${label}</b>${esc(value)}</div>`)
    .join('');

  win.document.write(`<!doctype html>
  <html lang="es"><head><meta charset="utf-8"><title>${esc(proposal.title)}</title>
  <style>
    @page { margin: 18mm; }
    body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:40px auto;padding:0 28px;color:#18181b;line-height:1.75}
    .brand{font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#a1a1aa}
    h1{font-size:21px;line-height:1.3;margin:10px 0 18px;padding-bottom:16px;border-bottom:1px solid #d4d4d8}
    pre{white-space:pre-wrap;font-family:inherit;font-size:12.5px;line-height:1.8}
    .meta{margin:18px 0 26px;padding:14px 18px;background:#f0fdf4;border-radius:8px;font-size:11.5px;font-family:system-ui;display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}
    .meta b{display:block;font-size:8.5px;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;font-weight:600}
    footer{margin-top:36px;border-top:1px solid #d4d4d8;padding-top:10px;font-size:9px;color:#a1a1aa;font-family:system-ui}
  </style></head>
  <body>
    <p class="brand">Orbit Studio OS · Documento confidencial</p>
    <h1>${esc(proposal.title)}</h1>
    <div class="meta">${metaRows}</div>
    <pre>${esc(proposal.content || 'Sin contenido')}</pre>
    <footer>Generado con Orbit Studio OS · Propuesta comercial</footer>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
