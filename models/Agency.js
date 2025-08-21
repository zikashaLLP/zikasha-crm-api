const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agency = sequelize.define('Agency', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  crm_type: {
    type: DataTypes.ENUM('real-estate', 'doctor', 'office'),
    defaultValue: 'real-estate',
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, { timestamps: true });

module.exports = Agency;
