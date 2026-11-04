const { Op } = require('sequelize');
const { Client, Project, Proposal, Contract, Event } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.summary = asyncHandler(async (req, res) => {
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  const [
    totalClients,
    activeClients,
    totalProjects,
    activeProjects,
    completedProjects,
    totalProposals,
    acceptedProposals,
    signedContracts,
    totalContracts,
    upcomingEvents,
  ] = await Promise.all([
    Client.count(),
    Client.count({ where: { status: 'Active' } }),
    Project.count(),
    Project.count({ where: { status: { [Op.in]: ['In Progress', 'In Review'] } } }),
    Project.count({ where: { status: 'Completed' } }),
    Proposal.count(),
    Proposal.count({ where: { status: 'Accepted' } }),
    Contract.count({ where: { status: 'Signed' } }),
    Contract.count(),
    Event.count({
      where: { date: { [Op.gte]: now, [Op.lte]: in30Days }, completed: false },
    }),
  ]);

  const projects = await Project.findAll({ attributes: ['status', 'budget', 'progress'] });
  const contracts = await Contract.findAll({
    attributes: ['status', 'amount'],
  });
  const proposals = await Proposal.findAll({ attributes: ['status', 'amount'] });

  const num = (v) => Number(v || 0);

  const pipelineRevenue = proposals
    .filter((p) => ['Draft', 'Sent'].includes(p.status))
    .reduce((acc, p) => acc + num(p.amount), 0);

  const signedRevenue = contracts
    .filter((c) => c.status === 'Signed')
    .reduce((acc, c) => acc + num(c.amount), 0);

  const estimatedRevenue = projects
    .filter((p) => p.status !== 'Completed')
    .reduce((acc, p) => acc + num(p.budget), 0);

  const workload = ['Backlog', 'In Progress', 'In Review', 'Completed'].map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
    budget: projects
      .filter((p) => p.status === status)
      .reduce((acc, p) => acc + num(p.budget), 0),
  }));

  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0;

  res.json({
    success: true,
    data: {
      clients: { total: totalClients, active: activeClients },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        avgProgress,
      },
      proposals: { total: totalProposals, accepted: acceptedProposals },
      contracts: { total: totalContracts, signed: signedContracts },
      revenue: { estimated: estimatedRevenue, signed: signedRevenue, pipeline: pipelineRevenue },
      workload,
      upcomingEvents,
    },
  });
});

exports.activity = asyncHandler(async (req, res) => {
  const [projects, contracts, proposals, events] = await Promise.all([
    Project.findAll({ limit: 5, order: [['updatedAt', 'DESC']], attributes: ['id', 'title', 'status', 'updatedAt'] }),
    Contract.findAll({ limit: 5, order: [['updatedAt', 'DESC']], attributes: ['id', 'title', 'status', 'amount', 'updatedAt'] }),
    Proposal.findAll({ limit: 5, order: [['updatedAt', 'DESC']], attributes: ['id', 'title', 'status', 'amount', 'updatedAt'] }),
    Event.findAll({
      limit: 5,
      order: [['date', 'ASC']],
      attributes: ['id', 'title', 'type', 'date', 'completed'],
      where: { date: { [Op.gte]: new Date() } },
    }),
  ]);

  const items = [
    ...projects.map((p) => ({
      id: p.id,
      kind: 'project',
      title: p.title,
      subtitle: `Project · ${p.status}`,
      date: p.updatedAt,
    })),
    ...contracts.map((c) => ({
      id: c.id,
      kind: 'contract',
      title: c.title,
      subtitle: `Contract · ${c.status}`,
      date: c.updatedAt,
    })),
    ...proposals.map((p) => ({
      id: p.id,
      kind: 'proposal',
      title: p.title,
      subtitle: `Proposal · ${p.status}`,
      date: p.updatedAt,
    })),
    ...events.map((e) => ({
      id: e.id,
      kind: 'event',
      title: e.title,
      subtitle: `${e.type} · ${new Date(e.date).toLocaleDateString()}`,
      date: e.date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  res.json({ success: true, data: items });
});
