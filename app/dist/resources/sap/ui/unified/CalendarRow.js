/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/i18n/Formatting","sap/base/i18n/Localization","sap/ui/core/Control","sap/ui/Device","sap/ui/core/Lib","sap/ui/core/LocaleData","sap/ui/unified/calendar/CalendarUtils","sap/ui/core/date/UniversalDate","./library","sap/ui/core/InvisibleText","sap/ui/core/format/DateFormat","sap/ui/core/ResizeHandler","sap/ui/core/Locale","./CalendarRowRenderer","sap/ui/dom/containsOrEquals","sap/ui/thirdparty/jquery","sap/ui/unified/CalendarAppointment","sap/ui/core/InvisibleMessage","sap/ui/core/library","sap/ui/core/date/UI5Date"],function(e,t,i,a,n,s,r,o,p,l,u,g,h,d,c,jQuery,f,m,v,T){"use strict";var C=p.CalendarDayType;var A=p.CalendarAppointmentVisualization;var _=p.GroupAppointmentsMode;var U=p.CalendarIntervalType;var y=p.CalendarAppointmentHeight;var D=p.CalendarAppointmentRoundWidth;var b=v.InvisibleMessageMode;var S=i.extend("sap.ui.unified.CalendarRow",{metadata:{library:"sap.ui.unified",properties:{startDate:{type:"object",group:"Data"},intervals:{type:"int",group:"Appearance",defaultValue:12},intervalSize:{type:"int",group:"Appearance",defaultValue:1},intervalType:{type:"sap.ui.unified.CalendarIntervalType",group:"Appearance",defaultValue:U.Hour},showSubIntervals:{type:"boolean",group:"Appearance",defaultValue:false},showIntervalHeaders:{type:"boolean",group:"Appearance",defaultValue:true},showEmptyIntervalHeaders:{type:"boolean",group:"Appearance",defaultValue:true},nonWorkingDays:{type:"int[]",group:"Misc",defaultValue:null},nonWorkingHours:{type:"int[]",group:"Misc",defaultValue:null},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},checkResize:{type:"boolean",group:"Behavior",defaultValue:true},updateCurrentTime:{type:"boolean",group:"Behavior",defaultValue:true},groupAppointmentsMode:{type:"sap.ui.unified.GroupAppointmentsMode",group:"Appearance",defaultValue:_.Collapsed},appointmentsReducedHeight:{type:"boolean",group:"Appearance",defaultValue:false,deprecated:true},appointmentsVisualization:{type:"sap.ui.unified.CalendarAppointmentVisualization",group:"Appearance",defaultValue:A.Standard},appointmentHeight:{type:"sap.ui.unified.CalendarAppointmentHeight",group:"Appearance",defaultValue:y.Regular},appointmentRoundWidth:{type:"sap.ui.unified.CalendarAppointmentRoundWidth",group:"Appearance",defaultValue:D.None},multipleAppointmentsSelection:{type:"boolean",group:"Data",defaultValue:false}},aggregations:{appointments:{type:"sap.ui.unified.CalendarAppointment",defaultClass:f,multiple:true,singularName:"appointment"},intervalHeaders:{type:"sap.ui.unified.CalendarAppointment",multiple:true,singularName:"intervalHeader"},groupAppointments:{type:"sap.ui.unified.CalendarAppointment",multiple:true,singularName:"groupAppointment",visibility:"hidden"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"},legend:{type:"sap.ui.unified.CalendarLegend",multiple:false}},events:{select:{parameters:{appointment:{type:"sap.ui.unified.CalendarAppointment"},appointments:{type:"sap.ui.unified.CalendarAppointment[]"},multiSelect:{type:"boolean"},domRefId:{type:"string"}}},startDateChange:{},leaveRow:{parameters:{type:{type:"string"}}},intervalSelect:{parameters:{startDate:{type:"object"},endDate:{type:"object"},subInterval:{type:"boolean"}}}}},renderer:d});S.prototype.init=function(){this._bRTL=t.getRTL();this._oRb=n.getResourceBundleFor("sap.ui.unified");this._oFormatAria=u.getDateTimeInstance({pattern:"EEEE dd/MM/YYYY 'at' "+w.call(this).getTimePattern("medium")});this._aVisibleAppointments=[];this._aVisibleIntervalHeaders=[];this.setStartDate(T.getInstance());this._resizeProxy=jQuery.proxy(this.handleResize,this);this.aSelectedAppointments=[];this._fnCustomSortedAppointments=undefined};S.prototype.exit=function(){if(this._sResizeListener){g.deregister(this._sResizeListener);this._sResizeListener=undefined}if(this._sUpdateCurrentTime){clearTimeout(this._sUpdateCurrentTime);this._sUpdateCurrentTime=undefined}this._fnCustomSortedAppointments=undefined};S.prototype.onBeforeRendering=function(){this._aVisibleAppointments=[];H.call(this);E.call(this);F.call(this);if(this._sUpdateCurrentTime){clearTimeout(this._sUpdateCurrentTime);this._sUpdateCurrentTime=undefined}if(!this.getAppointments().length){this.aSelectedAppointments=[]}else{this.getAppointments().forEach(function(e){this._updateSelectedAppointmentsArray(e)}.bind(this))}this._oInvisibleMessage=m.getInstance()};S.prototype.onAfterRendering=function(){P.call(this);this.updateCurrentTimeVisualization();if(this.getCheckResize()&&!this._sResizeListener){this._sResizeListener=g.register(this,this._resizeProxy)}};S.prototype.onThemeChanged=function(e){if(this.getDomRef()){for(var t=0;t<this._aVisibleAppointments.length;t++){var i=this._aVisibleAppointments[t];i.level=-1}this.handleResize(e)}};S.prototype.invalidate=function(e){if(e&&e instanceof f){var t=false;for(var a=0;a<this._aVisibleAppointments.length;a++){if(this._aVisibleAppointments[a].appointment==e){t=true;break}}if(t){this._aVisibleAppointments=[]}this._updateSelectedAppointmentsArray(e)}i.prototype.invalidate.apply(this,arguments)};S.prototype.setStartDate=function(e){if(!e){e=T.getInstance()}r._checkJSDateObject(e);var t=e.getFullYear();r._checkYearInValidRange(t);this._oUTCStartDate=r._createUniversalUTCDate(e,undefined,true);this.setProperty("startDate",e);return this};S.prototype._getStartDate=function(){if(!this._oUTCStartDate){this._oUTCStartDate=r._createUniversalUTCDate(this.getStartDate(),undefined,true)}return this._oUTCStartDate};S.prototype.setIntervalType=function(e){this.setProperty("intervalType",e);this._aVisibleAppointments=[];return this};S.prototype._getAppointmentReducedHeight=function(e){var t=!a.system.phone&&this.getAppointmentsReducedHeight()&&e.size===y.Regular;return t};S.prototype.onfocusin=function(e){if(jQuery(e.target).hasClass("sapUiCalendarApp")){Y.call(this,e.target.id)}else{var t=this._getVisibleAppointments();var i=false;var a;for(var n=0;n<t.length;n++){a=t[n].appointment;if(c(a.getDomRef(),e.target)){i=true;a.focus();break}}if(!i){a=this.getFocusedAppointment();if(a){a.focus()}}}};S.prototype.applyFocusInfo=function(e){if(this._sFocusedAppointmentId){this.getFocusedAppointment().focus()}return this};S.prototype.onsapleft=function(e){if(jQuery(e.target).hasClass("sapUiCalendarApp")){x.call(this,this._bRTL,1)}e.preventDefault();e.stopPropagation()};S.prototype.onsapright=function(e){if(jQuery(e.target).hasClass("sapUiCalendarApp")){x.call(this,!this._bRTL,1)}e.preventDefault();e.stopPropagation()};S.prototype.onsapup=function(e){this.fireLeaveRow({type:e.type})};S.prototype.onsapdown=function(e){this.fireLeaveRow({type:e.type})};S.prototype.onsaphome=function(e){B.call(this,e);e.preventDefault();e.stopPropagation()};S.prototype.onsapend=function(e){B.call(this,e);e.preventDefault();e.stopPropagation()};S.prototype.onsapselect=function(e){var t=this._getVisibleAppointments(),i,a;for(var n=0;n<t.length;n++){i=t[n].appointment;if(c(i.getDomRef(),e.target)){var s=!(this.getMultipleAppointmentsSelection()||e.ctrlKey||e.metaKey);O.call(this,i,s);break}}a=i.getSelected()?"APPOINTMENT_SELECTED":"APPOINTMENT_UNSELECTED";this._oInvisibleMessage.announce(this._oRb.getText(a),b.Polite);e.stopPropagation();e.preventDefault()};S.prototype.ontap=function(e){var t=this.$("Apps").children(".sapUiCalendarRowAppsInt");var i=0;var a=false;for(i=0;i<t.length;i++){var n=t[i];if(!this._isOneMonthsRowOnSmallSizes()&&c(n,e.target)){a=true;break}}if(a){j.call(this,i,e.target)}else{this.onsapselect(e)}};S.prototype.onsapselectmodifiers=function(e){this.onsapselect(e)};S.prototype.handleResize=function(e){if(e&&e.size&&e.size.width<=0){return this}var t=this.$("DummyApp");t.css("display","");P.call(this);return this};S.prototype.updateCurrentTimeVisualization=function(){var e=this.$("Now");var t=r._createUniversalUTCDate(T.getInstance(),undefined,true);var i=this.getIntervals();var a=this.getIntervalType();var n=this._getStartDate();var s=n.getTime();var o=this._oUTCEndDate;var p=o.getTime();this._sUpdateCurrentTime=undefined;if(t.getTime()<=p&&t.getTime()>=s){var l=L.call(this,a,i,n,o,s,t);var u=0;if(this._bRTL){e.css("right",l+"%")}else{e.css("left",l+"%")}e.css("display","");if(this.getUpdateCurrentTime()){switch(a){case U.Hour:u=6e4;break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":u=18e5;break;default:u=-1;break}if(u>0){this._sUpdateCurrentTime=setTimeout(this.updateCurrentTimeVisualization.bind(this),u)}}}else{e.css("display","none")}return this};S.prototype.getFocusedAppointment=function(){var e=this._getAppointmentsSorted();var t=this.getAggregation("groupAppointments",[]);var i;var a=0;for(a=0;a<t.length;a++){if(t[a].getId()==this._sFocusedAppointmentId){i=t[a];break}}if(!i){for(a=0;a<e.length;a++){if(e[a].getId()==this._sFocusedAppointmentId){i=e[a];break}}}return i};S.prototype.focusAppointment=function(e){if(!e||!(e instanceof f)){throw new Error("Appointment must be a CalendarAppointment; "+this)}var t=e.getId();if(this._sFocusedAppointmentId!=t){Y.call(this,t)}else{e.focus()}return this};S.prototype.focusNearestAppointment=function(e){r._checkJSDateObject(e);var t=this._getAppointmentsSorted();var i;var a;var n;for(var s=0;s<t.length;s++){i=t[s];if(i.getStartDate()>e){if(s>0){a=t[s-1]}else{a=i}break}}if(i){if(a&&Math.abs(i.getStartDate()-e)>=Math.abs(a.getStartDate()-e)){n=a}else{n=i}this.focusAppointment(n)}return this};S.prototype._getVisibleAppointments=function(){return this._aVisibleAppointments};S.prototype._getVisibleIntervalHeaders=function(){return this._aVisibleIntervalHeaders};S.prototype._getNonWorkingDays=function(){if(this.getIntervalSize()!==1){return[]}var e=this.getNonWorkingDays();if(!e){var t=w.call(this);var i=t.getWeekendStart();var a=t.getWeekendEnd();e=[];for(var n=0;n<=6;n++){if(i<=a&&n>=i&&n<=a||i>a&&(n>=i||n<=a)){e.push(n)}}}else if(!Array.isArray(e)){e=[]}return e};S.prototype._isOneMonthsRowOnSmallSizes=function(){return(this.getIntervalType()===U.OneMonth||this.getIntervalType()==="OneMonth")&&this.getIntervals()===1};S.prototype._getAppointmentsSorted=function(){var e=this.getAppointments(),t=G;e.sort(this._fnCustomSortedAppointments?this._fnCustomSortedAppointments:t);return e};S.prototype._setCustomAppointmentsSorterCallback=function(e){this._fnCustomSortedAppointments=e;this.invalidate()};S.prototype._calculateAppoitnmentVisualCue=function(e){if(M(this,e)){return{appTimeUnitsDifRowStart:0,appTimeUnitsDifRowEnd:0}}var t=e.getStartDate(),i=e.getEndDate(),a=new o(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes()),n=new o(i.getFullYear(),i.getMonth(),i.getDate(),i.getHours(),i.getMinutes()),s=this.getIntervalType(),r=this.getStartDate(),p=s==="Hour"?new o(r.getFullYear(),r.getMonth(),r.getDate(),r.getHours()):new o(r.getFullYear(),r.getMonth(),r.getDate()),l=this.getIntervals(),u;switch(s){case"Hour":u=new o(r.getFullYear(),r.getMonth(),r.getDate(),r.getHours()+l);break;case"Day":case"Week":case"One Month":u=new o(r.getFullYear(),r.getMonth(),r.getDate()+l);break;case"Month":u=new o(r.getFullYear(),r.getMonth()+l,r.getDate());break;default:break}return{appTimeUnitsDifRowStart:p.getTime()-a.getTime(),appTimeUnitsDifRowEnd:n.getTime()-u.getTime()}};S.prototype._updateSelectedAppointmentsArray=function(e){if(e.getSelected()){if(this.aSelectedAppointments.indexOf(e.getId())===-1){this.aSelectedAppointments.push(e.getId())}}else{this.aSelectedAppointments=this.aSelectedAppointments.filter(function(t){return t!==e.getId()})}};function M(e,t){var i=e.getAggregation("groupAppointments",[]);var a;for(a=0;a<i.length;++a){if(t===i[a]){return true}}return false}function I(){if(!this._sLocale){this._sLocale=new h(e.getLanguageTag()).toString()}return this._sLocale}function w(){if(!this._oLocaleData){var e=I.call(this);var t=new h(e);this._oLocaleData=s.getInstance(t)}return this._oLocaleData}function H(){var e=this.getStartDate();var t;var i=this.getIntervals();var a=this.getIntervalType();this._oUTCStartDate=k.call(this,e);switch(a){case U.Hour:t=new o(this._oUTCStartDate.getTime());t.setUTCHours(t.getUTCHours()+i);break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":t=new o(this._oUTCStartDate.getTime());t.setUTCDate(t.getUTCDate()+i*this.getIntervalSize());break;case U.Month:t=new o(this._oUTCStartDate.getTime());t.setUTCMonth(t.getUTCMonth()+i);break;default:throw new Error("Unknown IntervalType: "+a+"; "+this)}t.setUTCMilliseconds(-1);this._iRowSize=t.getTime()-this._oUTCStartDate.getTime();this._iIntervalSize=Math.floor(this._iRowSize/i);this._oUTCEndDate=t}function k(e){var t=this.getIntervalType();var i=r._createUniversalUTCDate(e,undefined,true);switch(t){case U.Hour:i.setUTCMinutes(0);i.setUTCSeconds(0);i.setUTCMilliseconds(0);break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":i.setUTCHours(0);i.setUTCMinutes(0);i.setUTCSeconds(0);i.setUTCMilliseconds(0);break;case U.Month:i.setUTCDate(1);i.setUTCHours(0);i.setUTCMinutes(0);i.setUTCSeconds(0);i.setUTCMilliseconds(0);break;default:throw new Error("Unknown IntervalType: "+t+"; "+this)}return i}function R(){return a.system.phone||this.getGroupAppointmentsMode()===_.Collapsed}function E(){var e=this._getAppointmentsSorted();var t;var i;var a;var n=this.getIntervals();var s=this.getIntervalType();var p=this._getStartDate();var l=p.getTime();var u=this._oUTCEndDate;var g=u.getTime();var h=[];var d=false;var c=0;var f=0;var m=R.call(this);var v=this._needAppointmentHorizontalFit();this.destroyAggregation("groupAppointments",true);for(c=0;c<e.length;c++){t=e[c];if(!t||!t.getStartDate()){continue}var C=r._createUniversalUTCDate(t.getStartDate(),undefined,true);var A=C.getTime();C.setUTCSeconds(0);C.setUTCMilliseconds(0);var _=t.getEndDate()?r._createUniversalUTCDate(t.getEndDate(),undefined,true):r._createUniversalUTCDate(T.getInstance(864e12),undefined,true);var y=_.getTime();_.setUTCSeconds(0);_.setUTCMilliseconds(0);var D=false;if(C.getTime()<l&&_.getTime()>=l){C=new o(l);D=true}if(_.getTime()>g&&C.getTime()<=g){_=new o(g);D=true}var b=(_.getTime()-C.getTime())/6e4;if(D&&b==0){continue}var S=0;var M=0;var I=-1;i=undefined;a=undefined;if(C&&C.getTime()<=g&&_&&_.getTime()>=l&&A<=y){if(m&&s==U.Month&&_.getTime()-C.getTime()<6048e5){i=V.call(this,C,t,s,n,p,u,l,h);var w=r._createUniversalUTCDate(i.getEndDate(),undefined,true);if(_.getTime()>w.getTime()){a=V.call(this,_,t,s,n,p,u,l,h)}}if(v){this._setHorizontalRoundingWidth(t,C,_)}S=L.call(this,s,n,p,u,l,C);M=z.call(this,s,n,p,u,l,_);if(i){i._iBegin=S;i._iEnd=M;i._iLevel=I;if(a){a._iBegin=S;a._iEnd=M;a._iLevel=I}continue}h.push({appointment:t,begin:S,end:M,calculatedEnd:M,level:I,size:this.getProperty("appointmentHeight")});if(this._sFocusedAppointmentId&&this._sFocusedAppointmentId==t.getId()){d=true}}}var H=this.getAggregation("groupAppointments",[]);if(H.length>0){for(c=0;c<h.length;c++){t=h[c];if(t.appointment._aAppointments&&t.appointment._aAppointments.length<=1){i=t.appointment;var k=false;if(i._aAppointments.length==0){k=true}else{for(f=0;f<h.length;f++){if(h[f].appointment==i._aAppointments[0]){k=true;break}}}if(!k){for(f=0;f<H.length;f++){a=H[f];if(i!=a){for(var E=0;E<a._aAppointments.length;E++){if(i._aAppointments[0]==a._aAppointments[E]){a._aAppointments.splice(E,1);if(a._aAppointments.length==1){this.removeAggregation("groupAppointments",a);a.destroy();H=this.getAggregation("groupAppointments",[])}else{a.setProperty("title",a._aAppointments.length,true)}break}}}}t.begin=i._iBegin;t.end=i._iEnd;t.calculatedEnd=i._iEnd;t.level=i._iLevel;t.appointment=i._aAppointments[0]}else{h.splice(c,1);c--}this.removeAggregation("groupAppointments",i);i.destroy();H=this.getAggregation("groupAppointments",[])}}}if(!d){if(h.length>0){this._sFocusedAppointmentId=h[0].appointment.getId()}else{this._sFocusedAppointmentId=undefined}}this._aVisibleAppointments=h;return this._aVisibleAppointments}function V(e,t,i,a,n,s,p,l){var u=this.getAggregation("groupAppointments",[]);var g;var h=w.call(this);var d=h.getFirstDayOfWeek();var c=e.getUTCDay();var m=new o(e.getTime());m.setUTCHours(0);m.setUTCMinutes(0);m.setUTCSeconds(0);m.setUTCMilliseconds(0);if(d<=c){m.setDate(m.getDate()-(c-d))}else{m.setDate(m.getDate()-(7-c-d))}for(var v=0;v<u.length;v++){g=u[v];var A=r._createUniversalUTCDate(g.getStartDate(),undefined,true);if(A.getTime()==m.getTime()){break}g=undefined}if(!g){var _=new o(m.getTime());_.setDate(_.getDate()+7);_.setMilliseconds(-1);g=new f(this.getId()+"-Group"+u.length,{type:t.getType(),startDate:r._createLocalDate(T.getInstance(m.getTime()),true),endDate:r._createLocalDate(T.getInstance(_.getTime()),true)});g._aAppointments=[];this.addAggregation("groupAppointments",g,true);var U=L.call(this,i,a,n,s,p,m);var y=z.call(this,i,a,n,s,p,_);l.push({appointment:g,begin:U,end:y,calculatedEnd:y,level:-1,size:this.getProperty("appointmentHeight")})}g._aAppointments.push(t);if(g.getType()!=C.None&&g.getType()!=t.getType()){g.setType(C.None)}g.setProperty("title",g._aAppointments.length,true);return g}function L(e,t,i,a,n,s){var r=0;if(e!=U.Month){r=100*(s.getTime()-n)/this._iRowSize}else{var p=new o(s.getTime());p.setUTCDate(1);p.setUTCHours(0);p.setUTCMinutes(0);p.setUTCSeconds(0);p.setUTCMilliseconds(0);var l=new o(p.getTime());l.setUTCMonth(l.getUTCMonth()+1);l.setMilliseconds(-1);var u=l.getTime()-p.getTime();var g=(p.getUTCFullYear()-i.getUTCFullYear())*12+p.getUTCMonth()-i.getUTCMonth();r=100*g/t+100*(s.getTime()-p.getTime())/u/t}if(r<0){r=0}r=Math.round(r*1e5)/1e5;return r}function z(e,t,i,a,n,s){var r=0;if(e!=U.Month){r=100-100*(s.getTime()-n)/this._iRowSize}else{var p=new o(s.getTime());p.setUTCDate(1);p.setUTCHours(0);p.setUTCMinutes(0);p.setUTCSeconds(0);p.setUTCMilliseconds(0);var l=new o(p.getTime());l.setUTCMonth(l.getUTCMonth()+1);l.setMilliseconds(-1);var u=l.getTime()-p.getTime();var g=(p.getUTCFullYear()-i.getUTCFullYear())*12+p.getUTCMonth()-i.getUTCMonth();r=100-(100*g/t+100*(s.getTime()-p.getTime())/u/t)}if(r<0){r=0}r=Math.round(r*1e5)/1e5;return r}function F(){var e=[];if(this.getShowIntervalHeaders()){var t=this.getIntervalHeaders();var i;var a=this.getIntervals();var n=this.getIntervalType();var s=this._getStartDate();var p=s.getTime();var l=this._oUTCEndDate;var u=l.getTime();var g=0;var h=0;for(g=0;g<t.length;g++){i=t[g];var d=r._createUniversalUTCDate(i.getStartDate(),undefined,true);d.setUTCSeconds(0);d.setUTCMilliseconds(0);var c=i.getEndDate()?r._createUniversalUTCDate(i.getEndDate(),undefined,true):r._createUniversalUTCDate(T.getInstance(864e12),undefined,true);c.setUTCSeconds(0);c.setUTCMilliseconds(0);if(d&&d.getTime()<=u&&c&&c.getTime()>=p){var f=new o(s.getTime());var m=new o(s.getTime());m.setUTCMinutes(m.getUTCMinutes()-1);var v=-1;var C=-1;for(h=0;h<a;h++){switch(n){case U.Hour:m.setUTCHours(m.getUTCHours()+1);if(h>0){f.setUTCHours(f.getUTCHours()+1)}break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":m.setUTCDate(m.getUTCDate()+1);if(h>0){f.setUTCDate(f.getUTCDate()+1)}break;case U.Month:m.setUTCDate(1);m.setUTCMonth(m.getUTCMonth()+2);m.setUTCDate(0);if(h>0){f.setUTCMonth(f.getUTCMonth()+1)}break;default:throw new Error("Unknown IntervalType: "+n+"; "+this)}if(d&&d.getTime()<=f.getTime()&&c&&c.getTime()>=m.getTime()){if(v<0){v=h}C=h}}if(v>=0){e.push({interval:v,appointment:i,last:C})}}}}this._aVisibleIntervalHeaders=e;return this._aVisibleIntervalHeaders}function P(){if(this._isOneMonthsRowOnSmallSizes()){return}var e=this.$("Apps");var t=e.innerWidth();if(t<=0){return}var i=this.$("DummyApp");var a=i.outerHeight(true);if(a<=0){return}var n=4;var s=i.outerWidth();var r=s/t*100;var o=Math.ceil(1e3*r)/1e3;var p;var l;var u=0;var g=0;var h=0;var d=false;var c;var f=this._needAppointmentHorizontalFit();if(this.getShowIntervalHeaders()&&(this.getShowEmptyIntervalHeaders()||this._getVisibleIntervalHeaders().length>0)){u=jQuery(this.$("AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0]).outerHeight(true);d=true}for(h=0;h<this._aVisibleAppointments.length;h++){p=this._aVisibleAppointments[h];l=p.appointment.$();var m=Math.floor(1e3*(100-p.calculatedEnd-p.begin))/1e3;var v=false;if(m<o){p.end=100-p.begin-r;if(p.end<0){p.end=0}v=true;l.addClass("sapUiCalendarAppSmall")}else if(l.hasClass("sapUiCalendarAppSmall")){p.end=p.calculatedEnd;v=true;l.removeClass("sapUiCalendarAppSmall")}if(v){p.level=-1}if(v&&!f){if(this._bRTL){l.css("left",p.end+"%")}else{l.css("right",p.end+"%")}}if(f){p.end=p.calculatedEnd}}for(h=0;h<this._aVisibleAppointments.length;h++){p=this._aVisibleAppointments[h];l=p.appointment.$();var T={};if(p.level<0){for(var C=0;C<this._aVisibleAppointments.length;C++){var A=this._aVisibleAppointments[C];if(p!=A&&p.begin<Math.floor(1e3*(100-A.end))/1e3&&Math.floor(1e3*(100-p.end))/1e3>A.begin&&A.level>=0){this._setBlockedLevelsForAppointment(A,T)}}p.level=this._getAppointmetLevel(T,p);l.attr("data-sap-level",p.level)}c=a*p.level+u;if(!d){c+=n}l.css("top",c+"px");var _=p.level;_+=this._getAppointmentRowCount(p)-1;if(g<_){g=_}}g++;a=a*g+u;if(!d){a+=n}if(!this.getHeight()){e.outerHeight(a)}else{var U=this.$("Apps").children(".sapUiCalendarRowAppsInt");for(h=0;h<U.length;h++){var y=jQuery(U[h]);y.outerHeight(a)}}i.css("display","none")}function O(e,t){var i=0;var a;var n;var s;var r;var o=l.getStaticId("sap.ui.unified","APPOINTMENT_SELECTED");var p=l.getStaticId("sap.ui.unified","APPOINTMENT_UNSELECTED");var u=!e.getSelected();if(t){var g=this.getAppointments();var h=this.getAggregation("groupAppointments",[]);jQuery.merge(g,h);for(i=0;i<g.length;i++){a=g[i];if(a.getId()!==e.getId()&&a.getSelected()){a.setProperty("selected",false,true);a.$().removeClass("sapUiCalendarAppSel");for(var d=0;d<this.aSelectedAppointments.length;d++){if(this.aSelectedAppointments[d]!==a.getId()){this.aSelectedAppointments.splice(d)}}n=a.$().attr("aria-labelledby");s=n?n.replace(o,p):"";a.$().attr("aria-labelledby",s)}}}r=e.$().attr("aria-labelledby").replace(p,o).trim();s=e.$().attr("aria-labelledby").replace(o,p).trim();if(e.getSelected()){e.setProperty("selected",false,true);e.$().removeClass("sapUiCalendarAppSel");e.$().attr("aria-labelledby",s);N(this,t)}else{e.setProperty("selected",true,true);e.$().addClass("sapUiCalendarAppSel");e.$().attr("aria-labelledby",r);N(this,t)}this._updateSelectedAppointmentsArray(e);if(e._aAppointments){for(i=0;i<e._aAppointments.length;i++){a=e._aAppointments[i];a.setProperty("selected",u,true)}this.fireSelect({appointments:e._aAppointments,multiSelect:!t,domRefId:e.getId()})}else{this.fireSelect({appointment:e,multiSelect:!t,domRefId:e.getId()})}}function W(e){var t=this._getPlanningCalendar();if(t){t["_onRow"+e]()}}S.prototype._needAppointmentHorizontalFit=function(){var e=this._getPlanningCalendar(),t,i,a;if(!e||this.getAppointmentRoundWidth()===D.None){return false}t=e.getViewKey();i=e._getView(t);a=e._getIntervals(i);return a>=20};S.prototype._setHorizontalRoundingWidth=function(e,t,i){var a;switch(this.getAppointmentRoundWidth()){case D.HalfColumn:a=12;break}this._roundAppointment(e,t,i,a)};S.prototype._roundAppointment=function(e,t,i,a){var n,s;n=e.getStartDate().getHours()-e.getStartDate().getHours()%a;t.setUTCHours(n);t.setUTCMinutes(0);t.setUTCSeconds(0);t.setUTCMilliseconds(0);s=e.getEndDate().getHours()-e.getEndDate().getHours()%a+a;i.setUTCHours(s);i.setUTCMinutes(0);i.setUTCSeconds(0);i.setUTCMilliseconds(0)};S.prototype._setBlockedLevelsForAppointment=function(e,t){var i=this._getAppointmentRowCount(e);for(var a=0;a<i;a++){t[e.level+a]=true}return t};S.prototype._getAppointmentRowCount=function(e){var t,i=this._getAppointmentReducedHeight(e);switch(e.size){case y.HalfSize:t=1;break;case y.Regular:t=2;if(i&&!e.appointment.getText()&&!e.appointment.getDescription()){t=1}break;case y.Large:t=3;break;case y.Automatic:t=1;if(e.appointment.getText()){t+=1}if(e.appointment.getDescription()){t+=1}break}return t};S.prototype._getAppointmetLevel=function(e,t){var i=0;var a=this._getAppointmentRowCount(t);var n=true;while(n){n=this._isPosibleToPositionAppointment(i,e,a);if(!n){n=true;i+=1}else{n=false}}return i};S.prototype._isPosibleToPositionAppointment=function(e,t,i){for(var a=e;a<i+e;a++){if(t[a]){return false}}return true};S.prototype._getPlanningCalendar=function(){var e=this;while(e.getParent()!==null){if(e.isA("sap.m.PlanningCalendar")){return e}e=e.getParent()}};S.prototype._isNonWorkingInterval=function(e,t,i,a){return t.includes((e+i)%a)};function N(e,t){if(t){W.call(e,"DeselectAppointment")}}function $(e){var t=this.getAggregation("groupAppointments",[]);var i;var a=false;for(var n=0;n<t.length;n++){var s=t[n]._aAppointments;for(var r=0;r<s.length;r++){if(s[r].getId()==e){i=t[n];a=true;break}}if(a){break}}return i}function Y(e){if(this._sFocusedAppointmentId!=e){var t=this._getAppointmentsSorted();var i=this._aVisibleAppointments;var a;var n=0;a=$.call(this,e);if(a){e=a.getId();a=undefined}for(n=0;n<i.length;n++){if(i[n].appointment.getId()==e){a=i[n].appointment;break}}if(a){var s=this.getFocusedAppointment().$();var o=a.$();this._sFocusedAppointmentId=a.getId();s.attr("tabindex","-1");o.attr("tabindex","0");o.trigger("focus")}else{for(n=0;n<t.length;n++){if(t[n].getId()==e){a=t[n];break}}if(a){this._sFocusedAppointmentId=a.getId();var p=k.call(this,a.getStartDate());this.setStartDate(r._createLocalDate(p,true));if(!c(this.getDomRef(),document.activeElement)){setTimeout(function(){this.getFocusedAppointment().focus()}.bind(this),0)}this.fireStartDateChange()}}}}function x(e,t){var i=this._sFocusedAppointmentId;var a=this._getAppointmentsSorted();var n=this.getAggregation("groupAppointments",[]);var s;var r=0;var o=0;for(o=0;o<n.length;o++){if(n[o].getId()==i){var p=n[o]._aAppointments;if(e){i=p[p.length-1].getId()}else{i=p[0].getId()}break}}for(o=0;o<a.length;o++){if(a[o].getId()==i){r=o;break}}if(e){r=r+t}else{r=r-t}if(r<0){r=0}else if(r>=a.length){r=a.length-1}s=a[r];Y.call(this,s.getId())}function B(e){var t=this._getAppointmentsSorted();var i;var a=new o(this._getStartDate());var n=new o(this._oUTCEndDate);var s=this.getIntervalType();var p;var l;a.setUTCHours(0);n.setUTCHours(0);n.setUTCMinutes(0);n.setUTCSeconds(0);switch(s){case U.Hour:n.setUTCDate(n.getUTCDate()+1);n.setUTCMilliseconds(-1);break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":a.setUTCDate(1);n.setUTCMonth(n.getUTCMonth()+1);n.setUTCDate(1);n.setUTCMilliseconds(-1);break;case U.Month:a.setUTCMonth(0);a.setUTCDate(1);n.setUTCFullYear(n.getUTCFullYear()+1);n.setUTCMonth(1);n.setUTCDate(1);n.setUTCMilliseconds(-1);break;default:throw new Error("Unknown IntervalType: "+s+"; "+this)}var u=r._createLocalDate(a,true);var g=r._createLocalDate(n,true);for(var h=0;h<t.length;h++){if(t[h].getStartDate()>=u&&t[h].getStartDate()<=g){i=t[h];p=i.getId();if(e.type=="saphome"){break}}else if(t[h].getStartDate()>g){break}}l=$.call(this,p);if(l){i=l;p=i.getId()}if(p&&p!=this._sFocusedAppointmentId){Y.call(this,p)}else if(e._bPlanningCalendar&&i){i.focus()}else{this.fireLeaveRow({type:e.type})}}function j(e,t){var i=this.getIntervalType();var a=this._getStartDate();var n=new o(a.getTime());var s;var p=false;var l=0;var u=0;if(jQuery(t).hasClass("sapUiCalendarRowAppsSubInt")){p=true;var g=jQuery(jQuery(t).parent()).children(".sapUiCalendarRowAppsSubInt");u=g.length;for(l=0;l<u;l++){var h=g[l];if(h==t){break}}}switch(i){case U.Hour:n.setUTCHours(n.getUTCHours()+e);if(p){n.setUTCMinutes(n.getUTCMinutes()+l*60/u);s=new o(n.getTime());s.setUTCMinutes(s.getUTCMinutes()+60/u)}else{s=new o(n.getTime());s.setUTCHours(s.getUTCHours()+1)}break;case U.Day:case U.Week:case U.OneMonth:case"OneMonth":n.setUTCDate(n.getUTCDate()+e);if(p){n.setUTCHours(n.getUTCHours()+l*24/u);s=new o(n.getTime());s.setUTCHours(s.getUTCHours()+24/u)}else{s=new o(n.getTime());s.setUTCDate(s.getUTCDate()+1)}break;case U.Month:n.setUTCMonth(n.getUTCMonth()+e);if(p){n.setUTCDate(n.getUTCDate()+l);s=new o(n.getTime());s.setUTCDate(s.getUTCDate()+1)}else{s=new o(n.getTime());s.setUTCMonth(s.getUTCMonth()+1)}break;default:throw new Error("Unknown IntervalType: "+i+"; "+this)}s.setUTCMilliseconds(s.getUTCMilliseconds()-1);n=r._createLocalDate(n,true);s=r._createLocalDate(s,true);this.fireIntervalSelect({startDate:n,endDate:s,subInterval:p})}function G(e,t){var i=e.getStartDate()-t.getStartDate();if(i==0){i=t.getEndDate()-e.getEndDate()}return i}return S});
//# sourceMappingURL=CalendarRow.js.map