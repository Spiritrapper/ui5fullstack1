sap.ui.define([
    "sap/ui/core/UIComponent", 
    "sap/ui/model/json/JSONModel",
     "sap/ui/Device", 
     "sap/ui/model/resource/ResourceModel"
    ], (e, t, i, o) => { 
        "use strict"; 
        return e.extend("imropro.Component", { 
            metadata: { manifest: "json" }, 
            init() { e.prototype.init.apply(this, arguments); 
                const n = { recipient: { name: "World" } }; 
                const s = new t(n); 
                this.setModel(s); 
                const a = new t(i); 
                a.setDefaultBindingMode("OneWay"); 
                this.setModel(a, "device"); 
                const p = new o({ bundleName: "imropro.i18n.i18n" }); 
                this.setModel(p, "i18n"); 
                this.getRouter().initialize() }, getContentDensityClass() { 
                    return i.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact" } }) });
//# sourceMappingURL=Component.js.map