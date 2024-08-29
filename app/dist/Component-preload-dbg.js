/* global sap */

sap.ui.predefine("imropro.Component-preload", [], function() {
    "use strict";
    
    sap.ui.getCore().loadLibrary("sap.ui.core");
    
    var componentBundle = {
        "imropro/Component": "webapp/Component.js",
        "imropro/Component-preload": "webapp/Component-preload.js",
        "imropro/controller/App": "webapp/controller/App.js",
        "imropro/controller/ProductDetail": "webapp/controller/ProductDetail.controller.js",
        "imropro/controller/View1": "webapp/controller/View1.controller.js",
        "imropro/view/App": "webapp/view/App.view.xml",
        "imropro/view/ProductDetail": "webapp/view/ProductDetail.view.xml",
        "imropro/view/VIEW": "webapp/view/VIEW.view.xml",
        "imropro/manifest": "webapp/manifest.json"
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
