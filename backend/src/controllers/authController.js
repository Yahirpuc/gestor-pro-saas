const bcrypt = require('bcryptjs');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../middleware/auth');

exports.register = asyncHandler(async (req, res) => {
  const { name, firstName, lastName, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: { message: 'Name, email and password are required' } });
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, firstName, lastName, email, password: hashed });
  const token = signToken(user);
  res.status(201).json({ success: true, data: { token, user: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
  }
  const token = signToken(user);
  res.json({ success: true, data: { token, user: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } } });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'firstName', 'lastName', 'email', 'role'] });
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  res.json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  const { firstName, lastName, name } = req.body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (name !== undefined) user.name = name;
  // keep name in sync
  if (firstName || lastName) {
    user.name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name;
  }
  await user.save();
  res.json({ success: true, data: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
});
