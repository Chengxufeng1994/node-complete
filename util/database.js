const { Sequelize } = require('sequelize');

const db_option = {
  host: 'localhost',
  user: 'root',
  password: '1984Saiyan1995',
  database: 'node-complete',
};

const sequelize = new Sequelize(
  db_option.database,
  db_option.user,
  db_option.password,
  {
    host: db_option.host,
    dialect: 'mysql',
  }
);

module.exports = sequelize;
