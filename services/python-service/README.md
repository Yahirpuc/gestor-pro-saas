# Orbit Auxiliary Service (Python / FastAPI)

Microservicio auxiliar de **Orbit Studio OS**. Se encarga de tareas que no pertenecen al API principal:

- **Generación de contratos en PDF** con ReportLab (cabecera, metadatos, cláusulas y bloque de firma).
- **Análisis de salud de proyectos** (progreso vs. calendario, riesgos y score 0–100).
- Catálogo de plantillas de contrato.

## Requisitos

- Python 3.10+

## Instalación

```bash
cd services/python-service
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --reload --port 8000
```

- Documentación interactiva: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del servicio |
| GET | `/api/templates` | Catálogo de plantillas de contrato |
| POST | `/api/contracts/pdf` | Recibe un contrato y devuelve un PDF (`application/pdf`) |
| POST | `/api/analysis/project-health` | Calcula score y riesgos por proyecto |

### Ejemplo — PDF

```bash
curl -X POST http://localhost:8000/api/contracts/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Contrato — Nova Commerce",
    "template": "Software Development Agreement",
    "content": "1. SCOPE\nDesarrollo de la plataforma...\n2. TIMELINE\n16 semanas.",
    "amount": 24500,
    "currency": "USD",
    "status": "Signed",
    "client": { "name": "María González", "company": "Nova Retail" },
    "project": { "title": "Nova Commerce Platform" }
  }' --output contrato.pdf
```

### Ejemplo — Project health

```bash
curl -X POST http://localhost:8000/api/analysis/project-health \
  -H "Content-Type: application/json" \
  -d '{
    "projects": [{
      "id": "p1",
      "title": "Nova Commerce",
      "status": "In Progress",
      "progress": 62,
      "budget": 24500,
      "startDate": "2026-09-01T00:00:00Z",
      "endDate": "2026-12-15T00:00:00Z"
    }]
  }'
```

El frontend consume `/api/contracts/pdf` desde el botón **Download PDF** de la sección de contratos.
