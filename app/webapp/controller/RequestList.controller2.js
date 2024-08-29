sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Request", {

        

        onInit: function () {
            this.sServiceUrl = "https://port4005-workspaces-ws-z7sjw.us10.trial.applicationstudio.cloud.sap/odata/v4/request/Request";
            this._oModel = new JSONModel();
            this.getView().setModel(this._oModel, "request");
            

            const oViewModel = new JSONModel({
                currency:"₩",
                isAdminMode: false,
                selectedItem: null,
                currentPage: 0,
                pageSize: 10,
                hasMore: false
            });
            this.getView().setModel(oViewModel, "view");

            this._loadData();

            // Initialize click timer and delay
            this._clickTimer = null;
            this._clickDelay = 300; // 30

            // var oRequestModel = this.getView().getModel("request");
            // if (!oRequestModel) {
            //     oRequestModel = new sap.ui.model.json.JSONModel();
            //     this.getView().setModel(oRequestModel, "request");
            // }
            // // 모든 가능한 request_state 값을 하드코딩하여 설정
            // oRequestModel.setProperty("/Request_state", [
            //     { request_state_key: "NEW", request_state_kor: "신규" },
            //     { request_state_key: "INPROGRESS", request_state_kor: "진행중" },
            //     { request_state_key: "COMPLETED", request_state_kor: "완료" },
            //     { request_state_key: "REJECTED", request_state_kor: "거절" }
            // ]);
            //RequestList 컨트롤러에서 라우팅 이벤트 처리:
            // RequestList 컨트롤러에서 라우팅 이벤트를 처리하여 화면에 진입할 때마다 데이터를 새로 로드합니다:
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("overview").attachPatternMatched(this._onObjectMatched, this);

        },

        _loadRequestStates: function () {
            $.ajax({
                type: "GET",
                url: this.sServiceUrl + "_state",
                success: (oData) => {
                    let oModel = this.getView().getModel("request");
                    if (!oModel) {
                        oModel = new JSONModel();
                        this.getView().setModel(oModel, "request");
                    }
                    oModel.setProperty("/RequestStates", oData.value);
                },
                error: (error) => {
                    console.error("Failed to load Request_state data:", error);
                }
            });
        },
        
        _onObjectMatched: function (oEvent) {
            this._loadData(); // 데이터 새로 로드
        },

        onAdminModeChange: function (oEvent) {
            var bIsAdminMode = oEvent.getParameter("state");
            this.getView().getModel("view").setProperty("/isAdminMode", bIsAdminMode);

            // You can add additional logic here, like showing a confirmation dialog
            if (bIsAdminMode) {
                // Maybe ask for admin password
                this._showAdminConfirmationDialog();
            }
        },

        _showAdminConfirmationDialog: function () {
            // Implement a dialog to confirm admin access
            // This is just a placeholder for where you might add security measures
        },



        _loadData: function (sFilterQuery) {

            const oViewModel = this.getView().getModel("view");
            const iPageSize = oViewModel.getProperty("/pageSize");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            const iSkip = iCurrentPage * iPageSize;

            let sUrl = `${this.sServiceUrl}?$skip=${iSkip}&$top=${iPageSize}&$expand=request_state`;

            if (sFilterQuery) {
                sUrl += `&$filter=contains(request_product,'${sFilterQuery}') or contains(requestor,'${sFilterQuery}') or contains(request_reason,'${sFilterQuery}') or contains(request_state/request_state_kor,'${sFilterQuery}')`;
            }

            $.ajax({
                type: "GET",
                url: sUrl,
                async: true,
                headers: {
                    "Accept": "application/json"
                },
                success: (oData) => {
                    console.log("Received Data:", oData);
                    const oTable = this.byId("requestList");
                    if (!oTable) {
                        console.error("Table not found.");
                        return;
                    }
                    const aData = oData.value;
                    // 페이지 크기에 맞게 데이터 자르기
                    if (aData.length > iPageSize) {
                        console.warn(`Received more items than expected. Trimming to ${iPageSize} items.`);
                        aData = aData.slice(0, iPageSize);
                    }


                    let oModel = this.getView().getModel("request");
                    if (!oModel) {
                        oModel = new JSONModel();
                        this.getView().setModel(oModel, "request");
                    }

                    oModel.setData({ Requests: aData });  // Changed from Invoices to Requests
                    console.log("Model Data:", oModel.getData());

                    oViewModel.setProperty("/hasMore", aData.length === iPageSize);
                    oViewModel.setProperty("/currentPage", iCurrentPage);

                    oModel.refresh(true);  // Force update of bindings

                    const oBinding = oTable.getBinding("items");
                    if (oBinding) {
                        oBinding.refresh();
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("데이터 로드에 실패했습니다:", {
                        status: jqXHR.status,
                        statusText: jqXHR.statusText,
                        responseText: jqXHR.responseText,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });
                    MessageToast.show("데이터 로드에 실패했습니다: " + jqXHR.statusText);
                }

            });

            $.ajax({
                type: "GET",
                url: this.sServiceUrl + "?$orderby=request_number desc&$top=1",
                success: (result) => {
                    this._lastRequestNumber = result.value.length > 0 ? result.value[0].request_number : 0;
                },
                error: (xhr, status, error) => {
                    console.error("Failed to load data", error);
                }
            });


        },

        onFilterRequests: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            console.log("Filtering with query: ", sQuery);


            if (sQuery === "") {
                // 검색어가 비어있으면 필터 초기화
                return this.onResetFilter();
            }

            // Reset the current page to 0 when filtering
            this.getView().getModel("view").setProperty("/currentPage", 0);

            // Call _loadData with the filter query
            this._loadData(sQuery);
        },

        onLiveSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");

            if (sQuery === "") {
                // 검색어가 비어있으면 필터 초기화
                this.onResetFilter();
            } else {
                // 검색어가 있으면 필터 적용
                this.onFilterRequests({ getParameter: function () { return sQuery; } });
            }
        },

        onResetFilter: function () {
            // 필터 쿼리 초기화
            this._currentFilterQuery = "";

            // 뷰 모델의 현재 페이지를 0으로 리셋
            this.getView().getModel("view").setProperty("/currentPage", 0);

            // SearchField 초기화 (뷰에 id "searchField"로 SearchField가 있다고 가정)
            // this.byId("searchField").setValue(""); // 이 줄을 제거 또는 주석 처리

            // 데이터 다시 로드
            this._loadData();

            MessageToast.show("필터가 초기화되었습니다.");
        },

        onNextPage: function () {
            var oViewModel = this.getView().getModel("view");
            var iCurrentPage = oViewModel.getProperty("/currentPage");
            oViewModel.setProperty("/currentPage", iCurrentPage + 1);
            // this._loadData();
            this._loadData(this._currentFilterQuery);
        },

        onPreviousPage: function () {
            var oViewModel = this.getView().getModel("view");
            var iCurrentPage = oViewModel.getProperty("/currentPage");
            if (iCurrentPage > 0) {
                oViewModel.setProperty("/currentPage", iCurrentPage - 1);
                // this._loadData();
                this._loadData(this._currentFilterQuery);
            }
        },

        onCreate: function () {
            if (!this.getView().getModel("view").getProperty("/isAdminMode")) {
                // Show message or handle unauthorized access
                return;
            }
            let data = {
                request_number: this._lastRequestNumber + 1,
                request_product: "2",
                request_quantity: 2,
                requestor: "2",
                request_date: "2024-08-24", // Provide a valid date in YYYY-MM-DD format
                request_state_request_state_key: "NEW",
                request_reason: 2,
                request_estimated_price: "2",
                request_reject_reason: "2"
            };

            console.log("Creating data:", JSON.stringify(data));
            // AJAX call to POST data
            $.ajax({
                type: 'POST',
                url: `${this.sServiceUrl}`,
                async: true,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: (result) => {
                    debugger;
                    console.log("Create successful", result);
                    this._loadData(); // Refresh data after creation
                },
                error: (xhr, status, error) => {
                    console.error("Failed to create data", error);
                    console.error("XHR:", xhr.responseText); // Server response for error details
                }
            });
        },

        // onUpdate: function () {
        //     let data = {
        //         requestor: "3",
        //         request_date: "2024-08-25", // Update to a valid date format
        //         request_state: "3" // Update with appropriate value
        //     };

        //     // AJAX call to PATCH data
        //     $.ajax({
        //         type: 'PATCH',
        //         url: `${this.sServiceUrl}/2`, // Assuming ID is 2 for update
        //         data: JSON.stringify(data),
        //         contentType: 'application/json',
        //         success: (result) => {
        //             console.log("Update successful", result);
        //             this._loadData(); // Refresh data after update
        //         },
        //         error: (xhr, status, error) => {
        //             console.error("Failed to update data", error);
        //         }
        //     });
        // },

        _navigateToDetail: function (oItem) {
            const oBindingContext = oItem.getBindingContext("request");
            if (oBindingContext) {
                const oData = oBindingContext.getObject();
                if (oData && oData.request_number) {
                    console.log("Navigating to detail view for request number:", oData.request_number);

                    this.getOwnerComponent().getRouter().navTo("detail", {
                        requestNumber: oData.request_number.toString()

                    });
                } else {
                    console.error("request_number is undefined or null");
                    MessageToast.show("Error: Unable to navigate to detail view");
                }
            } else {
                console.error("Binding context is undefined for the selected item.");
                MessageToast.show("Error: Unable to get item details");
            }
        },

        _selectItem: function (oItem) {
            if (oItem) {
                const oBindingContext = oItem.getBindingContext("request");
                if (oBindingContext) {
                    const sPath = oBindingContext.getPath();
                    const oModel = this.getView().getModel("request");
                    oModel.setProperty("/selectedItem", sPath);
                    console.log("Selected item path set in model:", sPath);

                    // Optionㄱㄷㅋally, you can visually indicate the selection
                    oItem.setSelected(true);
                }
            }
        },

        onPress: function (oEvent) {

            const oItem = oEvent.getSource();

            var bIsAdminMode = this.getView().getModel("view").getProperty("/isAdminMode");
            var oRouter = this.getOwnerComponent().getRouter();


            if (bIsAdminMode) {
                // Navigate to edit page
                oRouter.navTo("edit", {
                    requestPath: window.encodeURIComponent(oItem.getBindingContext("request").getPath().substr(1))
                });
            } else {
                // Navigate to detail page (read-only)
                oRouter.navTo("detail", {
                    requestPath: window.encodeURIComponent(oItem.getBindingContext("request").getPath().substr(1))
                });
            }

            // // // `Detail` 페이지로 이동
            // oRouter.navTo("detail", {
            //     requestPath: window.encodeURIComponent(oItem.getBindingContext("request").getPath().substr(1))
            // });

            if (this._clickTimer) {
                clearTimeout(this._clickTimer);
                this._clickTimer = null;
                this._navigateToDetail(oItem);
                bIsAdminMode: bIsAdminMode
            } else {
                this._clickTimer = setTimeout(() => {
                    this._clickTimer = null;
                    this._selectItem(oItem);
                }, this._clickDelay);
            }


        },

        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            if (oSelectedItem) {
                var sPath = oSelectedItem.getBindingContext("request").getPath();
                this.getView().getModel("request").setProperty("/selectedItem", sPath);
                console.log("선택된 항목 경로가 모델에 설정됨:", sPath);
            }
        },

        // 삭제 함수 수정
        onDelete: function () {
            if (!this.getView().getModel("view").getProperty("/isAdminMode")) {
                // Show message or handle unauthorized access
                return;
            }
            var oModel = this.getView().getModel("request");
            var sSelectedPath = oModel.getProperty("/selectedItem");

            if (sSelectedPath) {
                var oData = oModel.getProperty(sSelectedPath);
                var sRequestNumber = oData.request_number;
                console.log("삭제할 요청 번호:", sRequestNumber);

                // AJAX 호출로 데이터 삭제
                $.ajax({
                    type: 'DELETE',
                    url: `${this.sServiceUrl}/${sRequestNumber}`,
                    success: (result) => {
                        console.log("삭제 성공", result);
                        this._loadData(); // 삭제 후 데이터 새로고침
                        oModel.setProperty("/selectedItem", null); // 삭제 후 선택 초기화
                        MessageToast.show("항목이 삭제되었습니다.");
                    },
                    error: (xhr, status, error) => {
                        console.error("데이터 삭제 실패", error);
                        MessageToast.show("삭제 중 오류가 발생했습니다.");
                    }
                });
            } else {
                console.error("삭제할 항목이 선택되지 않았습니다.");
                MessageToast.show("삭제할 항목을 선택해주세요.");
            }
        },

        // onFilterRequests(oEvent) {
        //     const aFilter = [];
        //     const sQuery = oEvent.getParameter("query");
        //     console.log("Filtering with query: ", sQuery);

        //     if (sQuery) {
        //         aFilter.push(new Filter("request_product", FilterOperator.Contains, sQuery));
        //         // aFilter.push(new Filter("requestor", FilterOperator.Contains, sQuery));
        //         // aFilter.push(new Filter("request_reason", FilterOperator.Contains, sQuery));
        //         // aFilter.push(new Filter("request_state", FilterOperator.Contains, sQuery));
        //     }

        //     console.log("Filters: ", aFilter);

        //     const oList = this.byId("requestList");
        //     const oBinding = oList.getBinding("items");
        //     oBinding.filter(aFilter);
        // },
        // onFilterRequests: function(oEvent) {
        //     const sQuery = oEvent.getParameter("query");
        //     console.log("Filtering with query: ", sQuery);

        //     let aFilters = [];
        //     if (sQuery) {
        //         aFilters = [
        //             new sap.ui.model.Filter({
        //                 filters: [
        //                     new sap.ui.model.Filter("request_product", sap.ui.model.FilterOperator.Contains, sQuery),
        //                     new sap.ui.model.Filter("requestor", sap.ui.model.FilterOperator.Contains, sQuery),
        //                     new sap.ui.model.Filter("request_reason", sap.ui.model.FilterOperator.Contains, sQuery),
        //                     new sap.ui.model.Filter("request_state/request_state_kor", sap.ui.model.FilterOperator.Contains, sQuery)
        //                 ],
        //                 and: false
        //             })
        //         ];
        //     }

        //     console.log("Filters: ", aFilters);

        //     const oList = this.byId("requestList");
        //     const oBinding = oList.getBinding("items");

        //     if (oBinding) {
        //         if (oBinding.filter) {
        //             oBinding.filter(aFilters);
        //         } else if (oBinding.changeParameters) {
        //             // OData V4의 경우
        //             const sFilterString = aFilters.length > 0 ? aFilters[0].toString() : undefined;
        //             oBinding.changeParameters({ $filter: sFilterString });
        //         } else {
        //             console.error("Binding does not support filtering");
        //         }
        //     } else {
        //         console.error("Binding not found for the list");
        //     }
        // },


        onSortChange: function (oEvent) {
            const sPath = oEvent.getParameter("selectedItem").getKey();
            const oTable = this.byId("requestList");
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
