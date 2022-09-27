const inquirer = require('inquirer');
const db = require('./db/connection');
const utils = require('util');
require('console.table');
db.query = utils.promisify(db.query);


function startApp() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do?",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "Quit",
                ]
            }
        ]).then((options) => {
            switch (options.choice) {
                case "View all departments":
                    viewDepartments();
                    break;

                case "View all roles":
                    viewRoles();
                    break;

                case "View all employees":
                    viewEmployees();
                    break;

                case "Add a department":
                    addDepartment();
                    break;

                case "Add a role":
                    addRole();
                    break;

                case "Add an employee":
                    addEmployee();
                    break;

                case "Update an employee role":
                    updateEmployeeRole();
                    break;

                    default:
                        process.exit(0);
            }
        });
};

function viewDepartments() {
    db.query("SELECT * FROM department").then((result, err) => {
        if (err) console.error(err);
        console.table(result);
        startApp();
    })
};

startApp();