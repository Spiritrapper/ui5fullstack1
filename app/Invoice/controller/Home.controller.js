sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function(Controller, History) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Home", {
        onNavigateToInvoices: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("overview");  // Navigate to the InvoiceList page
        }
    });
});
