const{odata:odata}=require("@sap/cds");sap.ui.define(["sap/ui/core/mvc.Controller"],function(o){"use strict";return o.extend("odatacrud.controller.View1",{onInit:function(){this.onReadAll()},onReadAll:function(){var o=this;var e=this.getOwnerComponent().getModel();e.read("/Products",{success:function(e){console.log(e);var n=new sap.ui.model.json.JSONModel(e);o.getView().byId("idProducts").setModel(n)},error:function(o){console.log(o)}})},onReadFilters:function(){var o}})});
//# sourceMappingURL=View2.controller.js.map