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

            const sLogoPath = sap.ui.require.toUrl("visionelectronicpurchaseorder/images/Pro.png");
            const oLogo     = this.byId("v3_imgCompanyLogo");
            if (oLogo) {
                oLogo.setSrc(sLogoPath);
            }
        },

        _onPatternMatched(oEvent) {
            const oArgs     = oEvent.getParameter("arguments");
            const sPONumber = oArgs.poNumber;
            const sPOItem   = oArgs.poItem;

            this._sPONumber = sPONumber;
            this._sPOItem   = sPOItem;

            // Update snapped title
            const oSnapped = this.byId("v3_txtSnappedPO");
            if (oSnapped) oSnapped.setText(`– ${sPONumber}`);

            const sPath = `/Z_PURCHASE_ORDER(PONumber='${sPONumber}',POItem='${sPOItem}')`;
            this.getView().bindElement({
                path   : sPath,
                events : {
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

            let fTotalAmount    = 0;
            let fTotalTaxAmount = 0;

            aContexts.forEach((oCtx) => {
                const oItem       = oCtx.getObject();
                const fOrderValue = parseFloat(oItem.POOrderValue || 0);
                const fTaxPct     = parseFloat(oItem.TaxPercent   || 0);

                fTotalAmount    += fOrderValue;
                fTotalTaxAmount += (fOrderValue * fTaxPct) / 100;
            });

            const fGrandTotal = fTotalAmount + fTotalTaxAmount;

            const oSummaryAmt    = this.byId("v3_valSummaryAmount");
            const oSummaryTaxAmt = this.byId("v3_valSummaryTaxAmt");
            const oSummaryTotal  = this.byId("v3_valSummaryTotal");

            if (oSummaryAmt)    oSummaryAmt.setText(fTotalAmount.toFixed(2));
            if (oSummaryTaxAmt) oSummaryTaxAmt.setText(fTotalTaxAmount.toFixed(2));
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

            const oData     = oContext.getObject();
            const sLogoPath = sap.ui.require.toUrl("visionelectronicpurchaseorder/images/Pro.png");

            const oTable    = this.byId("v3_tblPOItems");
            const oBinding  = oTable.getBinding("items");
            const aContexts = oBinding ? oBinding.getContexts() : [];

            let sItemRows       = "";
            let fTotalAmount    = 0;
            let fTotalTaxAmount = 0;

            aContexts.forEach((oCtx) => {
                const oItem       = oCtx.getObject();
                const fQty        = parseFloat(oItem.OrderedQuantity || 0);
                const fOrderValue = parseFloat(oItem.POOrderValue    || 0);
                const fUnitPrice  = fQty > 0 ? fOrderValue / fQty : 0;
                const fTaxPct     = parseFloat(oItem.TaxPercent      || 0);
                const fIGST       = parseFloat(oItem.IGST            || 0);
                const fCGST       = parseFloat(oItem.CGST            || 0);
                const fSGST       = parseFloat(oItem.SGST            || 0);
                const fItemTax    = (fOrderValue * fTaxPct) / 100;

                fTotalAmount    += fOrderValue;
                fTotalTaxAmount += fItemTax;

                sItemRows += `
                    <tr>
                        <td>${oItem.POItem       || ''}</td>
                        <td>${oItem.Material     || ''}</td>
                        <td style="text-align:center;">${fQty}</td>
                        <td style="text-align:right;">${fUnitPrice.toFixed(2)}</td>
                        <td>${oItem.DeliveryDate || ''}</td>
                        <td style="text-align:right;">${fIGST.toFixed(2)}%</td>
                        <td style="text-align:right;">${fCGST.toFixed(2)}%</td>
                        <td style="text-align:right;">${fSGST.toFixed(2)}%</td>
                        <td style="text-align:right;">${fTaxPct.toFixed(2)}%</td>
                        <td style="text-align:right;">${fItemTax.toFixed(2)}</td>
                        <td style="text-align:right;">${fOrderValue.toFixed(2)}</td>
                    </tr>`;
            });

            const fGrandTotal      = fTotalAmount + fTotalTaxAmount;
            const sSupplierAddress = [oData.SupplierStreet, oData.SupplierCity, oData.SupplierCountry].filter(Boolean).join(', ');
            const sDeliveryAddress = [oData.DeliveryStreet, oData.DeliveryCity, oData.DeliveryCountry].filter(Boolean).join(', ');

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Purchase Order - ${oData.PONumber || ''}</title>
                    <style>
                        @page { size: A4 portrait; margin: 12mm 10mm 18mm 10mm; }
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: Arial, sans-serif; font-size: 11px;
                            color: #333; background: white;
                            -webkit-print-color-adjust: exact; print-color-adjust: exact;
                        }
                        .page {
                            page-break-after: always; padding: 4px;
                            padding-bottom: 35px; position: relative; min-height: 250mm;
                        }
                        .page:last-child { page-break-after: avoid; }
                        .header {
                            display: table; width: 100%;
                            padding-bottom: 7px; border-bottom: 2px solid #0854a0; margin-bottom: 10px;
                        }
                        .logo-section { display: table-cell; width: 18%; vertical-align: middle; }
                        .logo-section img { max-width: 70px; height: auto; }
                        .company-name-section {
                            display: table-cell; width: 82%; text-align: right;
                            vertical-align: middle; font-size: 16px; font-weight: bold; color: #0854a0;
                        }
                        .po-title {
                            text-align: center; font-size: 16px; font-weight: bold;
                            margin: 8px 0 10px 0; letter-spacing: 1px; color: #111;
                        }
                        .info-section { display: table; width: 100%; margin-bottom: 10px; table-layout: fixed; }
                        .info-left  { display: table-cell; width: 55%; vertical-align: top; padding-right: 10px; }
                        .info-right { display: table-cell; width: 45%; vertical-align: top; }
                        .info-row { display: flex; align-items: flex-start; margin: 4px 0; font-size: 10.5px; line-height: 1.4; }
                        .info-label { font-weight: bold; min-width: 155px; max-width: 155px; flex-shrink: 0; }
                        .info-value { flex: 1; word-wrap: break-word; overflow-wrap: break-word; }
                        table { width: 100%; border-collapse: collapse; margin: 6px 0; }
                        th {
                            background-color: #0854a0; color: white; padding: 6px 3px;
                            text-align: left; font-size: 9px; border: 1px solid #0854a0; font-weight: bold;
                        }
                        td { padding: 5px 3px; border: 1px solid #ccc; font-size: 9px; }
                        tbody tr:nth-child(even) { background-color: #f5f5f5; }
                        .summary-wrapper {
                            display: flex; justify-content: flex-end;
                            margin-top: 8px; border-top: 2px solid #0854a0; padding-top: 7px;
                        }
                        .summary-box { width: 260px; }
                        .summary-row { display: table; width: 100%; margin: 4px 0; }
                        .summary-label { display: table-cell; width: 55%; font-weight: bold; font-size: 11px; }
                        .summary-value { display: table-cell; width: 45%; text-align: right; font-size: 11px; }
                        .summary-total .summary-label,
                        .summary-total .summary-value {
                            font-size: 12px; font-weight: bold;
                            border-top: 1px solid #0854a0; padding-top: 5px;
                        }
                        .page-footer {
                            position: fixed; bottom: 0; left: 0; right: 0;
                            padding: 6px 10mm; border-top: 1px solid #0854a0;
                            display: flex; justify-content: space-between;
                            align-items: center; background: white;
                        }
                        .footer-company      { font-weight: bold; font-size: 9px; color: #0854a0; }
                        .footer-confidential { font-size: 8px; color: #999; }
                        .footer-page         { font-size: 9px; color: #0854a0; }
                        .tc-title {
                            text-align: center; font-size: 13px; font-weight: bold;
                            margin: 8px 0 12px 0; letter-spacing: 1px; color: #111;
                        }
                        .tc-section-title { font-weight: bold; font-size: 11px; margin: 8px 0 3px 0; }
                        .tc-text { font-size: 11px; line-height: 1.6; text-align: justify; margin-bottom: 3px; }
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
                                    <th style="width:6%;">Item No</th>
                                    <th style="width:13%;">Material</th>
                                    <th style="width:8%;text-align:center;">Qty</th>
                                    <th style="width:9%;text-align:right;">Unit Price</th>
                                    <th style="width:11%;">Del. Date</th>
                                    <th style="width:7%;text-align:right;">IGST%</th>
                                    <th style="width:7%;text-align:right;">CGST%</th>
                                    <th style="width:7%;text-align:right;">SGST%</th>
                                    <th style="width:7%;text-align:right;">Tax%</th>
                                    <th style="width:11%;text-align:right;">Tax Amt</th>
                                    <th style="width:11%;text-align:right;">Amount</th>
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
                                <div class="summary-row">
                                    <span class="summary-label">Tax Amount:</span>
                                    <span class="summary-value">${fTotalTaxAmount.toFixed(2)}</span>
                                </div>
                                <div class="summary-row summary-total">
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