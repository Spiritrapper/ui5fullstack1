```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",  // SAPUI5의 기본 Controller 모듈을 가져옵니다.
    "sap/ui/model/json/JSONModel", // JSON 데이터를 다루기 위한 JSONModel을 가져옵니다.
    "sap/ui/model/odata/v4/ODataModel", // OData V4 모델을 다루기 위한 ODataModel을 가져옵니다.
    "../model/formatter", // 포맷터를 가져옵니다. (주로 데이터 포맷을 정의하는 데 사용)
    "sap/ui/model/Filter", // 필터를 적용하기 위한 Filter 모듈을 가져옵니다.
    "sap/ui/model/FilterOperator", // 필터의 연산자를 정의하기 위한 FilterOperator 모듈을 가져옵니다.
    "sap/m/MessageToast", // 사용자에게 메시지를 보여주기 위한 MessageToast 모듈을 가져옵니다.
    "sap/m/Dialog", // 사용자와 상호작용을 위한 Dialog 모듈을 가져옵니다.
    "sap/m/Button", // 버튼 UI 컨트롤을 가져옵니다.
    "sap/m/Text", // 텍스트 UI 컨트롤을 가져옵니다.
    "sap/m/Input", // 입력 UI 컨트롤을 가져옵니다.
    "sap/m/Select", // 선택 UI 컨트롤을 가져옵니다.
    "sap/ui/core/Item", // 선택 항목을 정의하는 Item 모듈을 가져옵니다.
    "sap/ui/layout/form/SimpleForm" // 간단한 폼을 만드는 SimpleForm 모듈을 가져옵니다.
], (Controller, JSONModel, ODataModel, formatter, Filter, FilterOperator, MessageToast, Dialog, Button, Text, Input, Select, Item, SimpleForm) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
        formatter: formatter, // 포맷터를 컨트롤러에 연결합니다.

        onInit() {
            console.log("InvoiceList.controller"); // 컨트롤러 초기화 시 로그 출력

            // OData 서비스 URL 설정
            const sServiceUrl = "https://port4004-workspaces-ws-z7sjw.us10.trial.applicationstudio.cloud.sap/odata/v4/invoice/";

            try {
                // ODataModel 생성 및 설정
                const oModel = new ODataModel({
                    serviceUrl: sServiceUrl,
                    synchronizationMode: "None",
                    autoExpandSelect: true,
                    operationMode: "Server",
                    refreshAfterChange: true,
                    metadataUrlParams: {
                        "sap-language": "EN",
                        "sap-cacherefresh": "true" // 메타데이터 새로고침 강제
                    }
                });
                this.getView().setModel(oModel, "invoice"); // 뷰에 모델 설정
            } catch (error) {
                console.error("ODataModel 초기화 실패:", error); // ODataModel 초기화 실패 시 오류 로그 출력
            }

            // 뷰 모델 설정
            const oViewModel = new JSONModel({
                currency: "EUR", // 기본 통화 설정
                selectedItem: null, // 선택된 아이템 초기화
                currentPage: 1, // 현재 페이지 초기화
                pageSize: 20, // 페이지 크기 설정
                hasMore: false // 더 많은 데이터가 있는지 여부 초기화
            });
            this.getView().setModel(oViewModel, "view"); // 뷰 모델을 뷰에 설정

            // 리소스 모델 설정
            let oResourceModel = this.getView().getModel("i18n");
            if (!oResourceModel) {
                oResourceModel = new sap.ui.model.resource.ResourceModel({
                    bundleName: "ui5.walkthrough.i18n.i18n" // i18n 리소스 번들 설정
                });
                this.getView().setModel(oResourceModel, "i18n"); // 뷰에 리소스 모델 설정
            }

            const oResourceBundle = oResourceModel.getResourceBundle();

            // 상태 모델 설정
            const oStatusModel = new JSONModel({
                statuses: [
                    { key: 'A', text: oResourceBundle.getText('invoiceStatusA') },
                    { key: 'B', text: oResourceBundle.getText('invoiceStatusB') },
                    { key: 'D', text: oResourceBundle.getText('invoiceStatusD') },
                    { key: 'E', text: oResourceBundle.getText('invoiceStatusE') },
                    { key: 'F', text: oResourceBundle.getText('invoiceStatusF') },
                ]
            });
            this.getView().setModel(oStatusModel, 'statuses'); // 상태 모델을 뷰에 설정

            // 통화 모델 설정
            const oCurrencyModel = new JSONModel({
                currencies: [
                    { key: 'EUR', text: 'Euro' },
                    { key: 'USD', text: 'US Dollar' }
                ]
            });
            this.getView().setModel(oCurrencyModel, 'currencies'); // 통화 모델을 뷰에 설정

            this._clickTimer = null; // 클릭 타이머 초기화
            this._clickDelay = 300; // 클릭 지연 시간 설정 (밀리초)

            // 이벤트 버스 구독
            sap.ui.getCore().getEventBus().subscribe("InvoiceList", "RefreshData", this.refreshData, this);

            // 라우터 이벤트 등록
            this.getOwnerComponent().getRouter().getRoute("overview").attachPatternMatched(this.onRouteMatched, this);

            this._loadData(); // 데이터 로드
        },

        _loadData: function () {
            // 뷰 모델 및 OData 모델 가져오기
            const oViewModel = this.getView().getModel("view");
            const oModel = this.getView().getModel("invoice");
            const iPageSize = oViewModel.getProperty("/pageSize"); // 페이지 크기 가져오기
            const iSkip = oViewModel.getProperty("/currentPage") * iPageSize; // 페이지에서 스킵할 데이터 수 계산

            const oTable = this.byId("invoiceList"); // 리스트 컨트롤 가져오기
            const oBinding = oTable.getBinding("items"); // 리스트 아이템 바인딩 가져오기

            if (oBinding) {
                // 바인딩 파라미터 변경 (페이징을 위한 $top, $skip 설정)
                oBinding.changeParameters({
                    $top: iPageSize,
                    $skip: iSkip
                });
                // 바인딩의 변경이 감지되면
                oBinding.attachChange(() => {
                    const iTotal = oBinding.getLength(); // 총 아이템 수 가져오기
                    const bHasMore = iTotal === iPageSize; // 더 많은 데이터가 있는지 여부 설정
                    oViewModel.setProperty("/hasMore", bHasMore); // 뷰 모델 업데이트
                });
            }
        },

        onNextPage: function () {
            // 현재 페이지를 증가시키고 데이터 로드
            const oViewModel = this.getView().getModel("view");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            oViewModel.setProperty("/currentPage", iCurrentPage + 1);
            this._loadData(); // 데이터 로드
        },

        onPreviousPage: function () {
            // 현재 페이지를 감소시키고 데이터 로드
            const oViewModel = this.getView().getModel("view");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            if (iCurrentPage > 0) {
                oViewModel.setProperty("/currentPage", iCurrentPage - 1);
                this._loadData(); // 데이터 로드
            }
        },

        onRouteMatched: function () {
            // 라우트가 매칭될 때 데이터 새로고침
            this.refreshData();
        },

        refreshData: function () {
            // 테이블 바인딩을 새로 고쳐서 데이터 갱신
            const oTable = this.byId("invoiceList");
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.refresh(); // 바인딩 새로 고침
            }
        },

        onExit: function () {
            // 컨트롤러가 소멸될 때 이벤트 버스 구독 해제
            sap.ui.getCore().getEventBus().unsubscribe("InvoiceList", "RefreshData", this.refreshData, this);
        },

        onSelectionChange: function (oEvent) {
            // 리스트 아이템 선택 시 호출
            var oTable = oEvent.getSource(); // 선택된 테이블 컨트롤 가져오기
            var oSelectedItem = oTable.getSelectedItem(); // 선택된 아이템 가져오기

            if (oSelectedItem) {
                // 선택된 아이템의 바인딩 컨텍스트를 뷰 모델에 설정
                var oBindingContext = oSelectedItem.getBindingContext("invoice");
                this.getView().getModel("view").setProperty("/selectedItem", oBindingContext ? oBindingContext.getPath() : null);
            } else {
                this.getView().getModel("view").setProperty("/selectedItem", null); // 선택된 아이템이 없으면 null로 설정
            }
        },

        onPress: function () {
            // 아이템이 클릭되었을 때 호출
            var oView = this.getView(); // 현재 뷰 가져오기
            var oViewModel = oView.getModel("view"); // 뷰 모델 가져오기
            var sPath = oViewModel.getProperty("/selectedItem"); // 선택된 아이템 경로 가져오기
            if (sPath) {
                // 선택된 아이템이 있을 경우 디테일 페이지로 내비게이션
                this.getOwnerComponent().getRouter().navTo("detail", {
                    contextPath: encodeURIComponent(sPath) // 컨텍스트 경로를 인코딩하여 내비게이션
                });
            }
        },

        onAdd: function () {
            // 추가 버튼 클릭 시 호출
            var oDialog = new Dialog({
                title: 'Add Invoice',
                content: [
                    new SimpleForm({
                        content: [
                            new Text({ text: "Invoice Number" }),
                            new Input({ id: "invoiceNumber" }),
                            new Text({ text: "Customer" }),
                            new Input({ id: "customer" }),
                            new Text({ text: "Amount" }),
                            new Input({ id: "amount" }),
                            new Text({ text: "Currency" }),
                            new Select({
                                id: "currency",
                                items: {
                                    path: "currencies>/currencies",
                                    template: new Item({
                                        key: "{currencies>key}",
                                        text: "{currencies>text}"
                                    })
                                }
                            })
                        ]
                    })
                ],
                beginButton: new Button({
                    text: 'Save',
                    press: () => {
                        // 저장 버튼 클릭 시 처리
                        var sInvoiceNumber = sap.ui.getCore().byId("invoiceNumber").getValue();
                        var sCustomer = sap.ui.getCore().byId("customer").getValue();
                        var sAmount = sap.ui.getCore().byId("amount").getValue();
                        var sCurrency = sap.ui.getCore().byId("currency").getSelectedKey();

                        // ODataModel을 사용하여 새로운 데이터 생성
                        var oModel = this.getView().getModel("invoice");
                        oModel.create("/Invoices", {
                            InvoiceNumber: sInvoiceNumber,
                            Customer: sCustomer,
                            Amount: sAmount,
                            Currency: sCurrency
                        }, {
                            success: () => {
                                this.refreshData(); // 데이터 새로 고침
                                MessageToast.show("Invoice added successfully!"); // 성공 메시지
                                oDialog.close(); // 대화 상자 닫기
                            },
                            error: (oError) => {
                                MessageToast.show("Failed to add invoice."); // 실패 메시지
                            }
                        });
                    }
                }),
                endButton: new Button({
                    text: 'Cancel',
                    press: () => oDialog.close() // 취소 버튼 클릭 시 대화 상자 닫기
                })
            });
            oDialog.open(); // 대화 상자 열기
        }
    });
});


        onDelete: function () {
            // 삭제 버튼 클릭 시 호출
            var oView = this.getView(); // 현재 뷰 가져오기
            var oViewModel = oView.getModel("view"); // 뷰 모델 가져오기
            var sPath = oViewModel.getProperty("/selectedItem"); // 선택된 아이템 경로 가져오기

            if (sPath) {
                // 선택된 아이템이 있을 경우 삭제 확인 대화 상자 표시
                var oDialog = new Dialog({
                    title: 'Confirm Deletion',
                    type: 'Message',
                    content: new Text({
                        text: 'Are you sure you want to delete this invoice?'
                    }),
                    beginButton: new Button({
                        text: 'Delete',
                        press: () => {
                            // 삭제 버튼 클릭 시 처리
                            var oModel = this.getView().getModel("invoice");
                            oModel.remove(sPath, {
                                success: () => {
                                    this.refreshData(); // 데이터 새로 고침
                                    MessageToast.show("Invoice deleted successfully!"); // 성공 메시지
                                    oDialog.close(); // 대화 상자 닫기
                                },
                                error: (oError) => {
                                    MessageToast.show("Failed to delete invoice."); // 실패 메시지
                                }
                            });
                        }
                    }),
                    endButton: new Button({
                        text: 'Cancel',
                        press: () => oDialog.close() // 취소 버튼 클릭 시 대화 상자 닫기
                    })
                });
                oDialog.open(); // 대화 상자 열기
            } else {
                MessageToast.show("No invoice selected for deletion."); // 선택된 아이템이 없으면 메시지 표시
            }
        },

        onUpdate: function () {
            // 업데이트 버튼 클릭 시 호출
            var oView = this.getView(); // 현재 뷰 가져오기
            var oViewModel = oView.getModel("view"); // 뷰 모델 가져오기
            var sPath = oViewModel.getProperty("/selectedItem"); // 선택된 아이템 경로 가져오기

            if (sPath) {
                // 선택된 아이템이 있을 경우 업데이트 대화 상자 표시
                var oDialog = new Dialog({
                    title: 'Update Invoice',
                    content: [
                        new SimpleForm({
                            content: [
                                new Text({ text: "Invoice Number" }),
                                new Input({ id: "invoiceNumber", value: "{invoice>/InvoiceNumber}" }),
                                new Text({ text: "Customer" }),
                                new Input({ id: "customer", value: "{invoice>/Customer}" }),
                                new Text({ text: "Amount" }),
                                new Input({ id: "amount", value: "{invoice>/Amount}" }),
                                new Text({ text: "Currency" }),
                                new Select({
                                    id: "currency",
                                    selectedKey: "{invoice>/Currency}",
                                    items: {
                                        path: "currencies>/currencies",
                                        template: new Item({
                                            key: "{currencies>key}",
                                            text: "{currencies>text}"
                                        })
                                    }
                                })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: 'Save',
                        press: () => {
                            // 저장 버튼 클릭 시 처리
                            var sInvoiceNumber = sap.ui.getCore().byId("invoiceNumber").getValue();
                            var sCustomer = sap.ui.getCore().byId("customer").getValue();
                            var sAmount = sap.ui.getCore().byId("amount").getValue();
                            var sCurrency = sap.ui.getCore().byId("currency").getSelectedKey();

                            // ODataModel을 사용하여 데이터 업데이트
                            var oModel = this.getView().getModel("invoice");
                            oModel.update(sPath, {
                                InvoiceNumber: sInvoiceNumber,
                                Customer: sCustomer,
                                Amount: sAmount,
                                Currency: sCurrency
                            }, {
                                success: () => {
                                    this.refreshData(); // 데이터 새로 고침
                                    MessageToast.show("Invoice updated successfully!"); // 성공 메시지
                                    oDialog.close(); // 대화 상자 닫기
                                },
                                error: (oError) => {
                                    MessageToast.show("Failed to update invoice."); // 실패 메시지
                                }
                            });
                        }
                    }),
                    endButton: new Button({
                        text: 'Cancel',
                        press: () => oDialog.close() // 취소 버튼 클릭 시 대화 상자 닫기
                    })
                });
                oDialog.open(); // 대화 상자 열기
            } else {
                MessageToast.show("No invoice selected for update."); // 선택된 아이템이 없으면 메시지 표시
            }
        },

        onSearch: function (oEvent) {
            // 검색 버튼 클릭 시 호출
            const sQuery = oEvent.getParameter("query"); // 검색 쿼리 가져오기
            const oViewModel = this.getView().getModel("view"); // 뷰 모델 가져오기
            const oTable = this.byId("invoiceList"); // 리스트 컨트롤 가져오기
            const oBinding = oTable.getBinding("items"); // 리스트 아이템 바인딩 가져오기

            if (oBinding) {
                // 쿼리에 기반하여 필터 적용
                const aFilters = [];
                if (sQuery) {
                    aFilters.push(new Filter({
                        path: "InvoiceNumber",
                        operator: FilterOperator.Contains,
                        value1: sQuery
                    }));
                }
                oBinding.filter(aFilters); // 바인딩에 필터 적용
            }
        }
    });
});
sssddd