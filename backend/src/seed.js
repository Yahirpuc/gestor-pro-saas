/**
 * Seeds the database with realistic demo data for local development.
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Client, Project, Proposal, Contract, Event, User, CompanySetting } = require('../src/models');

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database reset.');

  await CompanySetting.create({ id: 1, name: 'Norbe', tagline: 'Software Studio', accentColor: '#6366f1' });

  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Administrador Norbe', firstName: 'Administrador', lastName: 'Norbe', email: 'admin@norbe.local', password: hashed, role: 'admin' });

  const clients = await Client.bulkCreate([
    {
      name: 'María González',
      company: 'Nova Retail',
      email: 'maria@novaretail.com',
      phone: '+34 612 345 678',
      status: 'Active',
      notes: 'Cliente estratégico. Prefiere comunicación por Slack.',
    },
    {
      name: 'James Carter',
      company: 'FinEdge Capital',
      email: 'james@finedge.io',
      phone: '+1 415 555 0142',
      status: 'Active',
      notes: 'Proyecto fintech con requisitos de compliance estrictos.',
    },
    {
      name: 'Lucía Fernández',
      company: 'HealthPlus',
      email: 'lucia@healthplus.es',
      phone: '+34 699 112 233',
      status: 'Prospect',
      notes: 'Interesada en integración con Stripe y portal de pacientes.',
    },
    {
      name: 'Ahmed Ben Ali',
      company: 'Atlas Logistics',
      email: 'ahmed@atlaslog.com',
      phone: '+212 661 223 344',
      status: 'Active',
      notes: 'Necesita tracking en tiempo real y app móvil.',
    },
    {
      name: 'Sofía Ramírez',
      company: 'EduSpark',
      email: 'sofia@eduspark.mx',
      phone: '+52 55 1234 5678',
      status: 'Inactive',
      notes: 'Proyecto pausado hasta nuevo presupuesto trimestral.',
    },
    {
      name: 'Daniel Okafor',
      company: 'GreenGrid Energy',
      email: 'daniel@greengrid.africa',
      phone: '+234 802 555 7788',
      status: 'Prospect',
      notes: 'Dashboard de consumo energético, posible fase 2.',
    },
  ]);

  const [nova, finedge, health, atlas, , green] = clients;

  const projects = await Project.bulkCreate([
    {
      title: 'Nova Commerce Platform',
      description: 'Plataforma e-commerce headless con Next.js, Stripe y panel administrativo.',
      status: 'In Progress',
      priority: 'High',
      progress: 62,
      startDate: daysFromNow(-30),
      endDate: daysFromNow(35),
      budget: 24500,
      clientId: nova.id,
    },
    {
      title: 'FinEdge Compliance Dashboard',
      description: 'Panel de auditoría y reportes regulatorios para operaciones financieras.',
      status: 'In Review',
      priority: 'Urgent',
      progress: 85,
      startDate: daysFromNow(-60),
      endDate: daysFromNow(10),
      budget: 38000,
      clientId: finedge.id,
    },
    {
      title: 'HealthPlus Patient Portal',
      description: 'Portal de pacientes con agenda, historiales y pagos online.',
      status: 'Backlog',
      priority: 'Medium',
      progress: 0,
      startDate: daysFromNow(10),
      endDate: daysFromNow(90),
      budget: 19500,
      clientId: health.id,
    },
    {
      title: 'Atlas Fleet Tracker',
      description: 'Seguimiento GPS de flota con alertas y app móvil React Native.',
      status: 'In Progress',
      priority: 'High',
      progress: 40,
      startDate: daysFromNow(-20),
      endDate: daysFromNow(55),
      budget: 32000,
      clientId: atlas.id,
    },
    {
      title: 'GreenGrid Energy Analytics',
      description: 'Dashboard de métricas de consumo y predicciones con ML.',
      status: 'Backlog',
      priority: 'Low',
      progress: 5,
      startDate: daysFromNow(20),
      endDate: daysFromNow(120),
      budget: 27000,
      clientId: green.id,
    },
    {
      title: 'Nova Mobile App',
      description: 'App móvil de fidelización para clientes de Nova Retail.',
      status: 'Completed',
      priority: 'Medium',
      progress: 100,
      startDate: daysFromNow(-120),
      endDate: daysFromNow(-15),
      budget: 15000,
      clientId: nova.id,
    },
  ]);

  const [novaProject, finedgeProject, healthProject, atlasProject, greenProject, novaMobile] = projects;

  await Proposal.bulkCreate([
    {
      title: 'Propuesta — Nova Commerce Platform',
      summary: 'Diseño y desarrollo del nuevo e-commerce de Nova Retail.',
      scope: 'Headless storefront, panel admin, integración Stripe, migración de catálogo.',
      deliverables: 'Código fuente, documentación técnica, 3 meses de soporte, capacitación.',
      amount: 24500,
      currency: 'USD',
      validUntil: daysFromNow(20),
      status: 'Accepted',
      clientId: nova.id,
      projectId: novaProject.id,
    },
    {
      title: 'Propuesta — HealthPlus Patient Portal',
      summary: 'Portal de pacientes con pagos y agenda.',
      scope: 'Autenticación, agenda, historiales, pagos Stripe.',
      deliverables: 'Portal web, API documentada, deploy en la nube.',
      amount: 19500,
      currency: 'USD',
      validUntil: daysFromNow(15),
      status: 'Sent',
      clientId: health.id,
      projectId: healthProject.id,
    },
    {
      title: 'Propuesta — GreenGrid Analytics Fase 1',
      summary: 'Descubrimiento y dashboard MVP.',
      scope: 'ETL de datos, dashboard de consumo, 3 KPIs principales.',
      deliverables: 'MVP funcional, documentación de datos.',
      amount: 12000,
      currency: 'USD',
      validUntil: daysFromNow(30),
      status: 'Draft',
      clientId: green.id,
      projectId: greenProject.id,
    },
    {
      title: 'Propuesta — Atlas Fleet Tracker Extensión',
      summary: 'Módulo de mantenimiento predictivo.',
      scope: 'Alertas de mantenimiento y reportes automatizados.',
      deliverables: 'Módulo integrado y documentación.',
      amount: 8600,
      currency: 'USD',
      validUntil: daysFromNow(-5),
      status: 'Rejected',
      clientId: atlas.id,
      projectId: atlasProject.id,
    },
  ]);

  await Contract.bulkCreate([
    {
      title: 'Contrato — Nova Commerce Platform',
      template: 'Software Development Agreement',
      content:
        'El presente contrato regula el desarrollo de la plataforma Nova Commerce entre el Proveedor y Nova Retail.',
      scope: 'Desarrollo completo del e-commerce headless, panel administrativo e integraciones de pago.',
      timeline: '16 semanas desde la firma',
      amount: 24500,
      currency: 'USD',
      intellectualProperty:
        'El código fuente personalizado será propiedad del Cliente tras el pago total. Las librerías open source mantienen sus licencias.',
      status: 'Signed',
      signedAt: daysFromNow(-28),
      clientId: nova.id,
      projectId: novaProject.id,
    },
    {
      title: 'Contrato — FinEdge Compliance Dashboard',
      template: 'Enterprise Software Agreement',
      content:
        'Acuerdo para el desarrollo y mantenimiento del dashboard de compliance de FinEdge Capital.',
      scope: 'Dashboard de auditoría, reportes regulatorios, integración con core bancario.',
      timeline: '12 semanas',
      amount: 38000,
      currency: 'USD',
      intellectualProperty: 'Propiedad del Cliente. El Proveedor conserva derechos sobre componentes genéricos reutilizables.',
      status: 'Signed',
      signedAt: daysFromNow(-58),
      clientId: finedge.id,
      projectId: finedgeProject.id,
    },
    {
      title: 'Contrato — Atlas Fleet Tracker',
      template: 'Software Development Agreement',
      content: 'Contrato de desarrollo para el sistema de seguimiento de flota de Atlas Logistics.',
      scope: 'Backend de tracking, app móvil, panel web de administración.',
      timeline: '14 semanas',
      amount: 32000,
      currency: 'USD',
      intellectualProperty: 'Licencia perpetua para el Cliente, no exclusiva.',
      status: 'Sent',
      clientId: atlas.id,
      projectId: atlasProject.id,
    },
    {
      title: 'Contrato — Nova Mobile App (Soporte)',
      template: 'Maintenance Agreement',
      content: 'Acuerdo de soporte y mantenimiento post-lanzamiento de la app móvil de Nova Retail.',
      scope: 'Corrección de bugs, actualizaciones de seguridad y mejoras menores.',
      timeline: '6 meses renovables',
      amount: 3600,
      currency: 'USD',
      intellectualProperty: 'El código existente pertenece al Cliente.',
      status: 'Archived',
      signedAt: daysFromNow(-90),
      clientId: nova.id,
      projectId: novaMobile.id,
    },
  ]);

  await Event.bulkCreate([
    {
      title: 'Entrega del módulo de checkout',
      description: 'Demo del flujo de pago completo para Nova Retail.',
      type: 'Milestone',
      date: daysFromNow(2),
      clientId: nova.id,
      projectId: novaProject.id,
    },
    {
      title: 'Reunión de revisión de compliance',
      description: 'Presentación del dashboard a stakeholders de FinEdge.',
      type: 'Meeting',
      date: daysFromNow(4),
      clientId: finedge.id,
      projectId: finedgeProject.id,
    },
    {
      title: 'Hito de pago — 40% Nova Commerce',
      description: 'Factura correspondiente al segundo hito del contrato.',
      type: 'Payment',
      date: daysFromNow(7),
      amount: 9800,
      clientId: nova.id,
      projectId: novaProject.id,
    },
    {
      title: 'Deadline — Compliance Dashboard v1.0',
      description: 'Entrega final de la versión 1.0 a FinEdge.',
      type: 'Deadline',
      date: daysFromNow(10),
      clientId: finedge.id,
      projectId: finedgeProject.id,
    },
    {
      title: 'Kickoff HealthPlus Portal',
      description: 'Reunión inicial con el equipo de HealthPlus.',
      type: 'Meeting',
      date: daysFromNow(14),
      clientId: health.id,
      projectId: healthProject.id,
    },
    {
      title: 'Hito de pago — Atlas Fleet',
      description: 'Pago inicial del proyecto de tracking.',
      type: 'Payment',
      date: daysFromNow(18),
      amount: 9600,
      clientId: atlas.id,
      projectId: atlasProject.id,
    },
    {
      title: 'Demo GreenGrid Analytics',
      description: 'Presentación del MVP al equipo directivo.',
      type: 'Milestone',
      date: daysFromNow(26),
      clientId: green.id,
      projectId: greenProject.id,
    },
  ]);

  console.log('✔ Seed completed: 6 clients, 6 projects, 4 proposals, 4 contracts, 7 events.');
  console.log('✔ Default user: admin@norbe.local / admin123');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
