const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agency = require('./Agency');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true
});

Category.belongsTo(Agency, { foreignKey: 'agency_id' });
Agency.hasMany(Category, { foreignKey: 'agency_id' });

module.exports = Category;
