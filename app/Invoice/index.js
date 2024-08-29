sap.ui.define([
	// "sap/ui/core/mvc/Controller",
	"sap/ui/core/ComponentContainer"

], (ComponentContainer) => {
	"use strict";

	// XMLView.create({
	// 	viewName: "ui5.walkthrough.view.App"
	// }).then((oView) => oView.placeAt("content"));
	new ComponentContainer({
			name: "ui5.walkthrough",
			settings : {
				id : "walkthrough"
			},
			async: true
	}).placeAt("content")


});