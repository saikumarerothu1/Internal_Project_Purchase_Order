sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, History, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("visionelectronicpurchaseorder.controller.View3", {

        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView3").attachPatternMatched(this._onPatternMatched, this);

            // ✅ FIX: Set logo src here — works reliably in HTML5, Work Zone, and BTP
            const sLogoPath = sap.ui.require.toUrl("visionelectronicpurchaseorder/images/Pro.png");
            const oLogo = this.byId("v3_imgCompanyLogo");
            if (oLogo) {
                oLogo.setSrc(sLogoPath);
            }
        },

        _onPatternMatched(oEvent) {
            const oArgs = oEvent.getParameter("arguments");

            const sPONumber = oArgs.poNumber;
            const sPOItem   = oArgs.poItem;

            this._sPONumber = sPONumber;
            this._sPOItem   = sPOItem;

            const sPath = `/Z_PURCHASE_ORDER(PONumber='${sPONumber}',POItem='${sPOItem}')`;
            this.getView().bindElement({
                path: sPath,
                events: {
                    dataReceived: (oEvt) => {
                        const oData = oEvt.getParameter("data");
                        if (!oData) {
                            sap.m.MessageToast.show("No data found for this Purchase Order.");
                        } else {
                            this._filterItemsTable(sPONumber);
                        }
                    },
                    change: () => {
                        this._filterItemsTable(sPONumber);
                    }
                }
            });

            setTimeout(() => this._filterItemsTable(sPONumber), 1500);
        },

        _filterItemsTable(sPONumber) {
            const oTable   = this.byId("v3_tblPOItems");
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            oBinding.filter([
                new Filter("PONumber", FilterOperator.EQ, sPONumber)
            ]);

            oBinding.attachEventOnce("dataReceived", () => {
                this._calculateTotalsFromTable();
            });

            setTimeout(() => this._calculateTotalsFromTable(), 800);
        },

        _calculateTotalsFromTable() {
            const oTable   = this.byId("v3_tblPOItems");
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            const aContexts = oBinding.getContexts();
            if (!aContexts || aContexts.length === 0) return;

            let fTotalAmount = 0;
            let fTaxPercent  = 0;
            let sTaxCode     = "";

            aContexts.forEach((oCtx) => {
                const oItem   = oCtx.getObject();
                fTotalAmount += parseFloat(oItem.POOrderValue || 0);
                fTaxPercent   = parseFloat(oItem.TaxPercent   || 0);
                sTaxCode      = (oItem.TaxCode || "").toUpperCase().trim(); // ✅ read TaxCode
            });

            const fTaxValue   = (fTotalAmount * fTaxPercent) / 100;
            const fGrandTotal = fTotalAmount + fTaxValue;

            // ✅ Tax label visibility based on TaxCode
            const oIGSTRow    = this.byId("v3_hboxSummaryIGST");
            const oCGSTRow    = this.byId("v3_hboxSummaryCGST");
            const oSGSTRow    = this.byId("v3_hboxSummarySGST");
            const oDefaultRow = this.byId("v3_hboxSummaryTax");

            if (sTaxCode === "V1") {
                // Show IGST only
                oIGSTRow.setVisible(true);
                oCGSTRow.setVisible(false);
                oSGSTRow.setVisible(false);
                oDefaultRow.setVisible(false);
                this.byId("v3_valSummaryIGST").setText(fTaxPercent.toFixed(2) + "%");

            } else if (sTaxCode === "V5") {
                // Show CGST + SGST as percentage (9% each)
                const fHalfPercent = fTaxPercent / 2;
                oIGSTRow.setVisible(false);
                oCGSTRow.setVisible(true);
                oSGSTRow.setVisible(true);
                oDefaultRow.setVisible(false);
                this.byId("v3_valSummaryCGST").setText(fHalfPercent.toFixed(2) + "%");
                this.byId("v3_valSummarySGST").setText(fHalfPercent.toFixed(2) + "%");

            } else {
                // Default — show Tax% row
                oIGSTRow.setVisible(false);
                oCGSTRow.setVisible(false);
                oSGSTRow.setVisible(false);
                oDefaultRow.setVisible(true);
                this.byId("v3_valSummaryTax").setText(fTaxPercent.toFixed(2) + "%");
            }

            // Amount fields (unchanged)
            const oSummaryAmt    = this.byId("v3_valSummaryAmount");
            const oSummaryTaxAmt = this.byId("v3_valSummaryTaxAmt");
            const oSummaryTotal  = this.byId("v3_valSummaryTotal");

            if (oSummaryAmt)    oSummaryAmt.setText(fTotalAmount.toFixed(2));
            if (oSummaryTaxAmt) oSummaryTaxAmt.setText(fTaxValue.toFixed(2));
            if (oSummaryTotal)  oSummaryTotal.setText(fGrandTotal.toFixed(2));
        },

        onNavBack() {
            const oHistory      = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView2", {}, true);
            }
        },

        onPrintPO() {
            const oView    = this.getView();
            const oContext = oView.getBindingContext();

            if (!oContext) {
                sap.m.MessageToast.show("No Purchase Order data available to print");
                return;
            }

            const oData = oContext.getObject();

            // ✅ Same toUrl() used for print — logo works in all environments
            const sLogoPath = sap.ui.require.toUrl("visionelectronicpurchaseorder/images/Pro.png");

            const oTable    = this.byId("v3_tblPOItems");
            const oBinding  = oTable.getBinding("items");
            const aContexts = oBinding ? oBinding.getContexts() : [];

            let sItemRows    = "";
            let fTotalAmount = 0;
            let fTaxPercent  = 0;
            let sTaxCode     = ""; // ✅ read TaxCode for print

            aContexts.forEach((oCtx) => {
                const oItem       = oCtx.getObject();
                const fQty        = parseFloat(oItem.OrderedQuantity || 0);
                const fOrderValue = parseFloat(oItem.POOrderValue    || 0);
                const fUnitPrice  = fQty > 0 ? fOrderValue / fQty : 0;
                fTotalAmount     += fOrderValue;
                fTaxPercent       = parseFloat(oItem.TaxPercent || 0);
                sTaxCode          = (oItem.TaxCode || "").toUpperCase().trim();

                sItemRows += `
                    <tr>
                        <td>${oItem.POItem        || ''}</td>
                        <td>${oItem.Material      || ''}</td>
                        <td style="text-align:center;">${fQty}</td>
                        <td style="text-align:right;">${fUnitPrice.toFixed(2)}</td>
                        <td>${oItem.DeliveryDate  || ''}</td>
                        <td style="text-align:right;">${fOrderValue.toFixed(2)}</td>
                    </tr>`;
            });

            const fTaxValue   = (fTotalAmount * fTaxPercent) / 100;
            const fGrandTotal = fTotalAmount + fTaxValue;

            // ✅ Build tax label rows for print based on TaxCode
            let sTaxLabelRow = "";
            if (sTaxCode === "V1") {
                sTaxLabelRow = `
                    <div class="summary-row">
                        <span class="summary-label">IGST (18%):</span>
                        <span class="summary-value">${fTaxPercent.toFixed(2)}%</span>
                    </div>`;
            } else if (sTaxCode === "V5") {
                const fHalfPercent = fTaxPercent / 2;
                sTaxLabelRow = `
                    <div class="summary-row">
                        <span class="summary-label">CGST (9%):</span>
                        <span class="summary-value">${fHalfPercent.toFixed(2)}%</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">SGST (9%):</span>
                        <span class="summary-value">${fHalfPercent.toFixed(2)}%</span>
                    </div>`;
            } else {
                sTaxLabelRow = `
                    <div class="summary-row">
                        <span class="summary-label">Tax%:</span>
                        <span class="summary-value">${fTaxPercent.toFixed(2)}%</span>
                    </div>`;
            }

            const sSupplierAddress = [oData.SupplierStreet, oData.SupplierCity, oData.SupplierCountry].filter(Boolean).join(', ');
            const sDeliveryAddress = [oData.DeliveryStreet, oData.DeliveryCity, oData.DeliveryCountry].filter(Boolean).join(', ');

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Purchase Order - ${oData.PONumber || ''}</title>
                    <style>
                        @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: Arial, sans-serif; font-size: 12px;
                            color: #333; background: white;
                            -webkit-print-color-adjust: exact; print-color-adjust: exact;
                        }
                        .page {
                            page-break-after: always; padding: 5px;
                            padding-bottom: 40px; position: relative; min-height: 240mm;
                        }
                        .page:last-child { page-break-after: avoid; }
                        .header {
                            display: table; width: 100%;
                            padding-bottom: 8px; border-bottom: 2px solid #0854a0; margin-bottom: 12px;
                        }
                        .logo-section { display: table-cell; width: 20%; vertical-align: middle; }
                        .logo-section img { max-width: 80px; height: auto; }
                        .company-name-section {
                            display: table-cell; width: 80%; text-align: right;
                            vertical-align: middle; font-size: 18px; font-weight: bold; color: #0854a0;
                        }
                        .po-title {
                            text-align: center; font-size: 20px; font-weight: bold;
                            margin: 12px 0 14px 0; letter-spacing: 1px; color: #111;
                        }
                        .info-section { display: table; width: 100%; margin-bottom: 15px; table-layout: fixed; }
                        .info-left { display: table-cell; width: 55%; vertical-align: top; padding-right: 15px; }
                        .info-right { display: table-cell; width: 45%; vertical-align: top; }
                        .info-row { display: flex; align-items: flex-start; margin: 6px 0; font-size: 12px; line-height: 1.5; }
                        .info-label { font-weight: bold; min-width: 175px; max-width: 175px; flex-shrink: 0; }
                        .info-value { flex: 1; word-wrap: break-word; overflow-wrap: break-word; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th {
                            background-color: #0854a0; color: white; padding: 8px 6px;
                            text-align: left; font-size: 12px; border: 1px solid #0854a0; font-weight: bold;
                        }
                        td { padding: 8px 6px; border: 1px solid #ccc; font-size: 12px; }
                        tbody tr:nth-child(even) { background-color: #f5f5f5; }
                        .summary-wrapper {
                            display: flex; justify-content: flex-end;
                            margin-top: 8px; border-top: 2px solid #0854a0; padding-top: 8px;
                        }
                        .summary-box { width: 260px; }
                        .summary-row { display: table; width: 100%; margin: 5px 0; }
                        .summary-label { display: table-cell; width: 55%; font-weight: bold; font-size: 12px; }
                        .summary-value { display: table-cell; width: 45%; text-align: right; font-size: 12px; }
                        .page-footer {
                            position: fixed; bottom: 0; left: 0; right: 0;
                            padding: 8px 15mm; border-top: 1px solid #0854a0;
                            display: flex; justify-content: space-between;
                            align-items: center; font-size: 10px; color: #0854a0; background: white;
                        }
                        .footer-company { font-weight: bold; font-size: 10px; color: #0854a0; }
                        .footer-confidential { font-size: 9px; color: #999; }
                        .footer-page { font-size: 10px; color: #0854a0; }
                        .tc-title {
                            text-align: center; font-size: 14px; font-weight: bold;
                            margin: 10px 0 14px 0; letter-spacing: 1px; color: #111;
                        }
                        .tc-section-title { font-weight: bold; font-size: 12px; margin: 10px 0 4px 0; }
                        .tc-text { font-size: 12px; line-height: 1.6; text-align: justify; margin-bottom: 4px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-footer">
                        <span class="footer-company">Vision Electronics Pvt Ltd</span>
                        <span class="footer-confidential">Confidential — For Authorized Use Only</span>
                        <span class="footer-page">PO: ${oData.PONumber || ''}</span>
                    </div>
                    <div class="page">
                        <div class="header">
                            <div class="logo-section"><img src="${sLogoPath}" alt="Vision Logo"/></div>
                            <div class="company-name-section">Vision Electronics Pvt Ltd</div>
                        </div>
                        <div class="po-title">PURCHASE ORDER</div>
                        <div class="info-section">
                            <div class="info-left">
                                <div class="info-row"><span class="info-label">PO Number:</span><span class="info-value">${oData.PONumber || ''}</span></div>
                                <div class="info-row"><span class="info-label">Supplier Name:</span><span class="info-value">${oData.SupplierName || ''}</span></div>
                                <div class="info-row"><span class="info-label">Supplier Address:</span><span class="info-value">${sSupplierAddress}</span></div>
                                <div class="info-row"><span class="info-label">Delivery Address (Plant):</span><span class="info-value">${sDeliveryAddress}</span></div>
                                <div class="info-row"><span class="info-label">Purchasing Org:</span><span class="info-value">${oData.PurchaseOrg || ''}</span></div>
                            </div>
                            <div class="info-right">
                                <div class="info-row"><span class="info-label">PO Date:</span><span class="info-value">${oData.PODate || ''}</span></div>
                                <div class="info-row"><span class="info-label">Purchase Group:</span><span class="info-value">${oData.PurchaseGrp || ''}</span></div>
                                <div class="info-row"><span class="info-label">Payment Terms:</span><span class="info-value">${oData.PaymentTerms || ''}</span></div>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item No</th><th>Material</th>
                                    <th style="text-align:center;">Quantity</th>
                                    <th style="text-align:right;">Unit Price</th>
                                    <th>Delivery Date</th>
                                    <th style="text-align:right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>${sItemRows}</tbody>
                        </table>
                        <div class="summary-wrapper">
                            <div class="summary-box">
                                <div class="summary-row">
                                    <span class="summary-label">Amount:</span>
                                    <span class="summary-value">${fTotalAmount.toFixed(2)}</span>
                                </div>
                                ${sTaxLabelRow}
                                <div class="summary-row">
                                    <span class="summary-label">Tax Amount:</span>
                                    <span class="summary-value">${fTaxValue.toFixed(2)}</span>
                                </div>
                                <div class="summary-row">
                                    <span class="summary-label">Total Amount:</span>
                                    <span class="summary-value">${fGrandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="page">
                        <div class="header">
                            <div class="logo-section"><img src="${sLogoPath}" alt="Vision Logo"/></div>
                            <div class="company-name-section">Vision Electronics Pvt Ltd</div>
                        </div>
                        <div class="tc-title">TERMS AND CONDITIONS</div>
                        <div class="tc-section-title">DEFINITIONS:</div>
                        <p class="tc-text">Buyer means the company as specified in the Purchase Order.</p>
                        <p class="tc-text">Confidential Information means all non-public information shared between the parties.</p>
                        <p class="tc-text">Delivery Date means the date when the goods are delivered to the Buyer.</p>
                        <p class="tc-text">Warranty Period means 12 months from the later of delivery or acceptance.</p>
                        <div class="tc-section-title">APPLICATION OF TERMS:</div>
                        <p class="tc-text">Supplier agrees to deliver goods and/or perform services as described in the Purchase Order strictly according to these terms and conditions.</p>
                        <p class="tc-text">Any different or additional terms in the Supplier's quotation, acknowledgement, or other documents are rejected unless expressly agreed in writing by the Buyer.</p>
                        <p class="tc-text">The Purchase Order is non-exclusive. The Buyer may procure similar goods/services from other suppliers.</p>
                        <div class="tc-section-title">CANCELLATION OR CHANGE OF PURCHASE ORDERS:</div>
                        <p class="tc-text">The Buyer may cancel or modify any Purchase Order at any time before shipment without any charges or penalties. Any changes will be communicated in writing.</p>
                        <div class="tc-section-title">CHANGES:</div>
                        <p class="tc-text">Buyer may request changes to specification, quantity, or delivery schedule. Adjustments in price or timeline must be agreed in writing through a Purchase Order amendment.</p>
                        <div class="tc-section-title">COMPLIANCE:</div>
                        <p class="tc-text">Supplier shall comply with all applicable laws, safety norms, environmental regulations, and ethical standards.</p>
                        <div class="tc-section-title">CONFIDENTIALITY:</div>
                        <p class="tc-text">All documents, drawings, data, and information shared by the Buyer remain confidential and cannot be disclosed or used for any purpose other than fulfilling the Purchase Order.</p>
                        <div class="tc-section-title">NOTICES:</div>
                        <p class="tc-text">All notices shall be sent to the addresses or emails specified in the Purchase Order and considered delivered as per the communication rules stated therein.</p>
                        <div class="tc-section-title">ENTIRE AGREEMENT:</div>
                        <p class="tc-text">These terms, together with the Purchase Order and attachments, constitute the entire agreement between the parties.</p>
                    </div>
                </body>
                </html>`;

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width    = '0';
            iframe.style.height   = '0';
            iframe.style.border   = 'none';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(printContent);
            iframeDoc.close();

            iframe.contentWindow.onload = function () {
                setTimeout(function () {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    setTimeout(function () {
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 500);
            };
        }
    });
});