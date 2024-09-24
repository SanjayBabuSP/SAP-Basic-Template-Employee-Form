const cds = require('@sap/cds');
const fs = require('fs');
const path = require('path');

module.exports = cds.service.impl(async function () {
  const { Employees } = this.entities;

  this.before('CREATE', 'Employees', async (req) => {
    // Create the employee in the database first
    const employeeData = {
      EmployeeID: req.data.EmployeeID,
      FirstName: req.data.FirstName,
      LastName: req.data.LastName,
      dateOfJoining: req.data.dateOfJoining,
      Address: req.data.Address
    };

    // Update the JSON file after creating the employee
    await updateJsonFile(employeeData);
  });

  this.on('DELETE', 'Employees', async (req) => {
    const employeeID = req.data.EmployeeID;
    
    // Delete the employee from the JSON file
    await deleteFromJsonFile(employeeID);
  });

  async function updateJsonFile(newEmployee) {
    const jsonFilePath = path.join(__dirname, '../db/data/my.employeeslist-Employees.json');

    // Read the existing JSON data
    let employeeList = [];
    try {
      const fileContent = fs.readFileSync(jsonFilePath);
      employeeList = JSON.parse(fileContent);
    } catch (err) {
      console.error('Error reading JSON file:', err);
    }

    // Add the new employee to the list
    employeeList.push(newEmployee);

    // Write the updated list back to the JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(employeeList, null, 2));
  }

  async function deleteFromJsonFile(employeeID) {
    const jsonFilePath = path.join(__dirname, '../db/data/my.employeeslist-Employees.json');

    // Read the existing JSON data
    let employeeList = [];
    try {
      const fileContent = fs.readFileSync(jsonFilePath);
      employeeList = JSON.parse(fileContent);
    } catch (err) {
      console.error('Error reading JSON file:', err);
    }

    // Filter out the employee to delete
    employeeList = employeeList.filter(employee => employee.EmployeeID !== employeeID);

    // Write the updated list back to the JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(employeeList, null, 2));
  }
});
