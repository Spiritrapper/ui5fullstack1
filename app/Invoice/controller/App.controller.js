sap.ui.define([
    "sap/ui/core/mvc/Controller",
    // "sap/m/MessageToast"
    // "sap/ui/model/json/JSONModel",
    // "sap/ui/model/resource/ResourceModel"
], (Controller) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.App", {

        onInit() {
            console.log("App.controller")
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
        // onInit() {
        //     // set data model on view
        //     const oData = {
        //         recipient : {
        //             name : "World"
        //         }
        //     };
        //     const oModel = new JSONModel(oData);
        //     this.getView().setModel(oModel);

        //     // set i18n model on view
        //     const i18nModel  = new ResourceModel({
        //         bundleName:"ui5.walkthrough.i18n.i18n"
        //     });
        //     this.getView().setModel(i18nModel, "i18n");
        // },
    
        // onShowHello() {
        //     // i18n 모델에서 메시지 읽기
        //     const oBundle = this.getView().getModel("i18n").getResourceBundle();
        //     const sRecipient = this.getview().getModel().getProperty("/recipient/name");
        //     const sMsg = oBundle.getText("helloMsg", [sRecipient]);
            
        //     // 메시지 표시
        //     MessageToast.show(sMsg);
        // }
    });
    
});

