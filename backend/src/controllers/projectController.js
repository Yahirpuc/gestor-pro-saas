const { Project, Client } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['Backlog', 'In Progress', 'In Review', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const projectIncludes = [{ model: Client, as: 'client', attributes: ['id', 'name', 'company', 'email'] }];

exports.list = asyncHandler(async (req, res) => {
  const { status, clientId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const projects = await Project.findAll({
    where,
    include: projectIncludes,
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: projects });
});

exports.get = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, { include: projectIncludes });
  if (!project) throw new ApiError(404, 'Project not found');
  res.json({ success: true, data: project });
});

exports.create = asyncHandler(async (req, res) => {
  const { title, description, status, priority, progress, startDate, endDate, budget, clientId } =
    req.body;
  if (!title) throw new ApiError(400, 'title is required');
  if (status && !STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
  if (priority && !PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  if (clientId) {
    const client = await Client.findByPk(clientId);
    if (!client) throw new ApiError(400, 'Linked client does not exist');
  }

  const project = await Project.create({
    title,
    description,
    status,
    priority,
    progress,
    startDate,
    endDate,
    budget,
    clientId,
  });
  res.status(201).json({ success: true, data: project });
});

exports.update = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const fields = [
    'title',
    'description',
    'status',
    'priority',
    'progress',
    'startDate',
    'endDate',
    'budget',
    'clientId',
  ];
  const payload = {};
  for (const key of fields) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (payload.status && !STATUSES.includes(payload.status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
  if (payload.priority && !PRIORITIES.includes(payload.priority)) {
    throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  if (payload.clientId) {
    const client = await Client.findByPk(payload.clientId);
    if (!client) throw new ApiError(400, 'Linked client does not exist');
  }

  await project.update(payload);
  res.json({ success: true, data: project });
});

exports.remove = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  await project.destroy();
  res.json({ success: true, message: 'Project deleted' });
});
