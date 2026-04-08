sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/routing/History",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/ViewSettingsDialog",
    "sap/m/ViewSettingsItem"
], (Controller, Filter, FilterOperator, Sorter, History, ColumnListItem, Text, ViewSettingsDialog, ViewSettingsItem) => {
    "use strict";

    return Controller.extend("visionelectronicpurchaseorder.controller.View2", {

        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched(oEvent) {
            const oArgs = oEvent.getParameter("arguments");

            // Store clean filter values — "_" placeholder means empty
            this._oFilters = {
                plant    : this._clean(oArgs.plant),
                porg     : this._clean(oArgs.porg),
                pgrp     : this._clean(oArgs.pgrp),
                material : this._clean(oArgs.material),
                vendor   : this._clean(oArgs.vendor),
                poNumber : this._clean(oArgs.poNumber)
            };

            // Rebind the table with filters — ensures only ONE filtered OData request
            this._rebindTable();
        },

        /**
         * Rebind table items with filters baked in from the start.
         * Prevents the initial unfiltered OData V4 request.
         */
        _rebindTable() {
            const oTable   = this.byId("v2_purchaseOrderTable");
            const aFilters = this._buildFilters();

            oTable.bindItems({
                path      : "/Z_PURCHASE_ORDER",
                filters   : aFilters,
                template  : this._createRowTemplate(),
                parameters: {
                    $count: true
                }
            });
        },

        /**
         * Creates the ColumnListItem row template matching View2 columns.
         */
        _createRowTemplate() {
            return new ColumnListItem({
                type  : "Navigation",
                press : this.onRowPress.bind(this),
                cells : [
                    new Text({ text: "{Material}" }),
                    new Text({ text: "{Vendor}" }),
                    new Text({ text: "{PRNumber}" }),
                    new Text({ text: "{PRItem}" }),
                    new Text({ text: "{PONumber}" }),
                    new Text({ text: "{POItem}" }),
                    new Text({ text: "{OrderedQuantity}" }),
                    new Text({ text: "{POOrderValue}" }),
                    new Text({ text: "{GRNo}" }),
                    new Text({ text: "{GRLineItem}" }),
                    new Text({ text: "{GRDate}" }),
                    new Text({ text: "{GRQuantity}" }),
                    new Text({ text: "{InvoiceNo}" }),
                    new Text({ text: "{InvoiceItem}" }),
                    new Text({ text: "{InvoiceDate}" }),
                    new Text({ text: "{InvoiceQuantity}" }),
                    new Text({ text: "{InvoiceAmt}" })
                ]
            });
        },

        /**
         * Build OData filter array from stored filter values.
         */
        _buildFilters() {
            const f = this._oFilters || {};
            const aFilters = [];

            // Plant — EQ single value
            if (f.plant) {
                aFilters.push(new Filter("DeliveryPlant", FilterOperator.EQ, f.plant));
            }

            // Purchase Org — EQ single value
            if (f.porg) {
                aFilters.push(new Filter("PurchaseOrg", FilterOperator.EQ, f.porg));
            }

            // Purchase Group — EQ single value
            if (f.pgrp) {
                aFilters.push(new Filter("PurchaseGrp", FilterOperator.EQ, f.pgrp));
            }

            // Material — EQ single value
            if (f.material) {
                aFilters.push(new Filter("Material", FilterOperator.EQ, f.material));
            }

            // Vendor — EQ single value
            if (f.vendor) {
                aFilters.push(new Filter("Vendor", FilterOperator.EQ, f.vendor));
            }

            // PO Number — EQ single value
            if (f.poNumber) {
                aFilters.push(new Filter("PONumber", FilterOperator.EQ, f.poNumber));
            }

            return aFilters;
        },

        /**
         * Treat "_" placeholder and whitespace as empty string.
         */
        _clean(sVal) {
            if (!sVal) return "";
            const sTrimmed = sVal.trim();
            return sTrimmed === "_" ? "" : sTrimmed;
        },

        // ROW PRESS — navigate to View3 (PO Detail)
        onRowPress(oEvent) {
            const oItem    = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (!oContext) return;

            const sPONumber = oContext.getProperty("PONumber");
            const sPOItem   = oContext.getProperty("POItem");

            if (!sPONumber) {
                sap.m.MessageToast.show("Unable to navigate - missing key fields");
                return;
            }

            this.getOwnerComponent().getRouter().navTo("RouteView3", {
                poNumber : sPONumber,
                poItem   : sPOItem
            });
        },

        // BACK to Selection Screen (View1)
        onNavBack() {
            const oHistory      = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        // SORT
        onSortPress() {
            if (!this._oSortDialog) {
                this._oSortDialog = new ViewSettingsDialog({
                    title: "Sort",
                    sortItems: [
                        new ViewSettingsItem({ key: "PONumber",      text: "PO Number" }),
                        new ViewSettingsItem({ key: "PRNumber",      text: "PR Number" }),
                        new ViewSettingsItem({ key: "Material",      text: "Material" }),
                        new ViewSettingsItem({ key: "Vendor",        text: "Vendor" }),
                        new ViewSettingsItem({ key: "GRDate",        text: "GR Date" }),
                        new ViewSettingsItem({ key: "InvoiceAmt",    text: "Invoice Amt" }),
                        new ViewSettingsItem({ key: "PODate",        text: "PO Creation Date" }),
                        new ViewSettingsItem({ key: "DeliveryPlant", text: "Plant" }),
                        new ViewSettingsItem({ key: "PurchaseOrg",   text: "Purchase Org" }),
                        new ViewSettingsItem({ key: "PurchaseGrp",   text: "Purchase Group" })
                    ],
                    confirm: this.onSortConfirm.bind(this)
                });
            }
            this._oSortDialog.open();
        },

        onSortConfirm(oEvent) {
            const oTable      = this.byId("v2_purchaseOrderTable");
            const oBinding    = oTable.getBinding("items");
            const sSortPath   = oEvent.getParameter("sortItem").getKey();
            const bDescending = oEvent.getParameter("sortDescending");
            oBinding.sort(new Sorter(sSortPath, bDescending));
        }
    });
});