const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = User;
