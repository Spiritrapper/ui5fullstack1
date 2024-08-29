sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment"
], function (Controller, UIComponent, Fragment) {
    "use strict";

    return Controller.extend("imropro.controller.App", {
        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.initialize();
        }
    });
});
