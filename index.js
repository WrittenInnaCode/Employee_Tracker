const inquirer = require('inquirer');
const db = require('./db/connection');
const utils = require('util');

db.query = utils.promisify(db.query);

require('console.table');

const logo = require('asciiart-logo');


function init() {
    const logoText = logo({ name: 'Employee Manager' }).render();
    console.log(logoText);
    startApp();
}

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


function viewRoles() {
    db.query(
        `SELECT role.title, role.id as 'role id', role.salary, department.name as department from role LEFT JOIN department ON role.department_id = department.id`
    ).then((result, err) => {
        if (err) console.log(err);
        console.table(result);
        startApp();
    })
}

init();