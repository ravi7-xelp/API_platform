const dbConfig = require("../../config/db.config.js");

const Sequelize = require("sequelize");
const dbConnect = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.dbConnect = dbConnect;

db.tutorials = require("./tutorial.model.js")(dbConnect, Sequelize);

module.exports = db;
