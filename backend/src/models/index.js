const sequelize = require('../config/database');

const Client = require('./Client');
const Project = require('./Project');
const Proposal = require('./Proposal');
const Contract = require('./Contract');
const Event = require('./Event');
const User = require('./User');
const CompanySetting = require('./CompanySetting');

/* ---------------- Associations ---------------- */
Client.hasMany(Project, { as: 'projects', foreignKey: 'clientId' });
Project.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

Client.hasMany(Proposal, { as: 'proposals', foreignKey: 'clientId' });
Proposal.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Project.hasMany(Proposal, { as: 'proposals', foreignKey: 'projectId' });
Proposal.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Client.hasMany(Contract, { as: 'contracts', foreignKey: 'clientId' });
Contract.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Project.hasMany(Contract, { as: 'contracts', foreignKey: 'projectId' });
Contract.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Client.hasMany(Event, { as: 'events', foreignKey: 'clientId' });
Event.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Project.hasMany(Event, { as: 'events', foreignKey: 'projectId' });
Event.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
Contract.hasMany(Event, { as: 'events', foreignKey: 'contractId' });
Event.belongsTo(Contract, { as: 'contract', foreignKey: 'contractId' });

module.exports = {
  sequelize,
  Client,
  Project,
  Proposal,
  Contract,
  Event,
  User,
  CompanySetting,
};
