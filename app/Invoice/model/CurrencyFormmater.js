// webapp/model/CurrencyFormatter.js
sap.ui.define([
    "sap/ui/core/format/NumberFormat"
], function (NumberFormat) {
    "use strict";

    return {
        formatCurrency: function (value, currency) {
            const oNumberFormat = NumberFormat.getCurrencyInstance({
                currencyCode: currency
            });
            return oNumberFormat.format(value);
        }
    };
});
