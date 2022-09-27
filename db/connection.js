const mysql = require("mysql2");
require('dotenv').config();

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
    console.log(`Connected to the employee_tracker database.`)
  );


  module.exports = db;