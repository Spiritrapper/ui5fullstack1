```javascript
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
    "sap/m/TextArea"
], function (Controller, JSONModel, MessageToast, Dialog, Text, Input, Select, Item, Button, TextArea) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        formatCurrency: function (value, currency) {
            // 형식을 맞춰서 통화 값을 반환합니다.
            return Format.formatCurrency(value, currency);
        },

        onInit: function () {
            // 초기화 시 호출되는 메서드

            // Router 초기화
            const oRouter = this.getOwnerComponent().getRouter();
            // "detail" 라우트의 패턴과 일치하는 경우 _onObjectMatched 메서드를 호출합니다.
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            // View 모델 초기화
            const oViewModel = new JSONModel({
                currency: "EUR",
                busy: false,
                delay: 0,
                selectedItem: null
            });
            // 뷰에 모델을 설정합니다.
            this.getView().setModel(oViewModel, "view");

            // Resource 모델 초기화
            let oResourceModel = this.getView().getModel("i18n");
            if (!oResourceModel) {
                // Resource 모델이 없는 경우 새로 생성하여 설정합니다.
                oResourceModel = new sap.ui.model.resource.ResourceModel({
                    bundleName: "ui5.walkthrough.i18n.i18n"
                });
                this.getView().setModel(oResourceModel, "i18n");
            }

            const oResourceBundle = oResourceModel.getResourceBundle();

            // Status 모델 초기화
            const oStatusModel = new JSONModel({
                statuses: [
                    { key: 'A', text: oResourceBundle.getText('invoiceStatusA') },
                    { key: 'B', text: oResourceBundle.getText('invoiceStatusB') },
                    { key: 'D', text: oResourceBundle.getText('invoiceStatusD') },
                    { key: 'E', text: oResourceBundle.getText('invoiceStatusE') },
                    { key: 'F', text: oResourceBundle.getText('invoiceStatusF') }
                ]
            });
            // 상태 모델을 뷰에 설정합니다.
            this.getView().setModel(oStatusModel, 'statuses');

            // Currency 모델 초기화
            const oCurrencyModel = new JSONModel({
                currencies: [
                    { key: 'EUR', text: 'Euro' },
                    { key: 'USD', text: 'US Dollar' }
                ]
            });
            // 통화 모델을 뷰에 설정합니다.
            this.getView().setModel(oCurrencyModel, 'currencies');
        },

        _onObjectMatched: async function (oEvent) {
            // 라우트의 패턴과 일치할 때 호출되는 메서드
            const sInvoicePath = window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath);
            const oModel = this.getView().getModel("invoice");

            // 뷰의 요소를 특정 경로에 바인딩합니다.
            this.getView().bindElement({
                path: `/${sInvoicePath}`,
                model: "invoice",
                parameters: {
                    expand: "" // 필요에 따라 추가 데이터를 로드
                },
                events: {
                    dataRequested: function () {
                        // 데이터 요청 시 'busy' 상태를 true로 설정합니다.
                        this.getView().getModel("view").setProperty("/busy", true);
                    }.bind(this),
                    dataReceived: function () {
                        // 데이터 수신 시 'busy' 상태를 false로 설정합니다.
                        this.getView().getModel("view").setProperty("/busy", false);
                    }.bind(this)
                }
            });

            // 평가 컴포넌트를 초기화합니다.
            this.byId("rating").reset();
        },

        onEdit: async function () {
            // 수정 버튼 클릭 시 호출되는 메서드
            const oModel = this.getView().getModel("invoice");
            const oBindingContext = this.getView().getBindingContext("invoice");

            if (oBindingContext) {
                // 바인딩 컨텍스트가 있는 경우 편집 대화 상자를 엽니다.
                const sPath = oBindingContext.getPath();
                await this._openEditDialog(sPath, "Edit");
            } else {
                // 선택된 항목이 없는 경우 메시지 표시
                MessageToast.show("No item selected to edit.");
            }
        },

        onDelete: async function () {
            // 삭제 버튼 클릭 시 호출되는 메서드
            const oModel = this.getView().getModel("invoice");
            const oBindingContext = this.getView().getBindingContext("invoice");

            if (oBindingContext) {
                // 바인딩 컨텍스트가 있는 경우 삭제를 시도합니다.
                const sPath = oBindingContext.getPath();

                try {
                    // ODataModel을 사용하여 삭제를 수행합니다.
                    await oBindingContext.delete("$auto");
                    MessageToast.show("Invoice deleted successfully.");

                    // 삭제 후 InvoiceList로 네비게이션하면서 refresh 파라미터를 true로 설정합니다.
                    this.getOwnerComponent().getRouter().navTo("overview", {}, true);

                    // 또는 이벤트 버스를 사용하여 삭제 이벤트를 발생시킵니다.
                    sap.ui.getCore().getEventBus().publish("InvoiceList", "RefreshData");
                } catch (error) {
                    // 삭제 실패 시 메시지 표시
                    MessageToast.show("Failed to delete invoice.");
                }
            } else {
                // 선택된 항목이 없는 경우 메시지 표시
                MessageToast.show("No item selected to delete.");
            }
        },

        statusText: function (sStatus) {
            // 상태 코드에 따라 상태 텍스트를 반환합니다.
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

        // onNavBack: function () {
        //     // 이전 페이지로 네비게이션하거나 기본 페이지로 이동합니다.
        //     const oHistory = sap.ui.core.routing.History.getInstance();
        //     const sPreviousHash = oHistory.getPreviousHash();

        //     if (sPreviousHash !== undefined) {
        //         window.history.go(-1);
        //     } else {
        //         const oRouter = this.getOwnerComponent().getRouter();
        //         oRouter.navTo("overview", {}, true);
        //     }
        // },

        _openEditDialog: function (sPath, sAction) {
            // 편집 대화 상자를 여는 메서드
            const oView = this.getView();
            const sUniqueId = jQuery.sap.uid(); // 고유 ID 생성
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
                    // 추가된 필드
                    new Input(this.createId(sUniqueId + "-imageURLInput"), { placeholder: "Image URL", value: sAction === "Edit" ? "{invoice>ImageURL}" : "" }),
                    new TextArea(this.createId(sUniqueId + "-plotSummaryInput"), { placeholder: "Plot Summary", value: sAction === "Edit" ? "{invoice>PlotSummary}" : "", rows: 5 })
                ],

                beginButton: new Button({
                    text: sAction === "Add" ? "저장" : "수정",
                    press: async () => {
                        // 대화 상자의 저장 또는 수정 버튼 클릭 시 호출됩니다.
                        const oModel = oView.getModel("invoice");
                        const oData = {
                            ProductName: this.byId(sUniqueId + "-productNameInput").getValue(),
                            Quantity: this.byId(sUniqueId + "-quantityInput").getValue(),
                            ShipperName: this.byId(sUniqueId + "-shipperNameInput").getValue(),
                            Status: this.byId(sUniqueId + "-statusSelect").getSelectedKey(),
                            ExtendedPrice: parseFloat(this.byId(sUniqueId + "-extendedPriceInput").getValue()),
                            CurrencyCode: this.byId(sUniqueId + "-currencySelect").getSelectedKey(),
                            ImageURL: this.byId(sUniqueId + "-imageURLInput").getValue(), // 추가된 필드
                            PlotSummary: this.byId(sUniqueId + "-plotSummaryInput").getValue() // 추가된 필드
                        };

                        try {
                            if (sAction === "Add") {
                                // 새로운 항목 추가
                                const oListBinding = oModel.bindList("/Invoices");
                                const oContext = oListBinding.create(oData);
                                await oContext.created();
                                MessageToast.show("Invoice가 성공적으로 추가되었습니다.");
                            } else if (sAction === "Edit") {
                                // 기존 항목 수정
                                const oBindingContext = oDialog.getBindingContext("invoice");
                                await oBindingContext.requestObject(); // 데이터 로드 대기
                                Object.keys(oData).forEach(key => {
                                    oBindingContext.setProperty(key, oData[key]);
                                });
                                await oModel.submitBatch("$auto");
                                MessageToast.show("Invoice가 성공적으로 수정되었습니다.");
                                await oModel.refresh();
                            }

                            // 대화 상자 닫기
                            oDialog.close();
                        } catch (error) {
                            // 오류 처리
                            console.error(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.", error);
                            MessageToast.show(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.");
                        }
                    }
                }),
                endButton: new Button({
                    text: "취소",
                    press: () => {
                        // 대화 상자의 취소 버튼 클릭 시 호출됩니다.
                        oDialog.close();
                    }
                })
            });

            if (sAction === "Edit" && sPath && sPath.startsWith('/')) {
                // 수정 모드일 때, 대화 상자를 데이터에 바인딩합니다.
                oDialog.bindElement({
                    path: sPath,
                    model: "invoice",
                    events: {
                        dataReceived: function () {
                            const oContext = oDialog.getBindingContext("invoice");
                            if (oContext) {
                                const oData = oContext.getObject();
                                // 대화 상자의 입력 필드에 기존 데이터로 업데이트합니다.
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
                // 추가 모드일 때, 대화 상자의 입력 필드를 초기화합니다.
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

            // 대화 상자를 뷰의 종속 항목으로 추가하고 엽니다.
            oView.addDependent(oDialog);
            oDialog.open();
            oModel.refresh();
        },

        onRatingChange: function (oEvent) {
            // 평가 변경 시 호출되는 메서드
            const fValue = oEvent.getParameter("value");
            const oBindingContext = this.getView().getBindingContext("invoice");
            const oModel = this.getView().getModel("invoice");

            // 모델 유형과 디버그 정보 로깅
            console.log(oModel);
            console.log(oModel instanceof sap.ui.model.json.JSONModel ? "JSONModel" : "Not JSONModel");
            console.log("Model:", oModel);
            console.log("Model Type:", oModel.constructor.name);

            if (oBindingContext) {
                const sPath = oBindingContext.getPath();

                // 모델의 유형에 따라 다른 방법으로 데이터를 업데이트합니다.
                if (oModel instanceof sap.ui.model.odata.v4.ODataModel) {
                    // ODataModel v4
                    const sEntityPath = sPath;

                    oModel.update(sEntityPath, { Rating: fValue }, {
                        success: () => {
                            MessageToast.show("Rating updated successfully.");
                            this.byId("rating").setAverageValue(fValue);
                        },
                        error: () => {
                            MessageToast.show("Failed to update rating.");
                        }
                    });
                } else if (oModel instanceof sap.ui.model.odata.v2.ODataModel) {
                    // ODataModel v2
                    const sEntityPath = sPath;

                    oModel.update(sEntityPath, { Rating: fValue }, {
                        success: () => {
                            MessageToast.show("Rating updated successfully.");
                            this.byId("rating").setAverageValue(fValue);
                        },
                        error: () => {
                            MessageToast.show("Failed to update rating.");
                        }
                    });
                } else if (oModel instanceof sap.ui.model.json.JSONModel) {
                    // JSONModel
                    const sModelPath = sPath; // 올바른 경로 확인
                    const oData = oModel.getProperty(sModelPath);

                    oData.Rating = fValue;
                    oModel.setProperty(sModelPath, oData);

                    MessageToast.show("Rating updated successfully.");
                } else {
                    // 처리되지 않은 모델 유형
                    console.error("Unhandled model type:", oModel.constructor.name);
                    MessageToast.show("Unhandled model type.");
                }
            } else {
                // 선택된 항목이 없는 경우 메시지 표시
                MessageToast.show("No item selected to rate.");
            }
        }
    });
});
