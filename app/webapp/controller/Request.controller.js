sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter", 
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, formatter, MessageToast, Sorter, Filter, FilterOperator, Fragment) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Request", {

        formatter: formatter,

        onInit: function () {
            // Define local JSON file URL and initialize model
            this.sJsonUrl = "RequestOrder.json";
            this._oModel = new JSONModel();
            this.getView().setModel(this._oModel, "request");

            // Initialize router and route pattern matched
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("overview").attachPatternMatched(this._onObjectMatched, this);

            // Load data from local JSON file
            this._loadData();
        },

        onNavToB: function () { 
            let SelectedNum = "1000000001";
            this.getOwnerComponent().getRouter().navTo("detail", { ReqNum: SelectedNum });
        },

        onConfirmSortDialog: function (oEvent) { 
            let mParams = oEvent.getParameters();
            let sPath = mParams.sortItem.getKey();
            let bDescending = mParams.sortDescending;
            let aSorters = [new Sorter(sPath, bDescending)];
            let oBinding = this.byId("RequestTable").getBinding("rows");
            oBinding.sort(aSorters);
        },

        onCreateOrder: function () { 
            this.getOwnerComponent().getRouter().navTo("detail",{
                ReqNum: "new"  // 새로운 요청을 생성하는 경우 "new"를 전달
            });
        },

        _loadData: function () {
            // Load data from the local JSON file into the model
            this._oModel.loadData(this.sJsonUrl, null, true);
        },

        _onObjectMatched: function () {
            this._loadData(); // Reload data when route pattern matched
        },

        onSearch: function () {
            let ReqNum = this.byId("ReqNum").getValue();
            let ReqGood = this.byId("ReqGood").getValue();
            let Requester = this.byId("Requester").getValue();
            let ReqDate = this.byId("ReqDate").getValue();
            let ReqStatus = this.byId("ReqStatus").getSelectedKey();
        
            // ReqDate 형식 변환
            if (ReqDate) { let ReqYear = ReqDate.split(". ")[0];
                let ReqMonth = ReqDate.split(". ")[1].padStart(2, '0');
                ReqDate = ReqYear + "-" + ReqMonth;
                }
            // if (ReqDate) {
            //     let dateParts = ReqDate.split("-");
            //     if (dateParts.length === 2) {
            //         ReqDate = dateParts[0] + "-" + dateParts[1];
            //     }
            // }
        
            // Build the filter array
            var aFilter = [];
            if (ReqNum) { aFilter.push(new Filter("ReqNum", FilterOperator.Contains, ReqNum)); }
            if (ReqGood) { aFilter.push(new Filter("ReqGood", FilterOperator.Contains, ReqGood)); }
            if (Requester) { aFilter.push(new Filter("Requester", FilterOperator.Contains, Requester)); }
            if (ReqDate) { aFilter.push(new Filter("ReqDate", FilterOperator.Contains, ReqDate)); }
            if (ReqStatus) {aFilter.push(new Filter("ReqStatus", FilterOperator.Contains, ReqStatus))}
            //if (ReqStatus && ReqStatus !== "") { aFilter.push(new Filter("ReqStatus", FilterOperator.EQ, ReqStatus)); }
            // Apply filters to the table
            let oTable = this.byId("RequestTable");
            let oBinding = oTable.getBinding("rows");
            
            if (oBinding) {
                oBinding.filter(aFilter);
            } else {
                console.error("Table binding not found");
            }
        },
        
        // 초기화 버튼을 위한 함수 추가
        onReset: function() {
            this.byId("ReqNum").setValue("");
            this.byId("ReqGood").setValue("");
            this.byId("Requester").setValue("");
            this.byId("ReqDate").setValue(null);
            this.byId("ReqStatus").setSelectedKey("");
        
            // Clear all filters
            let oTable = this.byId("RequestTable");
            let oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.filter([]);
            }
        },

        onSort: function () { 
            if (!this.byId("SortDialog")) { 
                Fragment.load({ 
                    id: this.getView().getId(), 
                    name: "ui5.walkthrough.view.fragment.SortDialog", 
                    controller: this }).then(
                        function (oDialog) { 
                            this.getView().addDependent(oDialog);
            oDialog.open("filter");
            }.bind(this));
            } else { 
                this.byId("SortDialog").open("filter");
            } this.onSearch();
            },
        
        onConfirmSortDialog: function (oEvent) { 
            let mParams = oEvent.getParameters();
            let sPath = mParams.sortItem.getKey();
            let bDescending = mParams.sortDescending;
            let aSorters = [];
            aSorters.push(new Sorter(sPath, bDescending));
            let oBinding = this.byId("RequestTable").getBinding("rows");
            oBinding.sort(aSorters);
            }
    });
});
