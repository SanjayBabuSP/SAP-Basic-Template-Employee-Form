sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("employeelist.controller.View", {
        onInit: function () {
            // Initialize the JSON model for Employees
            var oEmployeeModel = new JSONModel();
            this.getView().setModel(oEmployeeModel, "employees");

            // Load the initial data from the OData service
            this._loadEmployeeData();
        },

        _loadEmployeeData: function () {
            var oModel = this.getView().getModel("employees");

            // Fetch data from the OData V4 service
            $.ajax({
                url: "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees",
                method: "GET",
                success: function (data) {
                    oModel.setData({ Employees: data.value });
                },
                error: function () {
                    MessageToast.show("Failed to load employee data.");
                }
            });
        },

        onToggleForm: function () {
            var oForm = this.byId("formContainer");
            oForm.setVisible(!oForm.getVisible());
        },

        onCreateEmployee: function () {
            // Collect input values
            var oNewEmployee = {
                FirstName: this.byId("inputFirstName").getValue(),
                LastName: this.byId("inputLastName").getValue(),
                dateOfJoining: this._formatDate(this.byId("dateOfJoiningPicker").getDateValue()),
                Address: this.byId("inputAddress").getValue()
            };

            // POST request to create a new employee
            $.ajax({
                url: "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oNewEmployee),
                success: function () {
                    MessageToast.show("Employee created successfully.");
                    this._loadEmployeeData();  // Refresh the table
                    this._clearInputFields();  // Clear input fields
                }.bind(this),
                error: function () {
                    MessageToast.show("Failed to create employee.");
                }
            });
        },

        onDeleteEmployee: function () {
            var oTable = this.byId("employeeTable");
            var aSelectedItems = oTable.getSelectedItems(); // Get selected items

            // Check if any item is selected
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one employee to delete.");
                return;
            }

            // Collect IDs of selected employees for deletion
            var aEmployeeIDs = aSelectedItems.map(function (oItem) {
                var oContext = oItem.getBindingContext("employees");
                return oContext ? oContext.getProperty("EmployeeID") : null; // Ensure context is valid
            }).filter(Boolean); // Filter out any null values

            console.log("Selected Employee IDs for deletion:", aEmployeeIDs); // Log selected IDs

            // Proceed with deletion if IDs are collected
            if (aEmployeeIDs.length > 0) {
                this._deleteEmployees(aEmployeeIDs);
            } else {
                MessageToast.show("No valid Employee IDs found for deletion.");
            }
        },

        _deleteEmployees: function (aEmployeeIDs) {
            var promises = aEmployeeIDs.map(function (employeeID) {
                var deleteUrl = `https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees(${employeeID})`;
                return $.ajax({
                    url: deleteUrl,
                    method: "DELETE",
                    success: function () {
                        MessageToast.show("Employee deleted successfully.");
                    },
                    error: function () {
                        MessageToast.show(`Failed to delete employee with ID: ${employeeID}.`);
                    }
                });
            });

            // Refresh the employee data after all deletions
            Promise.all(promises)
                .then(() => {
                    this._loadEmployeeData(); // Refresh the table
                })
                .catch((error) => {
                    console.error("Error during deletion:", error);
                    MessageToast.show("Error during deletion.");
                });
        },

        _clearInputFields: function () {
            this.byId("inputFirstName").setValue("");
            this.byId("inputLastName").setValue("");
            this.byId("dateOfJoiningPicker").setDateValue(null);
            this.byId("inputAddress").setValue("");
        },

        // Helper function to format the date to YYYY-MM-DD
        _formatDate: function (oDate) {
            if (!oDate) {
                return null;
            }
            var oYear = oDate.getFullYear();
            var oMonth = (oDate.getMonth() + 1).toString().padStart(2, '0');
            var oDay = oDate.getDate().toString().padStart(2, '0');
            return `${oYear}-${oMonth}-${oDay}`;
        }
    });
});
