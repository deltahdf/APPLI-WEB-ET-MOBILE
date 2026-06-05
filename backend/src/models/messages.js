const Sequelize = require('sequelize');
const db = require('./database.js');
const groups = require('./groups.js');

const messages = db.define('messages', {
  content: {
    type: Sequelize.TEXT,  
  },
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true,
  },
  gid: {
    type: Sequelize.INTEGER,
  },
  uid: {
    type: Sequelize.INTEGER,
  }
}, { timestamps: false });

groups.hasMany(messages);
messages.belongsTo(groups);

module.exports = messages;
