const { Contract, Client, Project } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['Draft', 'Sent', 'Signed', 'Archived'];

const includes = [
  { model: Client, as: 'client', attributes: ['id', 'name', 'company'] },
  { model: Project, as: 'project', attributes: ['id', 'title'] },
];

exports.list = asyncHandler(async (req, res) => {
  const { status, clientId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const contracts = await Contract.findAll({
    where,
    include: includes,
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: contracts });
});

exports.get = asyncHandler(async (req, res) => {
  const contract = await Contract.findByPk(req.params.id, { include: includes });
  if (!contract) throw new ApiError(404, 'Contract not found');
  res.json({ success: true, data: contract });
});

exports.create = asyncHandler(async (req, res) => {
  const {
    title,
    template,
    content,
    scope,
    timeline,
    amount,
    currency,
    intellectualProperty,
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

  const contract = await Contract.create({
    title,
    template,
    content,
    scope,
    timeline,
    amount,
    currency,
    intellectualProperty,
    status,
    clientId,
    projectId: projectId || null,
    signedAt: status === 'Signed' ? new Date() : null,
  });
  res.status(201).json({ success: true, data: contract });
});

exports.update = asyncHandler(async (req, res) => {
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) throw new ApiError(404, 'Contract not found');

  const fields = [
    'title',
    'template',
    'content',
    'scope',
    'timeline',
    'amount',
    'currency',
    'intellectualProperty',
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
  if (payload.status === 'Signed' && !contract.signedAt) {
    payload.signedAt = new Date();
  }
  if (payload.status === 'Draft') payload.signedAt = null;

  await contract.update(payload);
  res.json({ success: true, data: contract });
});

exports.remove = asyncHandler(async (req, res) => {
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) throw new ApiError(404, 'Contract not found');
  await contract.destroy();
  res.json({ success: true, message: 'Contract deleted' });
});
