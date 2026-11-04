const { Proposal, Client, Project } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected'];

const includes = [
  { model: Client, as: 'client', attributes: ['id', 'name', 'company'] },
  { model: Project, as: 'project', attributes: ['id', 'title'] },
];

exports.list = asyncHandler(async (req, res) => {
  const { status, clientId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const proposals = await Proposal.findAll({
    where,
    include: includes,
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: proposals });
});

exports.get = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findByPk(req.params.id, { include: includes });
  if (!proposal) throw new ApiError(404, 'Proposal not found');
  res.json({ success: true, data: proposal });
});

exports.create = asyncHandler(async (req, res) => {
  const {
    title,
    summary,
    scope,
    deliverables,
    amount,
    currency,
    validUntil,
    status,
    clientId,
    projectId,
  } = req.body;
  if (!title) throw new ApiError(400, 'title is required');
  if (status && !STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
  if (!clientId) throw new ApiError(400, 'clientId is required');
  const client = await Client.findByPk(clientId);
  if (!client) throw new ApiError(400, 'Linked client does not exist');

  const proposal = await Proposal.create({
    title,
    summary,
    scope,
    deliverables,
    amount,
    currency,
    validUntil,
    status,
    clientId,
    projectId: projectId || null,
  });
  res.status(201).json({ success: true, data: proposal });
});

exports.update = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findByPk(req.params.id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const fields = [
    'title',
    'summary',
    'scope',
    'deliverables',
    'amount',
    'currency',
    'validUntil',
    'status',
    'clientId',
    'projectId',
  ];
  const payload = {};
  for (const key of fields) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (payload.status && !STATUSES.includes(payload.status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
  await proposal.update(payload);
  res.json({ success: true, data: proposal });
});

exports.remove = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findByPk(req.params.id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');
  await proposal.destroy();
  res.json({ success: true, message: 'Proposal deleted' });
});
