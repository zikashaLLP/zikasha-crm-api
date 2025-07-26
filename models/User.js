const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agency = require('./Agency');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password_hash: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    defaultValue: 'staff',
  }
}, { timestamps: true });

User.belongsTo(Agency, { foreignKey: 'agency_id' });
Agency.hasMany(User, { foreignKey: 'agency_id' });

module.exports = User;
