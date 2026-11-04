const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
  },
  scope: {
    type: DataTypes.TEXT,
  },
  deliverables: {
    type: DataTypes.TEXT,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  validUntil: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Accepted', 'Rejected'),
    defaultValue: 'Draft',
  },
});

module.exports = Proposal;
