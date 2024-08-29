sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Button",
    "sap/m/TextArea",
], function (Controller, JSONModel, MessageToast, Dialog, Text, Input, Select, Item, Button, TextArea) {
    "use strict";


    return Controller.extend("ui5.walkthrough.controller.Detail", {
        formatCurrency: function (value, currency) {
            console.log("Formatting value:", value, "with currency:", currency);
            return Format.formatCurrency(value, currency);
        },

        onInit: function () {


            // Initialize Router
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            // Initialize View Model
            // const oViewModel = new JSONModel({
            //     currency: "EUR",
            //     busy: false,
            //     delay: 0,
            //     selectedItem: null
            // });
            // this.getView().setModel(oViewModel, "view");

            // Initialize Resource Model
            let oResourceModel = this.getView().getModel("i18n");
            if (!oResourceModel) {
                oResourceModel = new sap.ui.model.resource.ResourceModel({
                    bundleName: "ui5.walkthrough.i18n.i18n"
                });
                this.getView().setModel(oResourceModel, "i18n");
            }

            const oResourceBundle = oResourceModel.getResourceBundle();

            // Initialize Status Model
            const oStatusModel = new JSONModel({
                statuses: [
                    { key: 'A', text: oResourceBundle.getText('invoiceStatusA') },
                    { key: 'B', text: oResourceBundle.getText('invoiceStatusB') },
                    { key: 'D', text: oResourceBundle.getText('invoiceStatusD') },
                    { key: 'E', text: oResourceBundle.getText('invoiceStatusE') },
                    { key: 'F', text: oResourceBundle.getText('invoiceStatusF') }
                ]
            });
            this.getView().setModel(oStatusModel, 'statuses');

            // Initialize Currency Model
            const oCurrencyModel = new JSONModel({
                currencies: [
                    { key: 'EUR', text: 'Euro' },
                    { key: 'USD', text: 'US Dollar' }
                ]
            });
            this.getView().setModel(oCurrencyModel, 'currencies');


        },

        _onObjectMatched: async function (oEvent) {
            const sInvoicePath = window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath);
            console.log("Invoice Path:", sInvoicePath);
            const oModel = this.getView().getModel("invoice");    

            this.getView().bindElement({
                path: `/${sInvoicePath}`,
                model: "invoice",
                parameters: {
                    expand: "" // 필요에 따라 추가 데이터를 로드
                },
                events: {
                    dataRequested: function () {
                        console.log("Data requested"); // 디버깅 로그
                        this.getView().getModel("view").setProperty("/busy", true);
                    }.bind(this),
                    dataReceived: function () {
                        console.log("Data received"); // 디버깅 로그
                        this.getView().getModel("view").setProperty("/busy", false);
                    }.bind(this)
                }
            });

            this.byId("rating").reset(); // 평가 컴포넌트를 초기화합니다.
        },

        onEdit: async function () {
            const oModel = this.getView().getModel("invoice");
            const oBindingContext = this.getView().getBindingContext("invoice");

            if (oBindingContext) {
                const sPath = oBindingContext.getPath();
                console.log("Edit Path:", sPath); // 디버깅 로그
                await this._openEditDialog(sPath, "Edit");
            } else {
                MessageToast.show("No item selected to edit.");
            }
        },

        onDelete: async function () {
            const oModel = this.getView().getModel("invoice");
            const oBindingContext = this.getView().getBindingContext("invoice");

            if (oBindingContext) {
                const sPath = oBindingContext.getPath();
                console.log("Delete Path:", sPath); // 디버깅 로그

                try {
                    await oBindingContext.delete("$auto");
                    MessageToast.show("Invoice deleted successfully.");

                    // 삭제 후 InvoiceList로 네비게이션하면서 refresh 파라미터를 true로 설정
                    this.getOwnerComponent().getRouter().navTo("overview", {}, true);

                    // 또는 이벤트 버스를 사용하여 삭제 이벤트를 발생시킵니다
                    sap.ui.getCore().getEventBus().publish("InvoiceList", "RefreshData");
                    // this.getOwnerComponent().getRouter().navTo("overview", {}, true);
                    //this._refreshTable(); 
                    // this.onNavBack(); // Navigate back to list
                } catch (error) {
                    console.error("Failed to delete invoice:", error); // 디버깅 로그
                    MessageToast.show("Failed to delete invoice.");
                }
            } else {
                MessageToast.show("No item selected to delete.");
            }
        },

        statusText: function (sStatus) {
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            switch (sStatus) {
                case "A":
                    return oResourceBundle.getText("invoiceStatusA");
                case "B":
                    return oResourceBundle.getText("invoiceStatusB");
                case "C":
                    return oResourceBundle.getText("invoiceStatusC");
                case "D":
                    return oResourceBundle.getText("invoiceStatusD");
                case "E":
                    return oResourceBundle.getText("invoiceStatusE");
                case "F":
                    return oResourceBundle.getText("invoiceStatusF");
                default:
                    return sStatus;
            }
        },

        // _refreshTable: function () {
        //     // Get the table and its binding
        //     const oTable = this.byId("yourTableId"); // Replace 'yourTableId' with the actual ID of your table
        //     const oTableBinding = oTable.getBinding("items"); // Assuming 'items' is the aggregation name

        //     if (oTableBinding) {
        //         // Refresh the binding to reload data
        //         oTableBinding.refresh(true);
        //     }
        // },

        onNavBack: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("overview", {}, true);
            }
        },

        _openEditDialog: function (sPath, sAction) {
            const oView = this.getView();
            const sUniqueId = jQuery.sap.uid();
            const oDialog = new Dialog({
                title: sAction === "Add" ? "Invoice 추가" : "Invoice 수정",

                content: [

                    new Input(this.createId(sUniqueId + "-productNameInput"), { placeholder: "Title", value: sAction === "Edit" ? "{invoice>ProductName}" : "" }),
                    new Input(this.createId(sUniqueId + "-quantityInput"), { placeholder: "Genre", value: sAction === "Edit" ? "{invoice>Quantity}" : "" }),
                    new Input(this.createId(sUniqueId + "-shipperNameInput"), { placeholder: "Production company", value: sAction === "Edit" ? "{invoice>ShipperName}" : "" }),
                    new Select({
                        id: this.createId(sUniqueId + "-statusSelect"),
                        items: {
                            path: 'statuses>/statuses',
                            template: new Item({
                                key: '{statuses>key}',
                                text: '{statuses>text}'
                            })
                        }
                    }),
                    new Input(this.createId(sUniqueId + "-extendedPriceInput"), { placeholder: "Extended Price", type: "Number", value: sAction === "Edit" ? "{invoice>ExtendedPrice}" : "" }),
                    new Select({
                        id: this.createId(sUniqueId + "-currencySelect"),
                        items: {
                            path: 'currencies>/currencies',
                            template: new Item({
                                key: '{currencies>key}',
                                text: '{currencies>text}'
                            })
                        },
                        selectedKey: sAction === "Edit" ? "{invoice>CurrencyCode}" : "EUR"
                    }),
                    // Added fields

                    new Input(this.createId(sUniqueId + "-imageURLInput"), { placeholder: "Image URL", value: sAction === "Edit" ? "{invoice>ImageURL}" : "" }),

                    new TextArea(this.createId(sUniqueId + "-plotSummaryInput"), { placeholder: "Plot Summary", value: sAction === "Edit" ? "{invoice>PlotSummary}" : "", rows: 5 ,width: "500px" }) // Adjust the 'rows' property as needed
                ],


                beginButton: new Button({
                    text: sAction === "Add" ? "저장" : "수정",
                    press: async () => {
                        const oModel = oView.getModel("invoice");
                        const oData = {
                            ProductName: this.byId(sUniqueId + "-productNameInput").getValue(),
                            Quantity: this.byId(sUniqueId + "-quantityInput").getValue(),
                            ShipperName: this.byId(sUniqueId + "-shipperNameInput").getValue(),
                            Status: this.byId(sUniqueId + "-statusSelect").getSelectedKey(),
                            ExtendedPrice: parseFloat(this.byId(sUniqueId + "-extendedPriceInput").getValue()),
                            CurrencyCode: this.byId(sUniqueId + "-currencySelect").getSelectedKey(),
                            ImageURL: this.byId(sUniqueId + "-imageURLInput").getValue(), // Added field
                            PlotSummary: this.byId(sUniqueId + "-plotSummaryInput").getValue() // Added field
                        };

                        console.log("Dialog Data:", oData); // 디버깅 로그

                        try {
                            if (sAction === "Add") {
                                const oListBinding = oModel.bindList("/Invoices");
                                const oContext = oListBinding.create(oData);
                                await oContext.created();
                                MessageToast.show("Invoice가 성공적으로 추가되었습니다.");
                            } else if (sAction === "Edit") {
                                const oBindingContext = oDialog.getBindingContext("invoice");
                                await oBindingContext.requestObject(); // Wait until data is loaded
                                Object.keys(oData).forEach(key => {
                                    oBindingContext.setProperty(key, oData[key]);
                                });
                                await oModel.submitBatch("$auto");
                                MessageToast.show("Invoice가 성공적으로 수정되었습니다.");
                                await oModel.refresh();


                            }

                            oDialog.close();
                        } catch (error) {
                            console.error(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.", error);
                            MessageToast.show(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.");
                        }
                    }
                }),
                endButton: new Button({
                    text: "취소",
                    press: () => {
                        oDialog.close();
                    }
                })
            });

            if (sAction === "Edit" && sPath && sPath.startsWith('/')) {
                oDialog.bindElement({
                    path: sPath,
                    model: "invoice",
                    events: {
                        dataReceived: function () {
                            const oContext = oDialog.getBindingContext("invoice");
                            if (oContext) {
                                const oData = oContext.getObject();
                                // Ensure that the dialog controls are updated with the existing data
                                this.byId(sUniqueId + "-productNameInput").setValue(oData.ProductName || "");
                                this.byId(sUniqueId + "-quantityInput").setValue(oData.Quantity || "");
                                this.byId(sUniqueId + "-shipperNameInput").setValue(oData.ShipperName || "");
                                this.byId(sUniqueId + "-statusSelect").setSelectedKey(oData.Status || "");
                                this.byId(sUniqueId + "-extendedPriceInput").setValue(oData.ExtendedPrice || "");
                                this.byId(sUniqueId + "-currencySelect").setSelectedKey(oData.CurrencyCode || "EUR");
                                this.byId(sUniqueId + "-imageURLInput").setValue(oData.ImageURL || "");
                                this.byId(sUniqueId + "-plotSummaryInput").setValue(oData.PlotSummary || "");
                            }
                        }.bind(this)
                    }
                });
            } else if (sAction === "Add") {
                oDialog.unbindElement();
                oDialog.getContent().forEach(control => {
                    if (control instanceof Input) {
                        control.setValue("");
                    } else if (control instanceof Select) {
                        control.setSelectedKey("");
                    }
                });
            } else {
                console.error("잘못된 바인딩 경로:", sPath);
            }

            oView.addDependent(oDialog);
            oDialog.open();
            oModel.refresh();
        },

        onRatingChange: function (oEvent) {
            const fValue = oEvent.getParameter("value");
            const oBindingContext = this.getView().getBindingContext("invoice");
            const oModel = this.getView().getModel("invoice");
        
            console.log("Model:", oModel);
            console.log("Model Type:", oModel.constructor.name);
        
            if (oBindingContext) {
                const sPath = oBindingContext.getPath(); // Get the path from the context
        
                if (oModel instanceof sap.ui.model.odata.v2.ODataModel) {
                    // ODataModel v2
                    oModel.update(sPath, { Rating: fValue }, {
                        success: () => {
                            MessageToast.show("Rating updated successfully.");
                            this.byId("rating").setValue(fValue); // Update the rating value
                        },
                        error: () => {
                            MessageToast.show("Failed to update rating.");
                        }
                    });
                } else if (oModel instanceof sap.ui.model.odata.v4.ODataModel) {
                    // ODataModel v4
                    const oContext = oBindingContext.getObject();
                    oContext.Rating = fValue;
                    
                    // Update the context directly
                    oBindingContext.setProperty("Rating", fValue);
        
                    // No need for submitChanges; v4 models handle updates automatically
                    MessageToast.show("Rating updated successfully.");
                    this.byId("rating").setValue(fValue); // Update the rating value
                } else if (oModel instanceof sap.ui.model.json.JSONModel) {
                    // JSONModel
                    const oData = oModel.getProperty(sPath);
                    oData.Rating = fValue;
                    oModel.setProperty(sPath, oData);
        
                    MessageToast.show("Rating updated successfully.");
                } else {
                    console.error("Unhandled model type:", oModel.constructor.name);
                    MessageToast.show("Unhandled model type.");
                }
        
                // If average rating is needed, you would typically calculate it here
                // For example, fetch the average rating from the server or compute it based on the ratings
                this._updateAverageRating();
            } else {
                MessageToast.show("No item selected to rate.");
            }
        },
        
        
        _updateAverageRating: function () {
            const oModel = this.getView().getModel("invoice");
        
            console.log("Model Type:", oModel.constructor.name);
        
            // Ensure oModel is valid
            if (!oModel) {
                console.error("No model found.");
                return;
            }
        
            // Handle OData v4 model case
            if (oModel instanceof sap.ui.model.odata.v4.ODataModel) {
                const oBindingContext = this.getView().getBindingContext("invoice");
                if (oBindingContext) {
                    const oData = oBindingContext.getObject(); // Use getObject() to get the data
                    console.log("oData:", oData); // Log oData to inspect its structure
        
                    // Check if ratings is defined and is an array
                    const aRatings = Array.isArray(oData.ratings) ? oData.ratings : [];
                    console.log("Ratings:", aRatings); // Log ratings to inspect its content
        
                    if (aRatings.length > 0) {
                        const fTotalRating = aRatings.reduce((sum, rating) => sum + rating, 0);
                        const fAverageRating = fTotalRating / aRatings.length;
                        oBindingContext.setProperty("AverageRating", fAverageRating);
                        // Update UI with the new average rating
                        this.byId("averageRatingText").setText(`Average Rating: ${fAverageRating.toFixed(1)}`);
                    } else {
                        console.error("No rating data available.");
                    }
                } else {
                    console.error("No binding context found.");
                }
            } else {
                console.error("Unhandled model type:", oModel.constructor.name);
            }
        }
        
        
        
    });
});
