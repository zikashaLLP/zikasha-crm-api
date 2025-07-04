const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Inquiry = require('./Inquiry');

const Log = sequelize.define('Log', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  followup_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
}, {
  timestamps: true
});

Log.belongsTo(Inquiry, { foreignKey: 'inquiry_id' });
Inquiry.hasMany(Log, { foreignKey: 'inquiry_id' });

module.exports = Log;
