/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/fetch","./_utils"],function(e,t){"use strict";function n(e){return Array.isArray(e)?e:[e]}function i(e){return new Promise(function(t,i){sap.ui.require(n(e),function(){t(Array.prototype.slice.call(arguments))},i)})}function r(e,t,n){if(t){for(var i in t){if(Object.hasOwn(n,i)){e[i]=t[i]}}}return e}function o(){function e(e){if(document.body.querySelector("#"+e)==null){var t=document.createElement("div");t.id=e;document.body.insertBefore(t,document.body.firstChild)}}return t.whenDOMReady().then(function(){e("qunit");e("qunit-fixture")})}function u(e){var t=e.sourceFile+":"+e.lineNumber+":"+e.columnNumber,n="Security policy violation: directive '"+e.violatedDirective+"'";if(e.blockedURI){n+=" violated by '"+String(e.blockedURI).slice(0,20)+"'"}if(QUnit.config.current){QUnit.pushFailure(n,t)}else{throw new Error(n+" at "+t)}}var a={altertitle:1,collapse:1,filter:1,fixture:1,hidepassed:1,maxDepth:1,module:1,moduleId:1,notrycatch:1,noglobals:1,seed:1,reorder:1,requireExpects:1,testId:1,testTimeout:1,scrolltop:1};function s(e,t){var n=e.versions;var i=e.version||null;while(typeof i!=="object"){if(!Object.hasOwn(n,i)){throw new TypeError("unsupported "+t+" version "+e.version)}i=n[i]}return i}function c(n){var c,l,f,d,p,h,v,g;document.title=n.title;if(n.loader){sap.ui.loader.config(n.loader)}if(n.runAfterLoader){c=i(n.runAfterLoader)}else{c=Promise.resolve()}g=s(n.qunit,"qunit");if(g!=null){window.QUnit=window.QUnit||{};QUnit.config=QUnit.config||{};if(n.qunit!=null&&typeof n.qunit==="object"){r(QUnit.config,n.qunit,a)}QUnit.config.autostart=false;l=c.then(function(){return i("sap/ui/test/qunitPause")}).then(function(){t.addStylesheet(g.css);return i(g.module)}).then(function(){return i("sap/ui/qunit/qunit-junit")})}var m=s(n.sinon,"sinon");if(m!=null){f=c.then(function(){return i(m.module)});if(n.sinon.qunitBridge&&l){d=Promise.all([l,f]).then(function(){return i(m.bridge)})}if(n.sinon!=null&&typeof n.sinon==="object"){p=Promise.all([f,d]).then(function(){sinon.config=r(sinon.config||{},n.sinon,sinon.defaultConfig);return arguments})}}else if(g!=null){sap.ui.loader.config({shim:{"sap/ui/thirdparty/sinon-qunit":{deps:[g.module,"sap/ui/thirdparty/sinon"]},"sap/ui/qunit/sinon-qunit-bridge":{deps:[g.module,"sap/ui/thirdparty/sinon-4"]}}})}h=l.then(function(){if(QUnit.urlParams.coverage===undefined){return{}}if(n.coverage.instrumenter==="blanket"){return{instrumenter:"blanket"}}return e("/.ui5/coverage/ping").then(function(e){if(e.status>=400&&n.coverage.instrumenter!=="istanbul"){return{instrumenter:"blanket"}}else if(e.status>=400){return{instrumenter:null,error:"Istanbul is set as instrumenter, but there's no middleware"}}else{return{instrumenter:"istanbul"}}})}).then(function(e){if(!e.instrumenter){return e}if((QUnit.urlParams["coverage-mode"]||e.instrumenter==="blanket")&&QUnit.urlParams["coverage-mode"]!==e.instrumenter){var t=new URL(window.location.href);t.searchParams.set("coverage","true");t.searchParams.set("coverage-mode",e.instrumenter);window.location=t.toString()}return e}).then(function(e){if(e.instrumenter==="blanket"){return i("sap/ui/thirdparty/blanket").then(function(){if(n.coverage&&window.blanket){if(n.coverage.only!=null){window.blanket.options("sap-ui-cover-only",n.coverage.only)}if(n.coverage.never!=null){window.blanket.options("sap-ui-cover-never",n.coverage.never)}if(n.coverage.branchTracking){window.blanket.options("branchTracking",true)}}return i("sap/ui/qunit/qunit-coverage")}).then(function(){QUnit.config.autostart=false})}else if(e.instrumenter==="istanbul"){return i("sap/ui/qunit/qunit-coverage-istanbul").then(function(){var e=function(e){return Array.isArray(e)?JSON.stringify(e):e};var t=function(e){var n=[];for(var[i,r]of Object.entries(e)){if(Object.prototype.toString.call(r)==="[object Object]"){var o=t(r);n=n.concat(o.map(function(e){return[i].concat(e)}))}else{n.push([i,r])}}return n};if(n.coverage){var i=document.querySelector('script[src$="qunit/qunit-coverage-istanbul.js"]');if(i&&n.coverage!=null){var r=t(n.coverage);r.forEach(function(t){var n=t.pop();if(n!==null){i.setAttribute("data-sap-ui-cover-"+t.join("-"),e(n))}})}}})}else if(e.instrumenter===null&&e.error){QUnit.test("There's an error with the instrumentation setup or configuration",function(t){t.ok(false,e.error)})}}).then(function(){var e=QUnit.config.urlConfig.some(function(e){return e.id==="coverage"});if(!e){QUnit.config.urlConfig.push({id:"coverage",label:"Enable coverage",tooltip:"Enable code coverage."})}});h=h.then(function(){if(QUnit.urlParams["sap-ui-xx-csp-policy"]){document.addEventListener("securitypolicyviolation",u);QUnit.done(function(){document.removeEventListener("securitypolicyviolation",u)})}QUnit.config.urlConfig.push({id:"sap-ui-xx-csp-policy",label:"CSP",value:{"sap-target-level-1:report-only":"Level 1","sap-target-level-2:report-only":"Level 2"},tooltip:"What Content-Security-Policy should the server send"});if(QUnit.urlParams["rtf"]||QUnit.urlParams["repeat-to-failure"]){QUnit.done(function(e){if(e.failed===0){setTimeout(function(){location.reload()},100)}})}QUnit.config.urlConfig.push({id:"repeat-to-failure",label:"Repeat",value:false,tooltip:"Whether this test should auto-repeat until it fails"})});v=Promise.all([c,l,f,d,p,h]);if(n.beforeBootstrap){v=v.then(function(){return i(n.beforeBootstrap)})}window["sap-ui-config"]=n.ui5||{};if(Array.isArray(window["sap-ui-config"].libs)){window["sap-ui-config"].libs=window["sap-ui-config"].libs.join(",")}window["sap-ui-test-config"]=n.testConfig||{};if(n.bootCore){v=v.then(function(){return new Promise(function(e,t){sap.ui.require(["sap/ui/core/Core"],function(t){t.boot?.();t.ready(e)},t)})})}return v.then(function(){if(n.autostart){return i(n.module).then(function(e){return Promise.all(e)}).then(function(){return o()}).then(function(){if(n.ui5["xx-waitfortheme"]==="init"){return new Promise(function(e,t){sap.ui.require(["sap/ui/qunit/utils/waitForThemeApplied"],e,t)}).then(function(e){return e()})}}).then(function(){QUnit.start()})}else{return o().then(function(){return i(n.module).then(function(e){return Promise.all(e)})})}})}t.registerResourceRoots();var l=new URLSearchParams(window.location.search),f=t.getAttribute("data-sap-ui-testsuite")||l.get("testsuite"),d=t.getAttribute("data-sap-ui-test")||l.get("test");t.getSuiteConfig(f).then(function(e){var t=e.tests[d];if(!t){throw new TypeError("Invalid test name")}return c(t)}).catch(function(e){console.error(e.stack||e);if(typeof QUnit!=="undefined"){QUnit.test("Test Starter",function(){throw e});QUnit.start()}else{t.whenDOMReady().then(function(){document.body.style.color="red";document.body.innerHTML="<pre>"+t.encode(e.stack||e.message||String(e))+"</pre>"})}})});
//# sourceMappingURL=_setupAndStart.js.map