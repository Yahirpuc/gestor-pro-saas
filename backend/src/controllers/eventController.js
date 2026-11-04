const { Event, Client, Project } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const TYPES = ['Deadline', 'Payment', 'Meeting', 'Milestone'];

const includes = [
  { model: Client, as: 'client', attributes: ['id', 'name', 'company'] },
  { model: Project, as: 'project', attributes: ['id', 'title'] },
];

exports.list = asyncHandler(async (req, res) => {
  const { type, from, to, clientId, projectId } = req.query;
  const where = {};
  if (type) where.type = type;
  if (clientId) where.clientId = clientId;
  if (projectId) where.projectId = projectId;

  const { Op } = require('sequelize');
  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = new Date(from);
    if (to) where.date[Op.lte] = new Date(to);
  }

  const events = await Event.findAll({
    where,
    include: includes,
    order: [['date', 'ASC']],
  });
  res.json({ success: true, data: events });
});

exports.upcoming = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');
  const days = Number(req.query.days) || 30;
  const now = new Date();
  const limit = new Date(now);
  limit.setDate(limit.getDate() + days);

  const events = await Event.findAll({
    where: { date: { [Op.gte]: now, [Op.lte]: limit }, completed: false },
    include: includes,
    order: [['date', 'ASC']],
  });
  res.json({ success: true, data: events });
});

exports.get = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id, { include: includes });
  if (!event) throw new ApiError(404, 'Event not found');
  res.json({ success: true, data: event });
});

exports.create = asyncHandler(async (req, res) => {
  const { title, description, type, date, amount, clientId, projectId, contractId } = req.body;
  if (!title || !date) throw new ApiError(400, 'title and date are required');
  if (type && !TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${TYPES.join(', ')}`);
  }
  if (clientId) {
    const client = await Client.findByPk(clientId);
    if (!client) throw new ApiError(400, 'Linked client does not exist');
  }
  if (projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new ApiError(400, 'Linked project does not exist');
  }

  const event = await Event.create({
    title,
    description,
    type,
    date,
    amount,
    clientId: clientId || null,
    projectId: projectId || null,
    contractId: contractId || null,
  });
  res.status(201).json({ success: true, data: event });
});

exports.update = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const fields = [
    'title',
    'description',
    'type',
    'date',
    'completed',
    'amount',
    'clientId',
    'projectId',
    'contractId',
  ];
  const payload = {};
  for (const key of fields) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (payload.type && !TYPES.includes(payload.type)) {
    throw new ApiError(400, `type must be one of: ${TYPES.join(', ')}`);
  }
  await event.update(payload);
  res.json({ success: true, data: event });
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  await event.destroy();
  res.json({ success: true, message: 'Event deleted' });
});
