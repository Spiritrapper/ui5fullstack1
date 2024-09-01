sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.CreateOrder", {

        // onInit: function () {
        //     this._oModel = new JSONModel();
        //     this.getView().setModel(this._oModel, "detailModel");

        //     // request 모델이 없다면 초기화
        //     if (!this.getView().getModel("request")) {
        //         this.getView().setModel(new sap.ui.model.json.JSONModel(), "request");
        //     }

        //     // component에 넣어서 관리자모드 전역적으로 관리
        //     // 전역 모델 초기화 (만약 아직 초기화되지 않았다면)
        //     // if (!this.getView().getModel("globalModel")) {
        //     //     var oGlobalModel = new JSONModel({
        //     //         isAdminMode: false  // 기본적으로 관리자 모드 비활성화
        //     //     });
        //     //     this.getView().setModel(oGlobalModel, "globalModel");
        //     // }

        //     var oRouter = this.getOwnerComponent().getRouter();
        //     oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
            
           
        // },

        onInit : function () { 
            this.getRouter().getRoute("CreateOrder").attachPatternMatched(this._onObjectMatched, this);
        }, 
        
        _onObjectMatched : function (oEvent) { 
            var sObjectId = oEvent.getParameter("arguments").num;
        },

        // _onObjectMatched: function (oEvent) {
        //     var sRequestNumber = oEvent.getParameter("arguments").requestNumber;
        //     this._loadDetailData(sRequestNumber);
        // },

        _loadDetailData: function (sRequestNumber) {
            var sUrl = "/odata/v4/request/Request(" + sRequestNumber + ")?$expand=request_state";

            $.ajax({
                type: "GET",
                url: sUrl,
                success: (oData) => {
                    this._oModel.setData(oData);
                    // request_state 데이터를 request 모델에 설정
                    var oRequestModel = this.getView().getModel("request");
                    if (!oRequestModel) {
                        oRequestModel = new sap.ui.model.json.JSONModel();
                        this.getView().setModel(oRequestModel, "request");
                    }
                    // 모든 가능한 request_state 값을 하드코딩하여 설정
                    oRequestModel.setProperty("/Request_state", [
                        { request_state_key: "NEW", request_state_kor: "신규" },
                        { request_state_key: "INPROGRESS", request_state_kor: "진행중" },
                        { request_state_key: "COMPLETED", request_state_kor: "완료" },
                        { request_state_key: "REJECTED", request_state_kor: "거절" }
                    ]);

                    // Request_state 데이터 로드
                    this._loadRequestStates();
                },
                error: (oError) => {
                    MessageToast.show("Failed to load request details");
                    console.error("Error loading request details:", oError);
                }
            });
        },

        _loadRequestStates: function () {
            var sUrl = "/odata/v4/request/Request_state";

            $.ajax({
                type: "GET",
                url: sUrl,
                success: (oData) => {
                    console.log("Loaded Request_state data:", oData);
                    var oRequestModel = this.getView().getModel("request");
                    if (!oRequestModel) {
                        oRequestModel = new sap.ui.model.json.JSONModel();
                        this.getView().setModel(oRequestModel, "request");
                    }
                    oRequestModel.setProperty("/Request_state", oData.value);
                },
                error: (oError) => {
                    console.error("Error loading Request_state data:", oError);
                }
            });
        },

        onSave: function () {
            


            var oData = this._oModel.getData();
            var sUrl = "/odata/v4/request/Request(" + oData.request_number + ")";

            // 필요한 필드만 포함하는 새로운 객체 생성
            var oUpdateData = {
                request_product: oData.request_product,
                request_quantity: parseInt(oData.request_quantity, 10),
                requestor: oData.requestor,
                request_date: oData.request_date,
                request_state_request_state_key: oData.request_state.request_state_key,
                request_reason: oData.request_reason,
                request_estimated_price: oData.request_estimated_price,
                request_reject_reason: oData.request_reject_reason
            };

            $.ajax({
                url: sUrl,
                method: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(oUpdateData),
                headers: {
                    "Accept": "application/json"
                },
                success: () => {
                    MessageToast.show("Request updated successfully");
                    this.onCancel();
                },
                error: (oError) => {
                    MessageToast.show("Failed to update request");
                    console.error("Error updating request:", oError);
                    // 더 자세한 오류 정보 출력
                    if (oError.responseText) {
                        console.error("Server response:", oError.responseText);
                    }
                }
            });
        },

        onCancel: function () {
            this.getOwnerComponent().getRouter().navTo("overview", {}, true);
        }
    });
});