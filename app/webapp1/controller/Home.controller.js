sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.nttfc.nttfc.controller.Home", {
            onInit: function () {

                this._oTable = this.byId("table0");

            },

            onSelect:function(oEvent)
            {
                var sPath = oEvent.oSource._aSelectedPaths
                sPath = sPath[0].split("/")
                sPath = sPath[1]
                this.oPath = sPath
            },
            onOpenAddDialog: function () {
                this.getView().byId("OpenDialog").open();
             },
             onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
             },
             onCreate: function () {
          /*      var  = this.getView().byId("idSo").getValue();
                if (oSo !== "") {*/
                const auto_ID = globalThis.crypto.randomUUID();
                    const oList = this._oTable;
                        const oBinding = oList.getBinding("items");
                        const oContext = oBinding.create({
                            "ID" : auto_ID,
                            "name": this.byId("idname").getValue(),
                            "height": parseInt(this.byId("idheight").getValue()),
                            "age": parseInt(this.byId("idage").getValue()),
                            "shirt_number": parseInt(this.byId("idshirt_number").getValue()),
                            "position": this.byId("idposition").getValue(),
                            "nationality": this.byId("idnationality").getValue(),
                            
                        });
                        oContext.created()
                        .then(()=>{
                                // that._focusItem(oList, oContext);
                                this.getView().byId("OpenDialog").close();
                        });
  
        /*        }else {
                    MessageToast.show("So cannot be blank");
                }*/
    
            },
            onEditMode: function(){
                if(!this.oReadEmpFragment)
                {

                  //  var oSelected = this.byId("table0").getSelectedItem();
                    this.oReadEmpFragment =  new sap.ui.xmlfragment("com.nttfc.nttfc.fragment.UpdateForm",this)
                    var myForm = sap.ui.getCore().byId("cFragmentMyform")
                    myForm.bindElement("mainModel>/"+this.oPath)
                    this.getView().addDependent(this.oReadEmpFragment)
                    this.oReadEmpFragment.open()
                }
                else{
                    this.oReadEmpFragment.open()
                }
           },
           oCloseUpdateButton:function()
            {
                this.oReadEmpFragment.close()
                this.oReadEmpFragment.destroy(true)
                this.oReadEmpFragment = null
            },
           onDelete: function(){

            var oSelected = this.byId("table0").getSelectedItem();
            if(oSelected){
                var oSalesOrder = oSelected.getBindingContext("mainModel").getObject().soNumber;
            
                oSelected.getBindingContext("mainModel").delete("$auto").then(function () {
                    MessageToast.show(oSalesOrder + " SuccessFully Deleted");
                }.bind(this), function (oError) {
                    MessageToast.show("Deletion Error: ",oError);
                });
            } else {
                MessageToast.show("Please Select a Row to Delete");
            }
            
        },
        onUpdate:function() // FOR UPDATING RECORD *************
            {
                var oSelected = this.byId("table0").getSelectedItem();
                var IDEdit = oSelected.getBindingContext("mainModel").getObject().ID;
                var AgeEdit = sap.ui.getCore().byId('_IDGenInput3').getValue()
                var HeightEdit =  sap.ui.getCore().byId('_IDGenInput2').getValue()
                var NameEdit = sap.ui.getCore().byId('_IDGenInput1').getValue()
                var oEditData ={}  
                oEditData.name = NameEdit
                oEditData.height = HeightEdit
                oEditData.age = AgeEdit
                this.getView().getModel().update("mainModel>/Players('" + IDEdit + "')",
                oEditData,{ method:"PUT", success:function (odata, Response){
                    if (odata !== "" || odata !== undefined) {
                        MessageBox.success("Updated successfully.");
                    } else {
 //                       MessageBox.error("Not updated.");
                    }
                },
                error: function (odata){
                    MessageToast.show(odata);
                }
                });
            },
            
        });
    });
