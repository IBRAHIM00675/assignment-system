const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/dbConfig');

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorAliases: false
    }
);

sequelize.authenticate()
    .then(() => console.log("Database connection successful."))
    .catch((err) => console.error(`Database connection error: ${err.message}`));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.User = require('../models/userModel')(sequelize, DataTypes);

// Sync database
db.sequelize.sync({ force: false })
    .then(() => console.log("Database synchronized."))
    .catch((err) => console.error(`Sync error: ${err.message}`));

module.exports = db;
