sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, formatter, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.RequestList", {
        formatter: formatter,

        onInit: function() {
            this.sServiceUrl = "/odata/v4/request/Request";
            this._oViewModel = new JSONModel({
          
            });
            this.getView().setModel(this._oViewModel, "viewModel");
            
            this.oModel = new JSONModel({});
            this.getView().setModel(this.oModel, "request");
            this._loadData();
            this._clickTimer = null;          // 클릭 타이머 초기화
            this._clickDelay = 300;           // 더블클릭 지연 시간 설정
        },

        _loadData: function() {
           

            $.ajax({
                type: "GET",
                url: this.sServiceUrl,
                async: true,
                success: (oData) => {
                    console.log("Received Data:", oData);
                    
                    
                    this.oModel.setData({Request: oData.value});
                    this.getView().setModel(this.oModel, "request");
             
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error loading data:", textStatus, errorThrown);
                    MessageToast.show("Error loading data: " + textStatus);
                
                }
            });
        },

        // onListItemPress:function(oEvent){

        //     // var oItem = oEvent.getSource();
        //     // console.log("Pressed item:", oItem);

        //     if (oItem) {  // 아이템이 존재하는지 확인
        //         const oBindingContext = oItem.getBindingContext("request");  // 아이템의 바인딩 컨텍스트를 가져옴
        //         if (oBindingContext) {  // 바인딩 컨텍스트가 유효한지 확인
        //             const sPath = oBindingContext.getPath();  // 바인딩 컨텍스트의 경로를 가져옴
        //             console.log("선택경로",sPath);
        //             const oModel = this.getView().getModel("request");  // "request" 모델을 가져옴
        //             oModel.setProperty("/selectedItem", sPath);  // 모델에 선택된 아이템의 경로를 저장
        //             console.log("Selected item path set in model:", sPath);  // 경로가 설정되었음을 로그로 출력

        //             // 선택된 항목을 시각적으로 표시
        //             oItem.setSelected(true);
        //         }
        //     }
        // },

        // onPress:function(oEvent) {
        //     var oItem = oEvent.getSource();

        //     // 더블 클릭 확인 로직
        //     if (this._clickTimer) {  // 타이머가 이미 존재하는지 확인
        //         clearTimeout(this._clickTimer);  // 기존 타이머를 취소
        //         this._clickTimer = null;  // 타이머 초기화
        //         this._navigateToDetail(oItem);  // 디테일 페이지로 이동
        //         // bIsAdminMode: bIsAdminMode  // Admin 모드 상태 전달
        //     } else {
        //         this._clickTimer = setTimeout(() => {  // 타이머 시작
        //             this._clickTimer = null;  // 타이머 초기화
        //             this._selectItem(oItem);  // 선택된 아이템 처리
        //         }, this._clickDelay);  // 딜레이 이후 실행
        //     }

        // },


        _navigateToDetail: function (oItem) {
            const oBindingContext = oItem.getBindingContext("request");
            console.log("oItem.getBindingContext _navigateToDetail내",oBindingContext);
            const oData = oBindingContext.getObject();
            console.log("oBindingContext.getObject를 oData로",oData);
              

            this.getOwnerComponent().getRouter().navTo("detail", {
            requestNumber: oData.request_number.toString()
            });
        },


        onListItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            console.log("선택아이템",oItem);
            var sPath = oItem.getBindingContext("request").getPath();
            console.log("선택경로",sPath);
            this._oViewModel.setProperty("/selectedItemPath", sPath);
            console.log("Selected item path:", sPath);

            // 더블 클릭 확인 로직
            if (this._clickTimer) {  // 타이머가 이미 존재하는지 확인
                clearTimeout(this._clickTimer);  // 기존 타이머를 취소
                this._clickTimer = null;  // 타이머 초기화
                this._navigateToDetail(oItem);  // 디테일 페이지로 이동
                // bIsAdminMode: bIsAdminMode  // Admin 모드 상태 전달
            } else {
                this._clickTimer = setTimeout(() => {  // 타이머 시작
                    this._clickTimer = null;  // 타이머 초기화
                    this._oViewModel.setProperty("/selectedItemPath", sPath);  // 선택된 아이템 처리
                }, this._clickDelay);  // 딜레이 이후 실행
            }
        },

        onDelete: function(oEvent) {
            
            var sSelectedPath = this._oViewModel.getProperty("/selectedItemPath");
            console.log("Selected item path2:", sSelectedPath);
            // var oItem = oEvent.getParameter("");
            // var oItem = oEvent.getSource();
            

            // var sPath = oItem.getBindingContext("request").getPath();
            // // var sRequestId = this.getView().getModel("request").getProperty(sPath + "/ID");
            // console.log("경로", sPath);
            var sRequestId = this.oModel.getProperty(sSelectedPath + "/request_product");  // 'request' 모델에서 ID 속성 가져오기
            console.log("id",sRequestId);

            let sUrl = `${this.sServiceUrl}(${sRequestId})`;

            $.ajax({
                type: "DELETE",
                url: sUrl,
                success: () => {
                    MessageToast.show("Request deleted successfully");
                    this._loadData(); // 데이터 새로고침
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("Error deleting data:", textStatus, errorThrown);
                    MessageToast.show("Error deleting data: " + textStatus);
                }
            });


           
            // sRequestId가 제대로 정의되어 있는지 확인
            // if (sRequestId) {
            //     sap.m.MessageBox.confirm("Are you sure you want to delete this request?", {
            //         title: "Confirm Deletion",
            //         onClose: function(oAction) {
            //             if (oAction === sap.m.MessageBox.Action.OK) {
            //                 this._deleteRequest(sRequestId);
            //             }
            //         }.bind(this)
            //     });
            // } else {
            //     MessageToast.show("Could not determine the request ID.");
            // }
        // },

        // _deleteRequest: function(sRequestId) {
        //     let sUrl = `${this.sServiceUrl}(${sRequestId})`;

        //     $.ajax({
        //         type: "DELETE",
        //         url: sUrl,
        //         success: () => {
        //             MessageToast.show("Request deleted successfully");
        //             this._loadData(); // 데이터 새로고침
        //         },
        //         error: (jqXHR, textStatus, errorThrown) => {
        //             console.error("Error deleting data:", textStatus, errorThrown);
        //             MessageToast.show("Error deleting data: " + textStatus);
        //         }
        //     });
        },

        onRefresh: function() {
            this._loadData();
        }
    });
});