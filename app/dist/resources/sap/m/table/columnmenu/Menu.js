/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/ResponsivePopover","sap/m/Button","sap/m/Toolbar","sap/m/ToolbarSpacer","sap/m/library","sap/ui/Device","sap/ui/core/Control","sap/ui/core/Element","sap/ui/core/Lib","sap/ui/core/library","sap/ui/core/StaticArea","sap/ui/thirdparty/jquery","sap/ui/dom/containsOrEquals","sap/ui/events/ControlEvents","sap/base/strings/capitalize","sap/m/p13n/AbstractContainerItem","sap/m/p13n/Container","sap/m/table/columnmenu/MenuBase","sap/m/table/columnmenu/MenuRenderer","sap/ui/layout/form/Form","sap/ui/layout/GridData","sap/ui/layout/form/ResponsiveGridLayout","sap/ui/layout/form/FormContainer","sap/ui/layout/form/FormElement","sap/m/Label"],function(t,e,i,n,o,s,r,a,u,l,c,jQuery,h,p,f,d,m,g,_,v,y,C,I,A,b){"use strict";var E=l.aria.HasPopup;var B=l.VerticalAlign;var w=o.table.columnmenu.Category;var k=g.extend("sap.m.table.columnmenu.Menu",{metadata:{library:"sap.m",defaultAggregation:"quickActions",aggregations:{quickActions:{type:"sap.m.table.columnmenu.QuickActionBase"},items:{type:"sap.m.table.columnmenu.ItemBase"},_quickActions:{type:"sap.m.table.columnmenu.QuickActionBase",visibility:"hidden"},_items:{type:"sap.m.table.columnmenu.ItemBase",visibility:"hidden"}},events:{}},renderer:_});var L="$default";var P=E.Dialog;k.prototype.init=function(){this.fAnyEventHandlerProxy=jQuery.proxy(function(t){if(!this.isOpen()||!this.getDomRef()||t.type!="mousedown"&&t.type!="touchstart"){return}this.handleOuterEvent(this.getId(),t)},this)};k.prototype.openBy=function(t,e){if(this.isOpen()&&t===this._oIsOpenBy){return}var i=true;var n=t;if(!(t instanceof a)){n=a.closestTo(t,true)}if(!e){i=this.fireBeforeOpen({openBy:n})}if(!i){return}this._initPopover();if(this._oQuickActionContainer){this._oQuickActionContainer.destroy();this._oQuickActionContainer=null}this._initQuickActionContainer();if(this._oItemsContainer){this._oItemsContainer.destroy();this._oItemsContainer=null}this._initItemsContainer();if(!this.getParent()){c.getUIArea().addContent(this,true)}this._oPopover.openBy(t);this._oIsOpenBy=t;p.bindAnyEvent(this.fAnyEventHandlerProxy)};k.prototype.getAriaHasPopupType=function(){return P};k.prototype.isOpen=function(){return this._oPopover?this._oPopover.isOpen():false};k.prototype.close=function(){this._previousView=null;if(this._oPopover&&this._oPopover.isOpen()){if(this._oQuickActionContainer){this._oQuickActionContainer.destroyFormContainers()}if(this._oItemsContainer){this._oItemsContainer.destroy();this._oItemsContainer=null}c.getUIArea().removeContent(this,true);this._oPopover.close();p.unbindAnyEvent(this.fAnyEventHandlerProxy)}};k.prototype._onPopoverAfterClose=function(){this.fireAfterClose()};k.prototype.exit=function(){g.prototype.exit.apply(this,arguments);if(this._oPopover){delete this._oPopover}if(this._oQuickActionContainer){delete this._oQuickActionContainer}if(this._oItemsContainer){delete this._oItemsContainer}if(this._oIsOpenBy){delete this._oIsOpenBy}p.unbindAnyEvent(this.fAnyEventHandlerProxy)};k.prototype._initPopover=function(){if(this._oPopover){return}this._oPopover=new t({title:this._getResourceText("table.COLUMNMENU_TITLE"),ariaLabelledBy:this.getId()+"-menuDescription",showArrow:false,showHeader:s.system.phone,placement:o.PlacementType.VerticalPreferredBottom,content:new Q({control:this,height:true}),horizontalScrolling:false,verticalScrolling:true,afterClose:[this._onPopoverAfterClose,this]});this.addDependent(this._oPopover);this._oPopover.addStyleClass("sapMTCMenuPopup");this._oPopover.addEventDelegate({onAfterRendering:this._focusItem},this);this._oPopover.addEventDelegate({onsapfocusleave:this.handleFocusLeave},this);this._oPopover._oControl.oPopup.setAutoClose(false)};k.prototype.handleFocusLeave=function(t){if(!this.isOpen()){return}if(t.relatedControlId&&(!h(this.getDomRef(),jQuery(document.getElementById(t.relatedControlId)).get(0))&&!S(this,a.getElementById(t.relatedControlId)))){this.close()}};k.prototype.handleOuterEvent=function(t,e){var i=s.support.touch||s.system.combi;if(i&&(e.isMarked("delayedMouseEvent")||e.isMarked("cancelAutoClose"))){return}if(e.type=="mousedown"||e.type=="touchstart"){if(!h(this.getDomRef(),e.target)&&!h(c.getDomRef(),e.target)&&!S(this,a.closestTo(e.target))){this.close()}}};function S(t,e){if(!t||!e){return false}var i=e.getParent();if(!i){return false}else if(i===t){return true}return S(t,i)}k.prototype._initItemsContainer=function(){var t=this._getAllEffectiveItems();var e=this._hasQuickActions();var i=this._hasItems();if(!this._oItemsContainer){this._createItemsContainer()}t.forEach(function(t,n){this._addView(t);if(e&&i&&n===0){this._oItemsContainer.addSeparator()}}.bind(this))};var Q=r.extend("sap.m.table.columnmenu.AssociativeControl",{metadata:{final:true,properties:{height:{type:"boolean",defaultValue:false}},associations:{control:{type:"sap.ui.core.Control"}}},renderer:{apiVersion:2,render:function(t,e){t.openStart("div",e);e.getHeight()&&t.style("height","100%");t.openEnd();t.renderControl(a.getElementById(e.getControl()));t.close("div")}}});k.prototype._addView=function(t){var e=new d({content:new Q({control:t.getContent(),height:true}),key:t.getId(),text:t.getLabel(),icon:t.getIcon()});this._oItemsContainer.addView(e);this._setItemVisibility(t,t.getVisible());t.getScrollDelegate=function(){return e.getParent().getLayout().getScrollDelegate()}};k.prototype._createItemsContainer=function(){this._oBtnCancel=new e({text:this._getResourceText("table.COLUMNMENU_CANCEL"),press:[function(){var t=this._oItemsContainer.getCurrentViewKey();if(this._fireEvent(a.getElementById(t),"cancel")){this.close()}},this]});this._oBtnOk=new e({text:this._getResourceText("table.COLUMNMENU_CONFIRM"),type:o.ButtonType.Emphasized,press:[function(){var t=this._oItemsContainer.getCurrentViewKey();if(this._fireEvent(a.getElementById(t),"confirm")){this.close()}},this]});this._oItemsContainer=new m({listLayout:true,defaultView:L,footer:new i({content:[new n,this._oBtnOk,this._oBtnCancel]}),beforeViewSwitch:[function(t){var e=t.getParameters();this.invalidate();if(e.target!=="$default"){var i=this._oItemsContainer.getView(e.target);var n=this._getItemFromContainerItem(i);if(n&&!this._fireEvent(n,"press")){t.preventDefault()}}},this],afterViewSwitch:[function(t){var e=this.getDependents();if(e){e.forEach(function(t){if(t&&t.isA("sap.ui.core.Control")){t.invalidate()}})}var i=t.getParameters();this._oItemsContainer.getLayout().setShowFooter(i.target!=="$default");this._previousView=i.source;if(i.target!=="$default"){var n=this._oItemsContainer.getView(i.target);if(n){var o=this._getItemFromContainerItem(n);this._updateButtonState(o);this._focusItem()}}else{this._focusItem()}},this]});this._oItemsContainer.getHeader().addContentRight(new e({text:this._getResourceText("table.COLUMNMENU_RESET"),press:[function(){this._fireEvent(a.getElementById(this._oItemsContainer.getCurrentViewKey()),"reset",false)},this]}));this._oItemsContainer?._getNavigationList().addAriaLabelledBy(this.getId()+"-itemContainerDescription");this._oPopover.addDependent(this._oItemsContainer);this.addDependent(this._oItemsContainer)};k.prototype._fireEvent=function(t,e,i){var n=t["on"+f(e)];if(i!==false){var o=jQuery.Event(e);n.call(t,o);return!o.isDefaultPrevented()}else{n.call(t);return true}};k.prototype._getResourceText=function(t,e){this.oResourceBundle=this.oResourceBundle?this.oResourceBundle:u.getResourceBundleFor("sap.m");return t?this.oResourceBundle.getText(t,e):this.oResourceBundle};var V={};V[w.Sort]=0;V[w.Filter]=1;V[w.Group]=2;V[w.Aggregate]=3;V[w.Generic]=4;k.prototype._getAllEffectiveQuickActions=function(t){var e=(this.getAggregation("_quickActions")||[]).concat(this.getQuickActions());e=e.reduce(function(t,e){return t.concat(e?e.getEffectiveQuickActions():[])},[]);if(!t){e.sort(function(t,e){return V[t.getCategory()]-V[e.getCategory()]})}return e};k.prototype._hasQuickActions=function(){return this._getAllEffectiveQuickActions(true).length>0};k.prototype._getAllEffectiveItems=function(){var t=(this.getAggregation("_items")||[]).concat(this.getItems());return t.reduce(function(t,e){return t.concat(e.getEffectiveItems())},[]).filter(function(t){return t.getVisible()})};k.prototype._hasItems=function(){return this._getAllEffectiveItems().length>0};k.prototype._getItemFromContainerItem=function(t){return this._getAllEffectiveItems().find(function(e){return e.getId()===t.getKey()})};k.prototype._updateButtonState=function(t){if(!this._oItemsContainer){return}if(this._oItemsContainer.getCurrentViewKey()===L){return}this._oItemsContainer.getHeader().getContentRight()[0].setVisible(t.getButtonSettings()["reset"]["visible"]);this._oItemsContainer.getHeader().getContentRight()[0].setEnabled(t.getButtonSettings()["reset"]["enabled"]);this._oBtnOk.setVisible(t.getButtonSettings()["confirm"]["visible"]);this._oBtnCancel.setVisible(t.getButtonSettings()["cancel"]["visible"])};k.prototype._focusItem=function(){if(this._previousView==L){this._oItemsContainer._getNavBackBtn().focus()}else{var t=this._oItemsContainer?._getNavigationList().getItems().find(function(t){return t.getVisible()&&t._key===this._previousView}.bind(this));t&&t.focus()}};k.prototype._setItemVisibility=function(t,e){if(!this._oItemsContainer){return}var i=this._oItemsContainer?._getNavigationList().getItems();var n=i.find(function(e){return e._key==t.getId()});n?.setVisible(e)};k.prototype._initQuickActionContainer=function(){var t=new I;if(!this._oQuickActionContainer){this._oQuickActionContainer=new v({layout:new C({breakpointM:600,labelSpanXL:4,labelSpanL:4,labelSpanM:4,labelSpanS:12,columnsL:1,columnsM:1,adjustLabelSpan:false}),editable:true});this._oQuickActionContainer.addStyleClass("sapMTCMenuQAForm");this._oQuickActionContainer.addAriaLabelledBy(this.getId()+"-actionContainerDescription");this._oQuickActionContainer.addEventDelegate({onAfterRendering:function(){this.getDomRef().classList.remove("sapUiFormLblColon")}},this._oQuickActionContainer)}else{this._oQuickActionContainer.destroyFormContainers()}this._oQuickActionContainer.addFormContainer(t);this._getAllEffectiveQuickActions().forEach(function(e){if(!e.getVisible()){return}var i=new y({span:"XL4 L4 M4 S12"});var n=e.getLabel();var o=new b({text:n,layoutData:i,vAlign:B.Middle,wrapping:true,width:"100%",showColon:n!==""&&!(e.getParent()&&e.getParent().isA("sap.m.table.columnmenu.QuickSortItem"))&&e._bHideLabelColon!==true});o.addStyleClass("sapMTCMenuQALabel");var s=[];var r=e.getContent()||[];r.forEach(function(t,e){var i,n,a,u;if(t.getLayoutData()){i=t.getLayoutData().clone()}else{n="L8 M8 S12";a="";if(e>0||e==0&&r.length>1){n="L4 M4 S6";if(e!=0&&(e+1)%2>0){a="L4 M4 S0"}}i=new y({span:n,indent:a})}t.removeAllAssociation("ariaLabelledBy");t.addAssociation("ariaLabelledBy",o.getId());u=new Q({control:t.setWidth("100%")});u.setLayoutData(i);s.push(u)},this);t.addFormElement(new A({label:o,fields:s}))},this);this.addDependent(this._oQuickActionContainer)};return k});
//# sourceMappingURL=Menu.js.map