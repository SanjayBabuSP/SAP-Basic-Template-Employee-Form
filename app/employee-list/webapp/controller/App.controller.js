sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
    
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("employeelist.controller.App", {
        onInit: function () {
            // Initialize the JSON model for Employees
            var oEmployeeModel = new JSONModel();
            this.getView().setModel(oEmployeeModel, "employees");

            // Load the initial data from the OData service
            this._loadEmployeeData();

            // Navigate to mainPage on init
            this.getOwnerComponent().getRouter().navTo("mainPage");
        },

        _loadEmployeeData: function () {
            var oModel = this.getView().getModel("employees");
        
            // Fetch data from the OData V4 service
            $.ajax({
                url: "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees",
                method: "GET",
                success: function (data) {
                    console.log("Fetched Employee Data:", data);
                    oModel.setData({ Employees: data.value }); // Ensure this matches your model structure
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to load employee data.");
                }
            });
        },

        onToggleForm: function () {
            var oForm = this.byId("formContainer");
            oForm.setVisible(!oForm.getVisible());
        },

        onCreateEmployee: function () {
            var oModel = this.getView().getModel("employees");
            var aEmployees = oModel.getProperty("/Employees") || [];
        
            var newEmployeeID = aEmployees.length + 1;  // Generate new EmployeeID
            var oNewEmployee = {
                EmployeeID: newEmployeeID,
                FirstName: this.byId("inputFirstName").getValue(),
                LastName: this.byId("inputLastName").getValue(),
                dateOfJoining: this._formatDate(this.byId("dateOfJoiningPicker").getDateValue()),
                Address: this.byId("inputAddress").getValue()
            };
        
            if (!oNewEmployee.FirstName || !oNewEmployee.LastName || !oNewEmployee.dateOfJoining || !oNewEmployee.Address) {
                MessageToast.show("Please fill in all the fields.");
                return;
            }
        
            const API_URL = "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees";
        
            $.ajax({
                url: API_URL,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oNewEmployee),
                success: function () {
                    MessageToast.show("Employee created successfully.");
                    this._loadEmployeeData();  // Refresh the table
                    this._clearInputFields();  // Clear input fields
        
                    // Trigger the updateJSONFile action
                    this._triggerUpdateJSONFile();
                }.bind(this),
                error: function (xhr, status, error) {
                    console.error("Error creating employee:", xhr.responseText);
                    MessageToast.show("Failed to create employee. " + xhr.responseText);
                }
            });
        },
        
        _triggerUpdateJSONFile: function () {
            // Custom action to trigger the updateJSONFile function on the backend
            const UPDATE_JSON_API_URL = "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/writeEmployeeDataToJson";
        
            $.ajax({
                url: UPDATE_JSON_API_URL,
                method: "POST",
                success: function () {
                    console.log("JSON file has been updated after creation.");
                    setTimeout(function() {
                        location.reload();
                    }, 2500);
                },
                error: function (xhr, status, error) {
                    console.error("Error updating JSON file:", xhr.responseText);
                }
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
        },

        // Delete button function
        onDeleteEmployee: function () {
            var oTable = this.byId("employeeTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length === 0) {
                sap.m.MessageToast.show("Please select at least one employee to delete.");
                return;
            }
        
            var aEmployeeIDs = [];
            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext("employees");
                if (oContext) {
                    var sEmployeeID = oContext.getProperty("EmployeeID");
                    aEmployeeIDs.push(sEmployeeID);
                }
            });
        
            if (aEmployeeIDs.length === 0) {
                sap.m.MessageToast.show("No valid EmployeeID found for the selected items.");
                return;
            }
        
            var sDeleteUrl = "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/Employees";
            
            Promise.all(aEmployeeIDs.map(function (sEmployeeID) {
                return $.ajax({
                    url: sDeleteUrl + `(${sEmployeeID})`,
                    method: "DELETE"
                });
            })).then(function () {
                MessageToast.show("Selected employees deleted successfully.");
                this._loadEmployeeData();  // Refresh the table with the latest data
                
                // Trigger the updateJSONFile action
                this._triggerUpdateJSONFile();
            }.bind(this)).catch(function () {
                MessageToast.show("Failed to delete some employees.");
            });
        },

        onItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("employees");
            var sEmployeeID = oContext.getProperty("EmployeeID");
            console.log("The employee id: " + sEmployeeID);

            this.getOwnerComponent().getRouter().navTo("employeeDetails", {
                EmployeeID: sEmployeeID
            });
        }
    });
});
