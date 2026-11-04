const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('Deadline', 'Payment', 'Meeting', 'Milestone'),
    defaultValue: 'Deadline',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
  },
});

module.exports = Event;
