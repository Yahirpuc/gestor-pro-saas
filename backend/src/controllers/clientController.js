const { Client, Project, Proposal, Contract } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_STATUS = ['Active', 'Prospect', 'Inactive'];

exports.list = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const where = {};
  if (status) where.status = status;

  const clients = await Client.findAll({
    where,
    include: [
      { model: Project, as: 'projects', attributes: ['id', 'title', 'status', 'budget'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  const term = (search || '').toLowerCase().trim();
  const data = term
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.company || '').toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      )
    : clients;

  res.json({ success: true, data });
});

exports.get = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id, {
    include: [
      { model: Project, as: 'projects' },
      { model: Proposal, as: 'proposals' },
      { model: Contract, as: 'contracts' },
    ],
  });
  if (!client) throw new ApiError(404, 'Client not found');
  res.json({ success: true, data: client });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, company, email, phone, notes, status } = req.body;
  if (!name || !email) throw new ApiError(400, 'name and email are required');
  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ALLOWED_STATUS.join(', ')}`);
  }
  const client = await Client.create({ name, company, email, phone, notes, status });
  res.status(201).json({ success: true, data: client });
});

exports.update = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) throw new ApiError(404, 'Client not found');

  const { name, company, email, phone, notes, status } = req.body;
  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ALLOWED_STATUS.join(', ')}`);
  }

  await client.update({
    name: name ?? client.name,
    company: company ?? client.company,
    email: email ?? client.email,
    phone: phone ?? client.phone,
    notes: notes ?? client.notes,
    status: status ?? client.status,
  });
  res.json({ success: true, data: client });
});

exports.remove = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) throw new ApiError(404, 'Client not found');
  await client.destroy();
  res.json({ success: true, message: 'Client deleted' });
});
