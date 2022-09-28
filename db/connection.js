const mysql = require("mysql2");
require('dotenv').config();
const chalk = require('chalk');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: process.env.DB_USER,
      // MySQL password
      password: process.env.DB_PASSWORD,
      database: 'employee_tracker'
    },
    console.log(chalk.green('Connected to the employee tracker database.'))
  );

  db.connect(function (err) {
    if (err) throw err;
  });
  
  module.exports = db;