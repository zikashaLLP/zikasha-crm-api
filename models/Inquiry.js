const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agency = require('./Agency');
const Customer = require('./Customer');
const Category = require('./Category');
const User = require('./User');

const Inquiry = sequelize.define('Inquiry', {
  followup_date: DataTypes.DATE,
  location: DataTypes.STRING,
  latest_log: DataTypes.STRING,
}, {
  timestamps: true
});

Inquiry.belongsTo(Agency, { foreignKey: 'agency_id' });
Inquiry.belongsTo(Customer, { foreignKey: 'customer_id' });
Inquiry.belongsTo(Category, { foreignKey: 'category_id' });
Inquiry.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Inquiry, { foreignKey: 'user_id' });
Agency.hasMany(Inquiry, { foreignKey: 'agency_id' });
Customer.hasMany(Inquiry, { foreignKey: 'customer_id' });
Category.hasMany(Inquiry, { foreignKey: 'category_id' });

module.exports = Inquiry;
