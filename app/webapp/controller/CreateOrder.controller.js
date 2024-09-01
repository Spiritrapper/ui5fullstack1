sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.CreateOrder", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sReqNum = oEvent.getParameter("arguments").ReqNum;
            if (sReqNum === "new") {
                // 새로운 요청 생성 로직
                this._initNewRequest();
            } else {
                // 기존 요청 수정 로직
                this._loadRequest(sReqNum);
            }
        },

        _initNewRequest: function () {
            // 새로운 요청을 위한 빈 모델 초기화
            var oModel = new JSONModel({
                ReqNum: "",
                ReqGood: "",
                ReqQty: "",
                Requester: "",
                ReqDate: new Date(),
                ReqStatus: "B"  // 처리 대기 상태로 초기화
            });
            this.getView().setModel(oModel, "request");
        },

        _loadRequest: function (sReqNum) {
            // 기존 요청 데이터 로드 로직
            // 여기에서 백엔드 호출 또는 로컬 데이터 조회 로직 구현
        },

        onBack: function(){ this.getOwnerComponent().getRouter().navTo("overview");
        },


    });
});