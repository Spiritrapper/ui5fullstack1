sap.ui.getCore().attachInit(function () {
    sap.ui.require([
        "sap/ui/core/ComponentContainer"
    ], function (ComponentContainer) {
        new ComponentContainer({
            name: "imropro",
            settings: {
                id: "app"
            },
            async: true
        }).placeAt("content");
    });
});
