# gestor-pro-saas

Plataforma modular y open source para la gestión de clientes, proyectos, propuestas y contratos, con calendario integrado y generación avanzada de documentos PDF. Diseñada para desarrolladores independientes, agencias y profesionales que quieren controlar su negocio sin depender de servicios de terceros.

> **Uso local, personal y open source.** Sin planes de pago, sin licencias comerciales, sin cobros. Libre para usar, modificar y mejorar.

---

## Tabla de contenidos

- [Qué es este SaaS](#qué-es-este-saas)
- [Arquitectura y funcionamiento](#arquitectura-y-funcionamiento-del-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Instalación y configuración](#instalación-y-configuración)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Guía de uso de cada módulo](#guía-de-uso-de-cada-módulo)
- [Personalización de plantillas](#personalización-de-plantillas-contratos-y-propuestas)
- [Autoría](#autoría)
- [Licencia](#licencia-open-source)

---

## Qué es este SaaS

**gestor-pro-saas** es una plataforma integral de gestión a la medida que centraliza:

- **CRM de clientes**: contactos, empresas, estados (activo, prospecto, inactivo), notas y valor de cartera.
- **Gestión de proyectos**: tablero Kanban con arrastrar y soltar, prioridades, progreso, presupuestos y fechas límite.
- **Propuestas comerciales**: creación, envío y seguimiento de propuestas con alcance, entregables y validez.
- **Contratos**: redacción, envío, firma y archivo, con cláusulas personalizables.
- **Calendario**: entregas, hitos de pago, reuniones y milestones con vista mensual.
- **Dashboard**: KPIs, gráficas de presupuesto por etapa, carga de trabajo y actividad reciente.
- **Generación de PDFs**: propuestas y contratos como archivos PDF separados y profesionales.
- **Autenticación local**: login con usuario y contraseña sobre SQLite.
- **Ajustes**: nombre de la empresa, tema claro/oscuro y estado de los servicios.

Todo funciona en local, con una capa de datos lista para migrar a Supabase/Postgres.

---

## Arquitectura y funcionamiento del proyecto

El proyecto sigue el patrón **MVC en el backend** y una SPA en React en el frontend, comunicándose por una API REST.

### Backend (`backend/`)

- **Express 5** con rutas, controladores y modelos Sequelize.
- **SQLite** como base de datos local (archivo `backend/database.sqlite`, generado al hacer seed).
- Modelos: `Client`, `Project`, `Proposal`, `Contract`, `Event`, `User`, `CompanySetting`.
- Asociaciones centralizadas en `src/models/index.js`.
- Middleware de autenticación JWT (`src/middleware/auth.js`) protege las rutas de datos.
- Controlador de dashboard con resumen y actividad reciente.

### Frontend (`frontend/`)

- **React 19 + Vite + Tailwind** con modo oscuro por defecto.
- **Contextos**: tema, toast, autenticación.
- **Hooks**: `useApi` para fetching centralizado.
- **Componentes reutilizables**: `card`, `btn-primary`, `field`, `chip`, etc.
- **Páginas**: Dashboard, Clientes, Proyectos, Propuestas, Contratos, Calendario, Ajustes, Login.
- **Plantillas aisladas** en `src/templates/` (ver más abajo).

### Servicio Python (`services/python-service/`)

- **FastAPI** en el puerto 8000.
- Genera PDFs profesionales con ReportLab (contratos y propuestas).
- Endpoint de análisis de salud de proyectos.

### Flujo de funcionamiento

1. El usuario inicia sesión (JWT).
2. El frontend (Vite, puerto 5173) consume la API (puerto 4000) vía proxy `/api`.
3. Los datos se persisten en SQLite a través de Sequelize.
4. Para generar PDFs, el frontend envía los datos al servicio Python (puerto 8000), que devuelve un `Blob` descargable.
5. Las plantillas de contratos y propuestas viven aisladas en `frontend/src/templates/`, separando contenido de diseño.

### Separación en `templates/`

```
frontend/src/templates/
├── contracts/
│   ├── catalog.js              # Catálogo de plantillas editables
│   ├── buildContractText.js    # Generador del texto legal (cláusulas)
│   ├── ContractDocument.jsx    # Diseño visual de la "hoja"
│   ├── printContract.js        # Maqueta imprimible
│   └── README.md
└── proposals/
    ├── catalog.js              # Secciones editables
    ├── buildProposalText.js    # Generador del texto de la propuesta
    ├── ProposalDocument.jsx    # Diseño visual
    ├── printProposal.js        # Maqueta imprimible
    └── README.md
```

Cada módulo maneja sus propias cláusulas, estilos y renderizado de forma aislada.

---

## Stack tecnológico

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 3, Framer Motion, Recharts, Lucide React |
| Backend | Node.js, Express 5, Sequelize 6, SQLite 3 |
| PDF/Analytics | Python, FastAPI, ReportLab |
| Auth | JWT (jsonwebtoken), bcryptjs |

---

## Instalación y configuración

### Requisitos previos

- Node.js 18+ y npm
- Python 3.10+ (para el servicio de PDF)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Yahirpuc/gestor-pro-saas.git
cd gestor-pro-saas
```

### 2. Instalar dependencias

```bash
# Raíz (scripts de conveniencia)
npm run install:all

# O manualmente:
cd backend && npm install
cd ../frontend && npm install
cd ../services/python-service && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia `backend/.env.example` a `backend/.env` y ajusta si es necesario:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=change-me-in-production
```

### 4. Sembrar la base de datos

```bash
cd backend
npm run seed
```

Esto crea el usuario administrador por defecto: `admin@norbe.local` / `admin123`.

### 5. Ejecutar en desarrollo

En terminales separadas:

```bash
# Backend (puerto 4000)
cd backend && npm run dev

# Frontend (puerto 5173)
cd frontend && npm run dev

# Servicio Python (puerto 8000)
cd services/python-service && .venv/Scripts/python -m uvicorn app.main:app --port 8000 --reload
```

O desde la raíz:

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Estructura del repositorio

```
gestor-pro-saas/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de base de datos
│   │   ├── controllers/     # Controladores MVC
│   │   ├── middleware/      # Auth, manejo de errores
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Rutas Express
│   │   ├── utils/           # Utilidades
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables y layout
│   │   ├── context/         # Theme, Toast, Auth
│   │   ├── hooks/           # useApi, etc.
│   │   ├── lib/             # api.js, constants, utils
│   │   ├── pages/           # Páginas de la app
│   │   ├── templates/       # Plantillas de contratos y propuestas (aisladas)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── services/
│   └── python-service/
│       ├── app/
│       │   ├── main.py      # Endpoints FastAPI
│       │   └── pdf_config.py # Estilos y configuración de PDFs
│       └── requirements.txt
├── docs/
│   └── API.md
├── README.md
└── package.json
```

---

## Guía de uso de cada módulo

### Clientes (CRM)
- Ruta: `/clients`.
- Crear, editar, eliminar clientes. Filtrar por estado (activo, prospecto, inactivo).
- Vista de detalle con proyectos, propuestas, contratos y finanzas.

### Proyectos
- Ruta: `/projects`.
- Vista de tablero Kanban (arrastrar y soltar) o lista.
- Filtrar por cliente y prioridad. Editar progreso, presupuesto y fechas.

### Propuestas
- Ruta: `/proposals`.
- Crear propuestas con alcance, entregables, importe y validez.
- Vista previa del documento y descarga de PDF (`propuesta.pdf`).
- Convertir una propuesta aceptada en contrato.

### Contratos
- Ruta: `/contracts`.
- Redactar contratos desde plantillas, enviar, firmar y archivar.
- Vista previa, impresión y descarga de PDF (`contrato.pdf`).
- Cambiar estado rápidamente desde el listado.

### Calendario
- Ruta: `/calendar`.
- Vista mensual con eventos (entregas, pagos, reuniones, milestones).
- Panel de próximos eventos y alertas de vencidos.

### Dashboard
- Ruta: `/`.
- KPIs, gráficas de presupuesto por etapa, carga de trabajo y actividad reciente.

### Ajustes
- Ruta: `/settings`.
- Nombre de la empresa (se refleja en sidebar, topbar y documentos).
- Tema claro/oscuro.
- Estado de los servicios (API, base de datos, servicio Python).

---

## Personalización de plantillas (contratos y propuestas)

### Contratos

Edita los archivos en `frontend/src/templates/contracts/`:

- **`catalog.js`**: añade o modifica plantillas (nombre, descripción, alcance por defecto, cláusula de propiedad intelectual).
- **`buildContractText.js`**: edita las cláusulas (secciones 1–10) del texto legal.
- **`ContractDocument.jsx`**: diseño visual de la vista previa (Tailwind).
- **`printContract.js`**: estilos de la versión imprimible.

### Propuestas

Edita los archivos en `frontend/src/templates/proposals/`:

- **`catalog.js`**: secciones editables (resumen, alcance, entregables).
- **`buildProposalText.js`**: texto completo de la propuesta.
- **`ProposalDocument.jsx`**: diseño visual.
- **`printProposal.js`**: estilos de impresión.

### PDFs (servicio Python)

Los estilos de los PDFs generados por el servicio Python se configuran en:

- `services/python-service/app/pdf_config.py`: colores, fuentes, márgenes y etiquetas.

---

## Autoría

Creado por **Yahir Alberto Ordoñez Puc**.

- GitHub: https://github.com/Yahirpuc
- LinkedIn: [https://linkedin.com/in/yahir-ordonez](https://www.linkedin.com/in/yahir-ordoñez-97aa76302/)
- 
- Email: yahirordzdev@gmail.com

---

## Licencia Open Source

Este proyecto se distribuye como software open source para uso personal, local y comunitario. Invitamos a la comunidad a mejorarlo, extenderlo y adaptarlo poco a poco. Sin cobros, sin licencias comerciales, sin restricciones artificiales.

---

## Notas finales

- El sistema está diseñado para correr en local. La capa de datos (Sequelize) permite migrar a Supabase/Postgres cambiando la configuración en `backend/src/config/database.js`.
- Las credenciales por defecto son solo para desarrollo local. En producción, define `JWT_SECRET` y cambia la contraseña del administrador.
