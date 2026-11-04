const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanySetting = sequelize.define(
  'CompanySetting',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Orbit' },
    tagline: { type: DataTypes.STRING, allowNull: true },
    accentColor: { type: DataTypes.STRING, allowNull: true, defaultValue: '#6366f1' },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'company_settings', timestamps: true }
);

module.exports = CompanySetting;
