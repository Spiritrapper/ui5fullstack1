/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Context","./ODataBinding","./lib/_Cache","./lib/_Helper","sap/base/Log","sap/ui/base/SyncPromise","sap/ui/model/BindingMode","sap/ui/model/ChangeReason","sap/ui/model/PropertyBinding"],function(e,t,o,n,i,s,r,a,h){"use strict";var d="sap.ui.model.odata.v4.ODataPropertyBinding",u=Object.freeze([]),p={AggregatedDataStateChange:true,change:true,dataReceived:true,dataRequested:true,DataStateChange:true},c="/"+e.VIRTUAL,l=h.extend("sap.ui.model.odata.v4.ODataPropertyBinding",{constructor:f});function f(e,o,i,s){h.call(this,e,o);t.call(this);if(o.endsWith("/")){throw new Error("Invalid path: "+o)}this.mScope=undefined;if(s){if(typeof s.scope==="object"){this.mScope=s.scope;s={...s};delete s.scope}this.checkBindingParameters(s,["$$groupId","$$ignoreMessages","$$noPatch"]);this.sGroupId=s.$$groupId;this.bNoPatch=s.$$noPatch;this.setIgnoreMessages(s.$$ignoreMessages)}else{this.sGroupId=undefined;this.bNoPatch=false}if(this.sPath==="@$ui5.context.isSelected"){this.bNoPatch=true}this.oCheckUpdateCallToken=undefined;this.oContext=i;this.bHasDeclaredType=undefined;this.bInitial=true;this.mQueryOptions=this.oModel.buildQueryOptions(n.clone(s),o.endsWith("$count"));this.vValue=undefined;this.fetchCache(i);e.bindingCreated(this)}t(l.prototype);l.prototype.attachEvent=function(e,t,o,n){if(!(e in p)){throw new Error("Unsupported event '"+e+"': v4.ODataPropertyBinding#attachEvent")}return h.prototype.attachEvent.apply(this,arguments)};l.prototype.checkUpdateInternal=function(e,t,o,h,u){var p=false,l=this.sPath.indexOf("##"),f=l>=0,g=this.oModel.getMetaModel(),y={data:{}},C=this.getResolvedPath(),v={forceUpdate:C&&(e||e===undefined&&this.getDataState().getControlMessages().length>0||this.oCheckUpdateCallToken&&this.oCheckUpdateCallToken.forceUpdate)},P=this.oType,R=this;this.oCheckUpdateCallToken=v;if(!P&&C&&this.sInternalType!=="any"&&!f&&!C.includes(c)){P=g.fetchUI5Type(this.sReducedPath||C)}if(u===undefined){u=this.oCachePromise.then(function(e){var t,n;if(e){return e.fetchValue(R.lockGroup(o||R.getGroupId()),undefined,function(){p=true;R.fireDataRequested(h)},R).then(function(t){R.checkSameCache(e);return t})}if(!R.isResolved()){return undefined}if(C.includes(c)){v.forceUpdate=false}if(!f){return R.oContext.fetchValue(R.sReducedPath,R)}t=R.sPath.slice(0,l);n=R.sPath.slice(l+2);if(n[0]==="/"){n="."+n}return g.fetchObject(n,g.getMetaContext(R.oModel.resolve(t,R.oContext)),R.mScope&&{scope:R.mScope})}).then(function(e){if(!e||typeof e!=="object"){return e}if(R.sInternalType==="any"&&(R.getBindingMode()===r.OneTime||!f&&(R.getBindingMode()===r.OneWay||R.sPath[R.sPath.lastIndexOf("/")+1]==="#"))){if(f){return e}else if(R.bRelative){return n.publicClone(e)}}i.error("Accessed value is not primitive",C,d)},function(e){R.oModel.reportError("Failed to read path "+C,d,e);if(e.canceled){v.forceUpdate=false;return R.vValue}y={error:e}});if(e&&u.isFulfilled()){if(P&&P.isFulfilled&&P.isFulfilled()){this.doSetType(P.getResult())}this.vValue=u.getResult()}u=Promise.resolve(u)}return s.all([u,P]).then(function(e){var o=e[1],n=e[0];if(v===R.oCheckUpdateCallToken){R.oCheckUpdateCallToken=undefined;R.doSetType(o);if(v.forceUpdate||R.vValue!==n){R.bInitial=false;R.vValue=n;R._fireChange({reason:t||a.Change})}R.checkDataState()}if(p){R.fireDataReceived(y,h)}if(y.error){throw y.error}})};l.prototype.destroy=function(){this.oModel.bindingDestroyed(this);this.oCheckUpdateCallToken=undefined;this.mQueryOptions=undefined;this.vValue=undefined;t.prototype.destroy.call(this);h.prototype.destroy.apply(this,arguments)};l.prototype.doCreateCache=function(e,t){return o.createProperty(this.oModel.oRequestor,e,t)};l.prototype.doFetchOrGetQueryOptions=function(){return this.isRoot()?this.mQueryOptions:undefined};l.prototype.doSetType=function(e){h.prototype.setType.call(this,e,this.sInternalType)};l.prototype.getDependentBindings=function(){return u};l.prototype.getResumePromise=function(){};l.prototype.getValue=function(){return this.vValue};l.prototype.getValueListType=function(){var e=this.getResolvedPath();if(!e){throw new Error(this+" is unresolved")}return this.getModel().getMetaModel().getValueListType(e)};l.prototype.hasPendingChangesInDependents=function(){return false};l.prototype.initialize=function(){if(this.isResolved()){if(this.isRootBindingSuspended()){this.sResumeChangeReason=a.Change}else{this.checkUpdate(true)}}};l.prototype.isMeta=function(){return this.sPath.includes("##")};l.prototype.onChange=function(e,t){this.checkUpdateInternal(t,undefined,undefined,false,e).catch(this.oModel.getReporter())};l.prototype.onDelete=function(){};l.prototype.refreshInternal=function(e,t,o,n){var i=this;if(this.isRootBindingSuspended()){this.refreshSuspended(t);return s.resolve()}return this.oCachePromise.then(function(){if(i.oCache&&i.oCache.reset){i.oCache.reset()}else{i.fetchCache(i.oContext,false,true,n)}if(o){return i.checkUpdateInternal(undefined,a.Refresh,t,n)}})};l.prototype.requestValue=function(){var e=this;return Promise.resolve(this.checkUpdateInternal(false).then(function(){return e.getValue()}))};l.prototype.requestValueListInfo=function(e){var t=this.getResolvedPath();if(!t){throw new Error(this+" is unresolved")}return this.getModel().getMetaModel().requestValueListInfo(t,e,this.oContext)};l.prototype.requestValueListType=function(){var e=this.getResolvedPath();if(!e){throw new Error(this+" is unresolved")}return this.getModel().getMetaModel().requestValueListType(e)};l.prototype.resetChangesInDependents=function(){};l.prototype.resetInvalidDataState=function(){if(this.getDataState().isControlDirty()){this._fireChange({reason:a.Change})}};l.prototype.resume=function(){throw new Error("Unsupported operation: resume")};l.prototype.resumeInternal=function(e,t){var o=this.sResumeChangeReason;this.sResumeChangeReason=undefined;this.fetchCache(this.oContext);if(e){this.checkUpdateInternal(t?undefined:false,o).catch(this.oModel.getReporter())}};l.prototype.setContext=function(e){if(this.oContext!==e){if(this.bRelative){this.checkSuspended(true);this.deregisterChangeListener();if(e){if(this.oType&&!this.bHasDeclaredType&&n.getMetaPath(this.oModel.resolve(this.sPath,e))!==n.getMetaPath(this.sReducedPath)){this.doSetType(undefined)}this.sReducedPath=undefined}}this.oContext=e;this.sResumeChangeReason=undefined;if(this.bRelative){this.fetchCache(this.oContext);this.checkUpdateInternal(this.bInitial||undefined,a.Context).catch(this.oModel.getReporter())}}};l.prototype.setType=function(e,t){var o=this.oType;this.bHasDeclaredType=!!e;if(e&&e.getName()==="sap.ui.model.odata.type.DateTimeOffset"){e.setV4()}h.prototype.setType.apply(this,arguments);if(!this.bInitial&&o!==e){this._fireChange({reason:a.Change})}};l.prototype.setValue=function(e,t){var o,i,s=this.getResolvedPath(),r=this;function h(e){r.oModel.reportError("Failed to update path "+s,d,e);return e}this.checkSuspended();if(this.bNoPatch&&t){throw h(new Error("Must not specify a group ID ("+t+") with $$noPatch"))}n.checkGroupId(t);if(typeof e==="function"||e&&typeof e==="object"){throw h(new Error("Not a primitive value"))}if(!this.bNoPatch&&this.vValue===undefined){throw h(new Error("Must not change a property before it has been read"))}if(this.vValue!==e){if(this.oCache){h(new Error("Cannot set value on this binding as it is not relative"+" to a sap.ui.model.odata.v4.Context"));return}o=this.bNoPatch?null:this.lockGroup(t,true,true);i=this.oContext.doSetProperty(this.sPath,e,o);i.catch(function(e){if(o){o.unlock(true)}h(e)});if(!i.isRejected()&&r.oModel.hasListeners("propertyChange")){r.oModel.firePropertyChange({context:r.oContext,path:r.sPath,promise:i.isPending()?i.getResult():undefined,reason:a.Binding,resolvedPath:s,value:e})}}};l.prototype.supportsIgnoreMessages=function(){return true};l.prototype.suspend=function(){throw new Error("Unsupported operation: suspend")};l.prototype.updateAfterCreate=function(){return this.checkUpdateInternal()};l.prototype.visitSideEffects=function(){};return l});
//# sourceMappingURL=ODataPropertyBinding.js.map