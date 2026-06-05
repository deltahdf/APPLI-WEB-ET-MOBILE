const Sequelize = require('sequelize')
const db = require('./database.js')
const user = require('./users.js')
const groups = db.define('groups', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(128),
    validate: {
      is: /^[0-9a-z\-'\s]{1,128}$/i
    }
  },
  ownerId: {
    type: Sequelize.INTEGER,
  }
}, { timestamps: false })

groups.belongsToMany(user, { foreignKey: 'userId', through:"userGroups", as: 'users' });
user.belongsToMany(groups, {foreignKey: "groupId", through: "userGroups", as: "groups"})

module.exports = groups
