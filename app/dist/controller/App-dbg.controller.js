sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, UIComponent, JSONModel) {
    "use strict";

    return Controller.extend("odatacrud.controller.App", {
        
        onInit: function() {
            // 앱 전체에 대한 모델을 생성합니다.
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                layout: "OneColumn",
                previousLayout: "",
                actionButtonsInfo: {
                    midColumn: {
                        fullScreen: false
                    }
                }
            });

            // 모델을 설정합니다.
            this.getView().setModel(oViewModel, "appView");

            // 라우터에 대한 참조를 가져오고, 라우트 매치 이벤트를 구독합니다.
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function(oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oArguments = oEvent.getParameter("arguments");

            // 라우트 매치 시 로직을 여기에 추가
            // 예: 특정 뷰를 보여주거나 레이아웃을 변경
        },

        onStateChanged: function(oEvent) {
            var bIsFullScreen = oEvent.getParameter("isFullScreen");
            var bIsThreeColumnLayout = oEvent.getParameter("layout") === "ThreeColumnsEndExpanded";

            this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", bIsFullScreen);
        },

        onExit: function() {
            // 컨트롤러가 파기될 때 처리할 로직을 여기에 추가
        }
    });
});
