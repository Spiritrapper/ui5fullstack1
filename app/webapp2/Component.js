sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/Device",
   "sap/ui/core/routing/Router" 
], (UIComponent, JSONModel, Device, Router) => {
   "use strict";

   return UIComponent.extend("ui5.walkthrough.Component", {
      metadata : {
         interfaces: ["sap.ui.core.IAsyncContentCreation"],
         manifest: "json"
      },

      init() {
         UIComponent.prototype.init.apply(this, arguments);
          
      //    // set data model on view
      //    const oData = {
      //       recipient : {
      //          name : "World"
      //       }
      //    };
      //    const oModel = new JSONModel(oData);
      //    this.setModel(oModel);

      //    // set device model
      //    const oDeviceModel = new JSONModel(Device);
      //    oDeviceModel.setDefaultBindingMode("OneWay");
      //    this.setModel(oDeviceModel, "device");

      //    var oGlobalModel = new JSONModel({
      //      isAdminMode: true  // 테스트를 위해 true로 설정
      //    });
      //  this.setModel(oGlobalModel, "global");

         //create the views based on the url/hash
         this.getRouter().initialize();
       },
      getContentDensityClass() {
        return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
      }
   });
});