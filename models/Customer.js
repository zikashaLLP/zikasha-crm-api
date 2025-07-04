const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agency = require('./Agency');

const Customer = sequelize.define('Customer', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
}, {
  timestamps: true
});

Customer.belongsTo(Agency, { foreignKey: 'agency_id' });
Agency.hasMany(Customer, { foreignKey: 'agency_id' });

module.exports = Customer;
