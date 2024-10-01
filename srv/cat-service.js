const cds = require('@sap/cds');
const fs = require('fs');
const path = require('path');

module.exports = cds.service.impl(async function () {
    const { Employees } = this.entities;

    // Implement the writeEmployeeDataToJson action
    this.on('writeEmployeeDataToJson', async () => {
        try {
            // Fetch all employee data
            const allEmployees = await cds.run(SELECT.from('CatalogService_Employees'));

            // Define the path to the JSON file
            const filePath = path.join(__dirname, '../db/data/my.employeeslist-Employees.json');

            // Write the fetched data to the JSON file
            fs.writeFileSync(filePath, JSON.stringify(allEmployees, null, 2));

            // Return a success message
            return { message: 'JSON file updated successfully!' };
        } catch (error) {
            console.error('Error updating JSON file:', error);
            return { error: 'Error updating JSON file' };
        }
    });
});
