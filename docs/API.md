# API Reference · Orbit Studio OS

Base URL: `http://localhost:4000/api`
Formato: `application/json`

## Convenciones

Éxito:

```json
{ "success": true, "data": { } }
```

Error:

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [{ "field": "email", "message": "email must be valid" }]
  }
}
```

Códigos usados: `200` OK · `201` Created · `400` validación · `404` no encontrado · `409` conflicto · `500` error interno.

---

## Health

`GET http://localhost:4000/health`

```json
{
  "success": true,
  "service": "gestor-proyectos-api",
  "timestamp": "2026-11-03T18:00:00.000Z"
}
```

---

## Clients

### `GET /clients`

Query params opcionales: `status` (`Active|Prospect|Inactive`), `search` (nombre, empresa o email).

```json
{
  "success": true,
  "data": [
    {
      "id": "6f1c...",
      "name": "María González",
      "company": "Nova Retail",
      "email": "maria@novaretail.com",
      "phone": "+34 612 345 678",
      "notes": "Cliente estratégico.",
      "status": "Active",
      "createdAt": "2026-11-03T18:00:00.000Z",
      "updatedAt": "2026-11-03T18:00:00.000Z",
      "projects": [{ "id": "...", "title": "Nova Commerce Platform", "status": "In Progress", "budget": "24500" }]
    }
  ]
}
```

### `GET /clients/:id`

Devuelve el cliente con `projects`, `proposals` y `contracts`.

### `POST /clients`

```json
{
  "name": "María González",
  "company": "Nova Retail",
  "email": "maria@novaretail.com",
  "phone": "+34 612 345 678",
  "status": "Active",
  "notes": "Prefiere Slack."
}
```

Obligatorios: `name`, `email`.

### `PUT /clients/:id` · `DELETE /clients/:id`

Actualización parcial con los mismos campos. `DELETE` responde:

```json
{ "success": true, "message": "Client deleted" }
```

---

## Projects

### `GET /projects`

Query params: `status` (`Backlog|In Progress|In Review|Completed`), `clientId`.

Cada proyecto incluye `client: { id, name, company, email }`.

### `POST /projects`

```json
{
  "title": "Nova Commerce Platform",
  "description": "E-commerce headless con Next.js y Stripe.",
  "status": "In Progress",
  "priority": "High",
  "progress": 62,
  "startDate": "2026-10-01",
  "endDate": "2026-12-15",
  "budget": 24500,
  "clientId": "6f1c..."
}
```

Obligatorio: `title`. `progress` debe estar entre 0 y 100.
Prioridades: `Low | Medium | High | Urgent`.

### `PUT /projects/:id` · `PATCH /projects/:id`

Mismos campos. `PATCH` se usa desde el Kanban para mover tarjetas:

```json
{ "status": "In Review" }
```

### `DELETE /projects/:id`

---

## Proposals

### `GET /proposals`

Query params: `status` (`Draft|Sent|Accepted|Rejected`), `clientId`.
Incluye `client` y `project` resumidos.

### `POST /proposals`

```json
{
  "title": "Propuesta — Nova Commerce",
  "summary": "Diseño y desarrollo del e-commerce.",
  "scope": "Storefront headless, panel admin, Stripe.",
  "deliverables": "Código fuente, documentación, soporte.",
  "amount": 24500,
  "currency": "USD",
  "validUntil": "2026-12-31",
  "status": "Sent",
  "clientId": "6f1c...",
  "projectId": "a1b2..."
}
```

Obligatorios: `title`, `clientId`.

### `PUT /proposals/:id` · `PATCH /proposals/:id` · `DELETE /proposals/:id`

---

## Contracts

### `GET /contracts`

Query params: `status` (`Draft|Sent|Signed|Archived`), `clientId`.

### `POST /contracts`

```json
{
  "title": "Contrato — Nova Commerce",
  "template": "Software Development Agreement",
  "content": "SOFTWARE DEVELOPMENT AGREEMENT ...",
  "scope": "Desarrollo completo del e-commerce.",
  "timeline": "16 semanas",
  "amount": 24500,
  "currency": "USD",
  "intellectualProperty": "El código pasa al Cliente tras el pago total.",
  "status": "Draft",
  "clientId": "6f1c...",
  "projectId": "a1b2..."
}
```

Obligatorios: `title`, `clientId`.
Si `status = "Signed"` el backend registra `signedAt` automáticamente. Al volver a `Draft`, se limpia.

### `PUT /contracts/:id` · `PATCH /contracts/:id` · `DELETE /contracts/:id`

---

## Events (calendario e hitos)

### `GET /events`

Query params: `type` (`Deadline|Payment|Meeting|Milestone`), `from`, `to` (ISO), `clientId`, `projectId`. Orden ascendente por fecha.

### `GET /events/upcoming?days=30`

Eventos no completados entre hoy y `days` días. Por defecto 30.

### `POST /events`

```json
{
  "title": "Hito de pago — 40%",
  "description": "Segundo hito del contrato.",
  "type": "Payment",
  "date": "2026-11-10T10:00:00.000Z",
  "amount": 9800,
  "clientId": "6f1c...",
  "projectId": "a1b2..."
}
```

Obligatorios: `title`, `date`.

### `PUT /events/:id` · `PATCH /events/:id` · `DELETE /events/:id`

`PATCH` acepta `{ "completed": true }`.

---

## Dashboard

### `GET /dashboard/summary`

```json
{
  "success": true,
  "data": {
    "clients": { "total": 6, "active": 3 },
    "projects": { "total": 6, "active": 3, "completed": 1, "avgProgress": 49 },
    "proposals": { "total": 4, "accepted": 1 },
    "contracts": { "total": 4, "signed": 2 },
    "revenue": { "estimated": 141000, "signed": 62500, "pipeline": 31500 },
    "workload": [
      { "status": "Backlog", "count": 2, "budget": 46500 },
      { "status": "In Progress", "count": 2, "budget": 56500 },
      { "status": "In Review", "count": 1, "budget": 38000 },
      { "status": "Completed", "count": 1, "budget": 15000 }
    ],
    "upcomingEvents": 7
  }
}
```

### `GET /dashboard/activity`

Devuelve hasta 8 elementos combinados (proyectos, contratos, propuestas y eventos) ordenados por fecha.

---

## Python service (puerto 8000)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del microservicio |
| GET | `/api/templates` | Catálogo de plantillas |
| POST | `/api/contracts/pdf` | Genera PDF del contrato (`application/pdf`) |
| POST | `/api/analysis/project-health` | Score 0–100 y riesgos por proyecto |

Payload de `/api/contracts/pdf`:

```json
{
  "title": "Contrato — Nova Commerce",
  "template": "Software Development Agreement",
  "content": "1. SCOPE\n...",
  "amount": 24500,
  "currency": "USD",
  "intellectualProperty": "...",
  "status": "Signed",
  "client": { "name": "María González", "company": "Nova Retail" },
  "project": { "title": "Nova Commerce Platform" }
}
```

---

## Ejemplos rápidos (curl)

```bash
curl http://localhost:4000/api/clients
curl http://localhost:4000/api/dashboard/summary

curl -X POST http://localhost:4000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana López","email":"ana@studio.dev","company":"Studio","status":"Prospect"}'

curl -X PATCH http://localhost:4000/api/projects/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed"}'
```
