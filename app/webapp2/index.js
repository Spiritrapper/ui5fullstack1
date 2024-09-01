sap.ui.define([
	// "sap/ui/core/mvc/Controller",
	"sap/ui/core/ComponentContainer",
	"sap/m/Text"
], (ComponentContainer,Text) => {
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

	new Text({
		text:"hello ui5"
	}).placeAt("content")
});