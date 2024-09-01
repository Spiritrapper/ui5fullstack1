sap.ui.define([
    "sap/ui/core/mvc/Controller",         // SAP UI5의 기본 컨트롤러 클래스
    "sap/ui/model/json/JSONModel",        // JSON 데이터를 위한 모델 클래스
    "sap/m/MessageToast",                 // 간단한 메시지를 화면에 표시하기 위한 메시지 토스트 클래스
    "../model/formatter",                 // 데이터 포맷팅을 위한 커스텀 포맷터
    "sap/ui/model/Filter",                // 모델의 필터링을 위한 필터 클래스
    "sap/ui/model/FilterOperator"         // 필터 연산자 (FilterOperator) 클래스
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict"; // Strict mode 활성화

    return Controller.extend("ui5.walkthrough.controller.Request", {
        // Request 컨트롤러 정의 시작

        onInit: function () {
            // 컨트롤러 초기화 함수

            this.sServiceUrl = "https://port4005-workspaces-ws-z7sjw.us10.trial.applicationstudio.cloud.sap/odata/v4/request/Request";
            // OData 서비스의 기본 URL 설정

            this._oModel = new JSONModel();
            this.getView().setModel(this._oModel, "request");
            // "request"라는 이름으로 JSON 모델을 생성하고 뷰에 설정

            const oViewModel = new JSONModel({
                currency:"₩",                 // 통화 기호 설정
                isAdminMode: false,           // 관리자 모드 여부 설정
                selectedItem: null,           // 선택된 항목 초기화
                currentPage: 0,               // 현재 페이지 번호 설정
                pageSize: 10,                 // 페이지당 항목 수 설정
                hasMore: false                // 다음 페이지가 있는지 여부 설정
            });
            this.getView().setModel(oViewModel, "view");
            // "view"라는 이름으로 뷰 모델 생성 및 뷰에 설정

            this._loadData();
            // 데이터 로드 함수 호출

            this._clickTimer = null;          // 클릭 타이머 초기화
            this._clickDelay = 300;           // 더블클릭 지연 시간 설정

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("overview").attachPatternMatched(this._onObjectMatched, this);
            // 라우팅 이벤트를 처리하여 화면에 진입할 때마다 데이터를 새로 로드
        },

        _loadRequestStates: function () {
            // 요청 상태 데이터를 로드하는 함수

            $.ajax({
                type: "GET",
                url: this.sServiceUrl + "_state",
                // 요청 상태를 가져오기 위한 API 호출

                success: (oData) => {
                    let oModel = this.getView().getModel("request");
                    if (!oModel) {
                        oModel = new JSONModel();
                        this.getView().setModel(oModel, "request");
                    }
                    oModel.setProperty("/RequestStates", oData.value);
                    // 로드된 데이터를 모델에 설정
                },
                error: (error) => {
                    console.error("Failed to load Request_state data:", error);
                    // 데이터 로드 실패 시 콘솔에 에러 메시지 출력
                }
            });
        },
        
        _onObjectMatched: function (oEvent) {
            this._loadData(); // 화면에 진입할 때마다 데이터를 새로 로드
        },

        onAdminModeChange: function (oEvent) {
            var bIsAdminMode = oEvent.getParameter("state");
            this.getView().getModel("view").setProperty("/isAdminMode", bIsAdminMode);
            // 관리자 모드 변경 시 모델에 해당 상태를 저장

            if (bIsAdminMode) {
                this._showAdminConfirmationDialog();
                // 관리자 모드로 전환할 때 추가 확인 절차를 구현할 수 있음
            }
        },

        _showAdminConfirmationDialog: function () {
            // 관리자 접근을 확인하는 다이얼로그 구현 (현재는 Placeholder)
        },

        _loadData: function (sFilterQuery) {
            // 데이터를 로드하는 함수. 필터 쿼리를 인자로 받을 수 있음

            const oViewModel = this.getView().getModel("view");
            const iPageSize = oViewModel.getProperty("/pageSize");
            const iCurrentPage = oViewModel.getProperty("/currentPage");
            const iSkip = iCurrentPage * iPageSize;
            // 페이지네이션을 위한 변수들 설정

            let sUrl = `${this.sServiceUrl}?$skip=${iSkip}&$top=${iPageSize}&$expand=request_state`;
            // 기본 URL에 스킵과 페이지 사이즈, 확장을 포함한 URL 생성

            if (sFilterQuery) {
                sUrl += `&$filter=contains(request_product,'${sFilterQuery}') or contains(requestor,'${sFilterQuery}') or contains(request_reason,'${sFilterQuery}') or contains(request_state/request_state_kor,'${sFilterQuery}')`;
                // 필터 쿼리가 있을 경우 필터링된 URL 생성
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
                    if (aData.length > iPageSize) {
                        console.warn(`Received more items than expected. Trimming to ${iPageSize} items.`);
                        aData = aData.slice(0, iPageSize);
                    }
                    // 데이터를 받아서 테이블과 모델에 반영. 페이지 크기를 초과한 경우 데이터를 자름

                    let oModel = this.getView().getModel("request");
                    if (!oModel) {
                        oModel = new JSONModel();
                        this.getView().setModel(oModel, "request");
                    }
                    oModel.setData({ Requests: aData });  
                    console.log("Model Data:", oModel.getData());
                    // 받아온 데이터를 "request" 모델에 설정

                    oViewModel.setProperty("/hasMore", aData.length === iPageSize);
                    oViewModel.setProperty("/currentPage", iCurrentPage);
                    // 다음 페이지 여부와 현재 페이지를 뷰 모델에 설정

                    oModel.refresh(true);  // 강제로 데이터 바인딩을 새로고침

                    const oBinding = oTable.getBinding("items");
                    if (oBinding) {
                        oBinding.refresh();
                    }
                    // 테이블 바인딩을 새로고침
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
                    // 데이터 로드 실패 시 에러 로그 출력 및 사용자에게 메시지 표시
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
                request_reason: "2",
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

                            // 선택된 아이템을 모델에 저장하는 함수
        _selectItem: function (oItem) {
            if (oItem) {  // 아이템이 존재하는지 확인
                const oBindingContext = oItem.getBindingContext("request");  // 아이템의 바인딩 컨텍스트를 가져옴
                if (oBindingContext) {  // 바인딩 컨텍스트가 유효한지 확인
                    const sPath = oBindingContext.getPath();  // 바인딩 컨텍스트의 경로를 가져옴
                    const oModel = this.getView().getModel("request");  // "request" 모델을 가져옴
                    oModel.setProperty("/selectedItem", sPath);  // 모델에 선택된 아이템의 경로를 저장
                    console.log("Selected item path set in model:", sPath);  // 경로가 설정되었음을 로그로 출력

                    // 선택된 항목을 시각적으로 표시
                    oItem.setSelected(true);
                }
            }
        },

        // 리스트 아이템 클릭 시 처리되는 함수
        onPress: function (oEvent) {

            const oItem = oEvent.getSource();  // 이벤트가 발생한 소스를 가져옴

            var bIsAdminMode = this.getView().getModel("view").getProperty("/isAdminMode");  // Admin 모드인지 확인
            var oRouter = this.getOwnerComponent().getRouter();  // 라우터를 가져옴


            if (bIsAdminMode) {  // Admin 모드일 경우
                // 편집 페이지로 이동
                oRouter.navTo("edit", {
                    requestPath: window.encodeURIComponent(oItem.getBindingContext("request").getPath().substr(1))
                });
            } else {
                // 읽기 전용 디테일 페이지로 이동
                oRouter.navTo("detail", {
                    requestPath: window.encodeURIComponent(oItem.getBindingContext("request").getPath().substr(1))
                });
            }

            // 더블 클릭 확인 로직
            if (this._clickTimer) {  // 타이머가 이미 존재하는지 확인
                clearTimeout(this._clickTimer);  // 기존 타이머를 취소
                this._clickTimer = null;  // 타이머 초기화
                this._navigateToDetail(oItem);  // 디테일 페이지로 이동
                bIsAdminMode: bIsAdminMode  // Admin 모드 상태 전달
            } else {
                this._clickTimer = setTimeout(() => {  // 타이머 시작
                    this._clickTimer = null;  // 타이머 초기화
                    this._selectItem(oItem);  // 선택된 아이템 처리
                }, this._clickDelay);  // 딜레이 이후 실행
            }
        },

        // 선택이 변경될 때 처리하는 함수
        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");  // 선택된 리스트 아이템을 가져옴
            if (oSelectedItem) {  // 선택된 아이템이 있는지 확인
                var sPath = oSelectedItem.getBindingContext("request").getPath();  // 선택된 아이템의 경로를 가져옴
                this.getView().getModel("request").setProperty("/selectedItem", sPath);  // 선택된 경로를 모델에 저장
                console.log("선택된 항목 경로가 모델에 설정됨:", sPath);  // 로그로 출력
            }
        },

        // 삭제 함수 (Admin 모드에서만 동작)
        onDelete: function () {
            if (!this.getView().getModel("view").getProperty("/isAdminMode")) {  // Admin 모드가 아닌 경우
                // 권한 없음 처리
                return;
            }
            var oModel = this.getView().getModel("request");  // "request" 모델을 가져옴
            var sSelectedPath = oModel.getProperty("/selectedItem");  // 선택된 아이템의 경로를 가져옴

            if (sSelectedPath) {  // 선택된 경로가 있는지 확인
                var oData = oModel.getProperty(sSelectedPath);  // 선택된 경로의 데이터를 가져옴
                var sRequestNumber = oData.request_number;  // 요청 번호를 가져옴
                console.log("삭제할 요청 번호:", sRequestNumber);  // 삭제할 요청 번호 로그 출력

                // AJAX 호출로 데이터 삭제
                $.ajax({
                    type: 'DELETE',
                    url: `${this.sServiceUrl}/${sRequestNumber}`,  // 삭제할 데이터의 URL 생성
                    success: (result) => {  // 성공 시
                        console.log("삭제 성공", result);  // 성공 로그 출력
                        this._loadData();  // 삭제 후 데이터 새로고침
                        oModel.setProperty("/selectedItem", null);  // 선택 초기화
                        MessageToast.show("항목이 삭제되었습니다.");  // 삭제 완료 메시지 표시
                    },
                    error: (xhr, status, error) => {  // 오류 발생 시
                        console.error("데이터 삭제 실패", error);  // 오류 로그 출력
                        MessageToast.show("삭제 중 오류가 발생했습니다.");  // 오류 메시지 표시
                    }
                });
            } else {
                console.error("삭제할 항목이 선택되지 않았습니다.");  // 선택되지 않았을 경우 오류 로그 출력
                MessageToast.show("삭제할 항목을 선택해주세요.");  // 항목 선택 메시지 표시
            }
        },

        // 정렬 변경 시 처리되는 함수
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
