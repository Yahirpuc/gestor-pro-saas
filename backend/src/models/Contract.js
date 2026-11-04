const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  template: {
    type: DataTypes.STRING,
    defaultValue: 'Software Development Agreement',
  },
  content: {
    type: DataTypes.TEXT,
  },
  scope: {
    type: DataTypes.TEXT,
  },
  timeline: {
    type: DataTypes.STRING,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  intellectualProperty: {
    type: DataTypes.TEXT,
  },
  signedAt: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Signed', 'Archived'),
    defaultValue: 'Draft',
  },
});

module.exports = Contract;
