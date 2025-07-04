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
  }
}, { timestamps: true });

module.exports = Agency;
