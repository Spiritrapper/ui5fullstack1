sap.ui.define([], () => {
	"use strict";
    return {
      statusText: function(state) {
         console.log("Status formatter input:", state);
         if (!state) return "Unknown";
         if (typeof state === 'string') return state;
         if (state.request_state_kor) return state.request_state_kor;
         if (state.request_state_key) {
             switch(state.request_state_key) {
                 case "NEW": return "신규";
                 case "INPROGRESS": return "진행중";
                 case "COMPLETED": return "완료";
                 case "REJECTED": return "거절";
                 default: return state.request_state_key;
             }
         }
         return "Unknown";
     },
    statusState: function(state) {
       switch(state) {
          case "NEW": return "Information";
          case "INPROGRESS": return "Warning";
          case "COMPLETED": return "Success";
          default: return "None";
       }
    },
    priceState: function(price) {
       if (price >= 1000000) return "Error";
       if (price >= 500000) return "Warning";
       return "Success";
    }
 }

});

