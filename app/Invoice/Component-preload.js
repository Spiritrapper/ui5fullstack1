/* global sap */

sap.ui.predefine("ui5.walkthrough.Component-preload", [], function() {
    "use strict";
    
    sap.ui.getCore().loadLibrary("sap.ui.core");
    
    var componentBundle = {
        "Component.js": "/app/Invoice/Component.js",
        "controller/InvoiceList.controller.js": "/app/Invoice/controller/InvoiceList.controller.js",
        "controller/App.controller.js": "/app/Invoice/controller/App.controller.js",
        "view/App.view.xml": "/app/Invoice/view/App.view.xml",
        "view/Detail.view.xml": "/app/Invoice/view/Detail.view.xml",
        "view/InvoiceList.view.xml": "/app/Invoice/view/InvoiceList.view.xml",
        "manifest.json": "/app/Invoice/manifest.json"
    };
    
    // Function to load the resources from the component bundle
    function loadResource(path) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error("Failed to load " + path));
                    }
                }
            };
            xhr.send();
        });
    }
    
    // Preload all the resources
    function preloadResources() {
        var promises = [];
        
        for (var key in componentBundle) {
            if (componentBundle.hasOwnProperty(key)) {
                promises.push(loadResource(componentBundle[key]));
            }
        }
        
        return Promise.all(promises).then(function(responses) {
            var preloadContent = {};
            
            Object.keys(componentBundle).forEach(function(key, index) {
                preloadContent[key] = responses[index];
            });
            
            // Create and register the Component-preload file
            sap.ui.require.preload(preloadContent);
        });
    }
    
    // Start preloading resources
    preloadResources();
});
