sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/ui/layout/form/SimpleForm"
], (Controller, JSONModel, ODataModel, formatter, Filter, FilterOperator, MessageToast, Dialog, Button, Text, Input, Select, Item, SimpleForm) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
        formatter: formatter,

        onInit() {
            console.log("InvoiceList.controller");

            const sServiceUrl = "https://port4005-workspaces-ws-z7sjw.us10.trial.applicationstudio.cloud.sap/odata/v4/invoice/";
            try {
                const oModel = new ODataModel({
                    serviceUrl: sServiceUrl,
                    synchronizationMode: "None",
                    autoExpandSelect: true,
                    operationMode: "Server",
                    metadataUrlParams: {
                        "sap-language": "EN",
                        "sap-cacherefresh": "true" // 메타데이터 새로고침 강제
                    }
                });
                this.getView().setModel(oModel, "invoice");
            } catch (error) {
                console.error("ODataModel 초기화 실패:", error);
            }

            const oCurrencyModel = new JSONModel({
                currencies: [
                    { key: 'EUR', text: 'Euro' },
                    { key: 'USD', text: 'US Dollar' }
                ]
            });
            this.getView().setModel(oCurrencyModel, 'currencies');

            const oViewModel = new JSONModel({
                currency: "EUR",
                selectedItem: null,
                currentPage: 0,
                pageSize: 2,
                hasMore: false

            });
            this.getView().setModel(oViewModel, "view");

            let oResourceModel = this.getView().getModel("i18n");
            if (!oResourceModel) {
                oResourceModel = new sap.ui.model.resource.ResourceModel({
                    bundleName: "ui5.walkthrough.i18n.i18n"
                });
                this.getView().setModel(oResourceModel, "i18n");
            }

            const oResourceBundle = oResourceModel.getResourceBundle();

            const oStatusModel = new JSONModel({
                statuses: [
                    { key: 'A', text: oResourceBundle.getText('invoiceStatusA') },
                    { key: 'B', text: oResourceBundle.getText('invoiceStatusB') },
                    { key: 'D', text: oResourceBundle.getText('invoiceStatusD') },
                    { key: 'E', text: oResourceBundle.getText('invoiceStatusE') },
                    { key: 'F', text: oResourceBundle.getText('invoiceStatusF') },
                ]
            });
            this.getView().setModel(oStatusModel, 'statuses');

            

            this._clickTimer = null;
            this._clickDelay = 300;


            // 이벤트 버스 구독
            sap.ui.getCore().getEventBus().subscribe("InvoiceList", "RefreshData", this.refreshData, this);

            // 라우터 이벤트 등록
            this.getOwnerComponent().getRouter().getRoute("overview").attachPatternMatched(this.onRouteMatched, this);




            this._loadData();
        },

        _loadData: function () {
            // View 모델을 가져옵니다. 페이지 크기 및 현재 페이지와 같은 정보를 포함합니다.
            const oViewModel = this.getView().getModel("view");
        
            // Invoice 모델을 가져옵니다. OData에서 데이터를 읽기 위해 사용합니다.
            const oModel = this.getView().getModel("invoice");
        
            // 페이지 크기 및 현재 페이지를 가져옵니다.
            const iPageSize = oViewModel.getProperty("/pageSize");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
        
            // 현재 페이지에 대한 데이터의 시작 지점을 계산합니다.
            const iSkip = iCurrentPage * iPageSize;
        
            // ListBinding을 사용하여 /Invoices 경로에 대해 바인딩을 설정합니다.
            // 페이지네이션을 위한 $skip 및 $top 파라미터를 설정합니다.
            const oListBinding = oModel.bindList("/Invoices", undefined, {
                $skip: iSkip,  // 데이터를 건너뛸 수
                $top: iPageSize // 가져올 데이터의 수
            });
        
            // 데이터가 바인딩된 리스트가 변경될 때 호출됩니다.
            oListBinding.attachChange(() => {
                // List 컨트롤과 해당 바인딩을 가져옵니다.
                const oTable = this.byId("invoiceList");
                const oBinding = oTable.getBinding("items");
        
                if (oBinding) {
                    // 현재 바인딩의 길이를 가져와서 더 많은 데이터가 있는지 확인합니다.
                    const iTotal = oBinding.getLength();
                    const bHasMore = iTotal > (iSkip + iPageSize);
                    // View 모델의 /hasMore 속성을 업데이트합니다.
                    oViewModel.setProperty("/hasMore", bHasMore);
                }
            });
        
            // 데이터 수신 후 호출됩니다. 받은 데이터를 처리합니다.
            oListBinding.attachDataReceived((oEvent) => {
                // 이벤트 소스에서 컨텍스트를 가져와서 데이터 객체 배열로 변환합니다.
                const oData = oEvent.getSource().getContexts().map(context => context.getObject());
        
                // List 컨트롤과 해당 바인딩을 가져옵니다.
                const oTable = this.byId("invoiceList");
                const oBinding = oTable.getBinding("items");
        
                if (oBinding) {
                    // 바인딩된 모델을 새 JSONModel로 설정하여 데이터를 업데이트합니다.
                    oBinding.setModel(new JSONModel(oData));
                }
            });
        
            // 데이터 요청 전 호출됩니다. 요청 전에 추가적인 로직을 삽입할 수 있습니다.
            oListBinding.attachDataRequested(() => {
                // 요청 시작 시 호출되는 로직을 여기에 추가할 수 있습니다.
            });
        
            // 데이터 로드를 시작합니다. getContexts()는 데이터를 요청합니다.
            oListBinding.getContexts();
        },
        
        


        onNextPage: function () {
            const oViewModel = this.getView().getModel("view");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            oViewModel.setProperty("/currentPage", iCurrentPage + 1);
        
            this._loadData();
        },
        
        onPreviousPage: function () {
            const oViewModel = this.getView().getModel("view");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            if (iCurrentPage > 0) {
                oViewModel.setProperty("/currentPage", iCurrentPage - 1);
                this._loadData();
            }
        },

        onRouteMatched: function () {
            // 라우트 매칭 시 데이터 새로고침
            this.refreshData();
        },

        refreshData: function () {
            const oModel = this.getView().getModel("invoice");
            if (oModel) {
                oModel.refresh(); // 전체 모델 새로 고침
            }
        },

        onExit: function () {
            // 컨트롤러가 소멸될 때 이벤트 버스 구독 해제
            sap.ui.getCore().getEventBus().unsubscribe("InvoiceList", "RefreshData", this.refreshData, this);
        },





        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {
                var oBindingContext = oSelectedItem.getBindingContext("invoice");
                this.getView().getModel("view").setProperty("/selectedItem", oBindingContext ? oBindingContext.getPath() : null);
            } else {
                this.getView().getModel("view").setProperty("/selectedItem", null);
            }
        },

        onPress: function (oEvent) {
            const oSelectedItem = oEvent.getSource();
            if (oSelectedItem) {
                if (this._clickTimer) {
                    clearTimeout(this._clickTimer);
                    this._clickTimer = null;
        
                    const oRouter = this.getOwnerComponent().getRouter();
                    const oModel = this.getView().getModel("invoice");
                    const oBindingContext = oSelectedItem.getBindingContext("invoice");
                    const sPath = oBindingContext.getPath();
        
                    console.log("Selected item path:", sPath);
                    console.log("Model:", oModel);
        
                    // Update ViewCount in the OData V4 model
                    const oContext = oBindingContext.getObject();
                    console.log("Current context:", oContext);
        
                    oContext.ViewCount = (oContext.ViewCount || 0) + 1;
        
                    // Update the binding context
                    oBindingContext.setProperty("ViewCount", oContext.ViewCount);
        
                    
                    oRouter.navTo("detail", {
                        invoicePath: window.encodeURIComponent(oSelectedItem.getBindingContext("invoice").getPath().substr(1))
                    });
                } else {
                    this._clickTimer = setTimeout(() => {
                        this._clickTimer = null;
                        this._selectItem(oSelectedItem);
                    }, this._clickDelay);
                }
            }
        },
        


        _selectItem: function (oItem) {
            const oTable = this.byId("invoiceList");
            oTable.setSelectedItem(oItem);

            const sPath = oItem.getBindingContext("invoice").getPath();
            this.getView().getModel("view").setProperty("/selectedItem", sPath);
        },

        onAdd: async function () {
            const oView = this.getView();
            const oModel = oView.getModel("invoice");
            const oListBinding = oModel.bindList("/Invoices");

            const oData = {
                ProductName: "Title",
                Quantity: "Genre",
                ShipperName: "Product Company",
                Status: "A",
                ExtendedPrice: 100.0,
                CurrencyCode: "USD",
                ViewCount: 0
            };

            try {
                const oContext = oListBinding.create(oData);
                await oContext.created();  // 데이터가 성공적으로 생성될 때까지 대기
                MessageToast.show("Invoice가 성공적으로 추가되었습니다.");

                // 자동 갱신을 위해 모델에서 데이터를 강제로 새로고침
                await oModel.refresh();
            } catch (error) {
                console.error("Invoice 추가에 실패했습니다.", error);
                MessageToast.show("Invoice 추가에 실패했습니다.");
            }
            this._openDialog("Add");
        },

        if(oBinding) {
            oBinding.refresh();
        },

        // onEdit: function () {//
        //     const oViewModel = this.getView().getModel("view");
        //     const sSelectedPath = oViewModel.getProperty("/selectedItem");

        //     if (sSelectedPath) {
        //         this._openDialog("Edit", sSelectedPath);
        //     }
        // },

        // _getSelectedValue: function (sSelectId, sModelName) {
        //     const oSelect = this.byId(sSelectId);
        //     const sSelectedKey = oSelect.getSelectedKey();
        //     const oModel = this.getView().getModel(sModelName);

        //     if (!oModel) {
        //         console.error(`모델 '${sModelName}'을 찾을 수 없습니다.`);
        //         return '';
        //     }

        //     const aItems = oModel.getProperty(`/${sModelName}`) || [];
        //     const oSelectedItem = aItems.find(item => item.key === sSelectedKey);

        //     return oSelectedItem ? oSelectedItem.key : '';
        // },

        // _openEditDialog: function (sPath, sAction) {
        //     const oView = this.getView();
        //     const sUniqueId = jQuery.sap.uid();
        //     const oDialog = new Dialog({
        //         title: sAction === "Add" ? "Invoice 추가" : "Invoice 수정",
        //         content: [
        //             new Text({ text: "Title" }),
        //             new Input(this.createId(sUniqueId + "-productNameInput"), { placeholder: "God Father", value: sAction === "Edit" ? "{invoice>ProductName}" : "" }),
        //             new Text({ text: "Genre" }),
        //             new Input(this.createId(sUniqueId + "-quantityInput"), { placeholder: "action",  value: sAction === "Edit" ? "{invoice>Quantity}" : "" }),
        //             new Text({ text: "Production Company" }),
        //             new Input(this.createId(sUniqueId + "-shipperNameInput"), { placeholder: "sony", value: sAction === "Edit" ? "{invoice>ShipperName}" : "" }),
        //             new Select({
        //                 id: this.createId(sUniqueId + "-statusSelect"),
        //                 items: {
        //                     path: 'statuses>/statuses',
        //                     template: new Item({
        //                         key: '{statuses>key}',
        //                         text: '{statuses>text}'
        //                     })
        //                 }
        //             }),
        //             new Text({ text: "Price" }),
        //             new Input(this.createId(sUniqueId + "-extendedPriceInput"), { placeholder: "Extended Price", type: "Number", value: sAction === "Edit" ? "{invoice>ExtendedPrice}" : "" }),
        //             new Text({ text: "Status" }),
        //             new Select({
        //                 id: this.createId(sUniqueId + "-currencySelect"),
        //                 items: {
        //                     path: 'currencies>/currencies',
        //                     template: new Item({
        //                         key: '{currencies>key}',
        //                         text: '{currencies>text}'
        //                     })
        //                 },
        //                 selectedKey: sAction === "Edit" ? "{invoice>CurrencyCode}" : "EUR"
        //             }),
        //             // Added fields
        //             new Text({ text: "Image URL" }),
        //             new Input(this.createId(sUniqueId + "-imageURLInput"), { placeholder: "Image URL", value: sAction === "Edit" ? "{invoice>ImageURL}" : "" }),
        //             new Text({ text: "Plot Summary" }),
        //             new Input(this.createId(sUniqueId + "-plotSummaryInput"), { placeholder: "Plot Summary", value: sAction === "Edit" ? "{invoice>PlotSummary}" : "" })
        //         ],
        //         beginButton: new Button({
        //             text: sAction === "Add" ? "저장" : "수정",
        //             press: async () => {
        //                 const oModel = oView.getModel("invoice");
        //                 const oData = {
        //                     ProductName: this.byId(sUniqueId + "-productNameInput").getValue(),
        //                     Quantity: this.byId(sUniqueId + "-quantityInput").getValue(),
        //                     ShipperName: this.byId(sUniqueId + "-shipperNameInput").getValue(),
        //                     Status: this.byId(sUniqueId + "-statusSelect").getSelectedKey(),
        //                     ExtendedPrice: parseFloat(this.byId(sUniqueId + "-extendedPriceInput").getValue()),
        //                     CurrencyCode: this.byId(sUniqueId + "-currencySelect").getSelectedKey(),
        //                     ImageURL: this.byId(sUniqueId + "-imageURLInput").getValue(), // Added field
        //                     PlotSummary: this.byId(sUniqueId + "-plotSummaryInput").getValue() // Added field
        //                 };

        //                 try {
        //                     if (sAction === "Add") {
        //                         const oListBinding = oModel.bindList("/Invoices");
        //                         const oContext = oListBinding.create(oData);
        //                         await oContext.created();
        //                         MessageToast.show("Invoice가 성공적으로 추가되었습니다.");
        //                     } else if (sAction === "Edit") {
        //                         const oBindingContext = oDialog.getBindingContext("invoice");
        //                         await oBindingContext.requestObject(); // Wait until data is loaded
        //                         Object.keys(oData).forEach(key => {
        //                             oBindingContext.setProperty(key, oData[key]);
        //                         });
        //                         await oModel.submitBatch("$auto");
        //                         MessageToast.show("Invoice가 성공적으로 수정되었습니다.");
        //                     }
        //                     oDialog.close();
        //                 } catch (error) {
        //                     console.error(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.", error);
        //                     MessageToast.show(sAction === "Add" ? "Invoice 추가에 실패했습니다." : "Invoice 수정에 실패했습니다.");
        //                 }
        //             }
        //         }),
        //         endButton: new Button({
        //             text: "취소",
        //             press: () => {
        //                 oDialog.close();
        //             }
        //         })
        //     });

        //     if (sAction === "Edit" && sPath && sPath.startsWith('/')) {
        //         oDialog.bindElement({
        //             path: sPath,
        //             model: "invoice",
        //             events: {
        //                 dataReceived: function () {
        //                     const oContext = oDialog.getBindingContext("invoice");
        //                     if (oContext) {
        //                         const oData = oContext.getObject();
        //                         oDialog.getContent().forEach(control => {
        //                             if (control instanceof Input) {
        //                                 control.setValue(oData[control.getId().split('-').pop()]);
        //                             } else if (control instanceof Select) {
        //                                 control.setSelectedKey(oData[control.getId().split('-').pop()]);
        //                             }
        //                         });
        //                     }
        //                 }
        //             }
        //         });
        //     } else if (sAction === "Add") {
        //         oDialog.unbindElement();
        //         oDialog.getContent().forEach(control => {
        //             if (control instanceof Input) {
        //                 control.setValue("");
        //             } else if (control instanceof Select) {
        //                 control.setSelectedKey("");
        //             }
        //         });
        //     } else {
        //         console.error("잘못된 바인딩 경로:", sPath);
        //     }

        //     oView.addDependent(oDialog);
        //     oDialog.open();
        //     oModel.refresh();
        // },


        onDelete: async function () {
            const oViewModel = this.getView().getModel("view");
            const sSelectedPath = oViewModel.getProperty("/selectedItem");
            console.log("선택된 경로: ", sSelectedPath);

            if (sSelectedPath) {
                const oModel = this.getView().getModel("invoice");
                const oList = this.byId("invoiceList");
                const oItem = oList.getItems().find(item => {
                    const oContext = item.getBindingContext("invoice");
                    if (oContext) {
                        console.log("아이템 경로: ", oContext.getPath());
                        return oContext.getPath() === sSelectedPath;
                    }
                    return false;
                });

                if (oItem) {
                    const oBindingContext = oItem.getBindingContext("invoice");

                    try {
                        if (oBindingContext) {
                            await oBindingContext.delete("$auto"); // 자동 제출을 위해 '$auto' 그룹 ID 사용
                            MessageToast.show("Invoice가 성공적으로 삭제되었습니다.");
                            await oModel.refresh(); // 모델을 새로 고쳐서 뷰를 업데이트합니다.
                        } else {
                            throw new Error("주어진 경로에 대한 컨텍스트를 가져올 수 없습니다.");
                        }
                    } catch (error) {
                        console.error("Invoice 삭제에 실패했습니다:", error);
                        MessageToast.show("Invoice 삭제에 실패했습니다.");
                    }
                } else {
                    MessageToast.show("선택된 항목이 더 이상 사용할 수 없습니다.");
                }
            } else {
                MessageToast.show("삭제할 Invoice가 선택되지 않았습니다.");
            }
        },

        onFilterInvoices(oEvent) {
            const aFilter = [];
            const sQuery = oEvent.getParameter("query");
            console.log("Filtering with query: ", sQuery);

            if (sQuery) {
                aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
            }

            console.log("Filters: ", aFilter);

            const oList = this.byId("invoiceList");
            const oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        },

        onSortChange: function (oEvent) {
            const sPath = oEvent.getParameter("selectedItem").getKey();
            const oTable = this.byId("invoiceList");
            const oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return; // 바인딩이 없는 경우
            }

            const aSorters = [];
            if (sPath) {
                aSorters.push(new sap.ui.model.Sorter(sPath));
            }

            oBinding.sort(aSorters);
        }

    });
});