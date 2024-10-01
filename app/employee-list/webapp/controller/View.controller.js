sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
  ], function (Controller, MessageToast, JSONModel) {
    "use strict";
  
    return Controller.extend("employeelist.controller.View", {
        onInit: function () {
            console.log("View initialized");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("employeeDetails").attachPatternMatched(this._onRouteMatched, this);
        },
  
        _onRouteMatched: function (oEvent) {
            var sEmployeeID = parseInt(oEvent.getParameter("arguments").EmployeeID, 10); // Get EmployeeID from route
            var oModel = this.getView().getModel("employees");
            var modelData = oModel.getData();
        
            // Check if model contains Employees data
            if (!modelData || !Array.isArray(modelData.Employees)) {
                console.error("Model data does not contain Employees array. Data:", modelData);
                return;
            }
        
            // Find the employee with matching EmployeeID
            var oEmployee = modelData.Employees.find(emp => emp.EmployeeID === sEmployeeID);
        
            if (oEmployee) {
                // Bind the specific employee data by its index in the Employees array
                var iIndex = modelData.Employees.indexOf(oEmployee);
        
                // Update view to bind this specific employee data
                this.getView().bindElement({
                    path: `/Employees/${iIndex}`, // Bind to the correct employee using index
                    model: "employees"
                });
            } else {
                console.log("Employee not found for ID:", sEmployeeID);
            }
        },
  
        onSave: function () {
            var oModel = this.getView().getModel("employees");
            var oContext = this.getView().getBindingContext("employees");
            var sEmployeeID = oContext.getProperty("EmployeeID"); 
        
            console.log("oModel:", oModel);
            console.log("oContext:", oContext);
            console.log("sEmployeeID:", sEmployeeID);
        
            if (!sEmployeeID) {
                console.error("EmployeeID is missing or invalid!");
                return;
            }
        
            var sPath = `/Employees(${sEmployeeID})`;
        
            var oUpdatedEmployee = {
                FirstName: this.byId("viewInputFirstName").getValue(),
                LastName: this.byId("viewInputLastName").getValue(),
                dateOfJoining: this._formatDate(this.byId("viewDateOfJoiningPicker").getDateValue()),
                Address: this.byId("viewInputAddress").getValue()
            };
        
            // Send PATCH request to update an employee
            const API_URL = `https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog${sPath}`;
                
            $.ajax({
                url: API_URL,
                method: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(oUpdatedEmployee),
                success: function () {
                    sap.m.MessageToast.show("Employee details updated successfully.");
                    oModel.refresh(true);
                    this.onBack();

                    this._triggerUpdateJSONFile();

                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Failed to update employee details:", textStatus, errorThrown);
                    sap.m.MessageToast.show("Failed to update employee details.");
                }
            });
        },

        _triggerUpdateJSONFile: function () {
            const UPDATE_JSON_API_URL = "https://port4004-workspaces-ws-997dm.ap21.trial.applicationstudio.cloud.sap/odata/v4/catalog/writeEmployeeDataToJson";  // Ensure this is the correct action name
        
            $.ajax({
                url: UPDATE_JSON_API_URL,
                method: "POST",
                success: function () {
                    sap.m.MessageToast.show("JSON file updated successfully.");
                    setTimeout(function() {
                        location.reload();
                    }, 2500);
                },
                error: function (xhr, status, error) {
                    console.error("Error updating JSON file:", xhr.responseText);
                    sap.m.MessageToast.show("Failed to update JSON file.");
                }
            });
        },
  
        onBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("mainPage");
        },
  
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
  