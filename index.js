const inquirer = require('inquirer');
const db = require('./db/connection');
const utils = require('util');

db.query = utils.promisify(db.query);

require('console.table');

const logo = require('asciiart-logo');
const chalk = require('chalk');


init();

function init() {
    const logoText = logo({ name: 'Employee Manager' }).render();
    console.log(chalk.magenta(logoText));
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
                    "Delete an employee",
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

                case "Delete an employee":
                    deleteEmployee();
                    break;

                case "Quit":
                    process.exit(0);
                    break;
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
        `SELECT role.title, role.id AS 'role id', role.salary, 
        department.name AS department FROM role 
        LEFT JOIN department ON role.department_id = department.id`

    ).then((result, err) => {
        if (err) console.log(err);
        console.table(result);
        startApp();
    })
};


function viewEmployees() {
    db.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee 
        LEFT JOIN role on employee.role_id = role.id 
        LEFT JOIN department on role.department_id = department.id 
        LEFT JOIN employee manager on manager.id = employee.manager_id;`
    ).then((result, err) => {
        if (err) console.log(err);
        console.table(result);
        startApp();
    })
};

function addDepartment() {
    inquirer
        .prompt([
            {
                name: "name",
                message: "What is the department called?"
            }
        ])
        .then(res => {
            let name = res.name;
            db.query('INSERT INTO department (name) VALUES (?)', [name])
                .then(() => console.log(chalk.green(`\n ${name} department is added to the database \n`)))
                .then(() => startApp())
        })
};


function addRole() {
    db.query("SELECT department.id, department.name FROM department;")
        .then((result) => {
            let departments = result;
            const departmentChoices = departments.map(({ id, name }) => ({
                name: name,
                value: id
            }));
            inquirer
                .prompt([
                    {
                        name: "title",
                        message: "What is the role that you are adding?"
                    },
                    {
                        name: "salary",
                        message: "What is the salary?"
                    },
                    {
                        type: "list",
                        name: "department_id",
                        message: "Which department does the role belong to?",
                        choices: departmentChoices
                    }
                ])
                .then(role => {
                    db.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [role.title, role.salary, role.department_id])
                        .then(() => console.log(chalk.green(`\n ${role.title} is added to the database \n`)))
                        .then(() => startApp())
                })
        })
};


function addEmployee() {
    inquirer
        .prompt([
            {
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                name: "last_name",
                message: "What is the employee's last name?"
            }
        ])
        .then(res => {
            let firstName = res.first_name;
            let lastName = res.last_name;

            db.query("SELECT * FROM role")
                .then((result) => {
                    let roles = result;
                    const roleChoices = roles.map(({ id, title }) => ({
                        name: title,
                        value: id
                    }));
                    inquirer
                        .prompt({
                            type: "list",
                            name: "roleId",
                            message: "What is the employee's role?",
                            choices: roleChoices
                        })
                        .then(res => {
                            let roleId = res.roleId;

                            db.query("SELECT * FROM employee")
                                .then((result) => {
                                    let employees = result;
                                    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                                        name: `${first_name} ${last_name}`,
                                        value: id
                                    }));

                                    managerChoices.unshift({ name: "None", value: null });
                                    inquirer
                                        .prompt({
                                            type: "list",
                                            name: "managerId",
                                            message: "Who is the employee's manager?",
                                            choices: managerChoices
                                        })
                                        .then(res => {
                                            let employee = {
                                                manager_id: res.managerId,
                                                role_id: roleId,
                                                first_name: firstName,
                                                last_name: lastName
                                            }

                                            db.query("INSERT into employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)",
                                                [employee.first_name, employee.last_name, employee.role_id, employee.manager_id]);
                                        })
                                        .then(() => console.log(chalk.green(`\n ${firstName} ${lastName} is added to the database \n`)))
                                        .then(() => startApp())
                                })
                        })
                })
        })
};


function updateEmployeeRole() {
    db.query("SELECT * FROM employee")
        .then((result) => {
            let employees = result;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employeeId",
                        message: "Which employee's role do you want to update?",
                        choices: employeeChoices
                    }
                ])
                .then(res => {
                    let employeeId = res.employeeId;
                    db.query("SELECT * FROM role")
                        .then((result) => {
                            let roles = result;
                            const roleChoices = roles.map(({ id, title }) => ({
                                name: title,
                                value: id
                            }));
                            inquirer
                                .prompt([
                                    {
                                        type: "list",
                                        name: "roleId",
                                        message: "What's the new role of this employee?",
                                        choices: roleChoices
                                    }
                                ])
                                .then(res => db.query("UPDATE employee set role_id=? WHERE id=?", [res.roleId, employeeId]))
                                .then(() => console.log(chalk.green("\n Employee's role is updated \n")))
                                .then(() => startApp())
                        });
                });
        })
};


//////// BONUS //////////


function deleteEmployee() {
    db.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee")
        .then((result) => {
            let employees = result;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee do you want to delete?",
                choices: employeeChoices
            }
        ])
        .then(res => {
            db.query("DELETE FROM employee WHERE id = ?", [res.employeeId])
                .then(() => console.log(chalk.red("\n Employee is deleted \n")))
                .then(() => startApp())
        })
    })
};
