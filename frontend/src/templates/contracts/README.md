# Plantillas de contratos

Carpeta dedicada al contenido y al diseño de los contratos. La app la consume
desde `frontend/src/templates/contracts/`; puedes editarla sin tocar las páginas.

| Archivo | Para qué sirve |
| --- | --- |
| `catalog.js` | Catálogo de plantillas: nombre, descripción, alcance por defecto y cláusula de propiedad intelectual. |
| `buildContractText.js` | Genera el texto legal completo (cláusulas 1–10) con los datos del formulario. |
| `ContractDocument.jsx` | Diseño visual de la "hoja" del contrato en la vista previa. |
| `printContract.js` | Maqueta y estilos de la versión imprimible / PDF del navegador. |

## Cómo añadir una plantilla

1. Añade un objeto a `CONTRACT_TEMPLATES` en `catalog.js`:

```js
{
  value: 'My New Agreement',        // identificador interno (no lo cambies luego)
  label: 'Mi Nuevo Contrato',       // nombre visible
  description: 'Descripción breve.',
  scope: 'Alcance por defecto...',
  ip: 'Cláusula de propiedad intelectual...',
}
```

2. Aparecerá automáticamente en el selector de "Nuevo contrato".

## Cómo cambiar el diseño

- **Vista previa en la app:** edita `ContractDocument.jsx` (Tailwind CSS).
- **Impresión/PDF del navegador:** edita el bloque `<style>` de `printContract.js`.
- **PDF del microservicio Python:** la maqueta real está en
  `services/python-service/app/main.py` → función `build_contract_pdf`.

## Cómo cambiar el texto legal

Edita `buildContractText.js`. Cada sección es una cadena dentro del template
string; puedes reordenar, añadir o eliminar cláusulas. El botón
**"Generar texto del contrato"** del formulario usa esta función.

> Los valores guardados en la base de datos son los `value` en inglés. Las
> etiquetas visibles se traducen con `templateLabel()` de `catalog.js`.
