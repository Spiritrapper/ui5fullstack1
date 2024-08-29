sap.ui.define([], () => {
	"use strict";

	return {
		statusText(sStatus) {
			const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "A":
					return oResourceBundle.getText("invoiceStatusA");
				case "B":
					return oResourceBundle.getText("invoiceStatusB");
				case "C":
					return oResourceBundle.getText("invoiceStatusC");
				case "D":
					return oResourceBundle.getText("invoiceStatusD");
				case "E":
					return oResourceBundle.getText("invoiceStatusE");
				case "F":
					return oResourceBundle.getText("invoiceStatusF");
				default:
					return sStatus;
			}
		},
		
        getRowIndex: function (oContext) {
            return oContext.getPath().split("/").pop();
        }
	};
});