sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("visionelectronicpurchaseorder.controller.View1", {

        onInit() {
            const oFilterModel = new JSONModel({
                plant    : "",
                porg     : "",
                pgrp     : "",
                material : "",
                vendor   : "",
                poNumber : ""
            });
            this.getView().setModel(oFilterModel, "filterModel");
        },

        // EXECUTE — navigate to View2 with filter params
        // DO NOT use encodeURIComponent — the router handles encoding automatically
        onExecute() {
            const oFM = this.getView().getModel("filterModel");

            // Use "_" as a safe empty placeholder so the route pattern always matches
            const oParams = {
                plant    : oFM.getProperty("/plant")     || "_",
                porg     : oFM.getProperty("/porg")      || "_",
                pgrp     : oFM.getProperty("/pgrp")      || "_",
                material : oFM.getProperty("/material")  || "_",
                vendor   : oFM.getProperty("/vendor")    || "_",
                poNumber : oFM.getProperty("/poNumber")  || "_"
            };

            this.getOwnerComponent().getRouter().navTo("RouteView2", oParams);
        },

        // RESET
        onReset() {
            this.getView().getModel("filterModel").setData({
                plant    : "",
                porg     : "",
                pgrp     : "",
                material : "",
                vendor   : "",
                poNumber : ""
            });
        }
    });
});