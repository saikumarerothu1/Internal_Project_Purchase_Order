using Z_PURCHASE_ORDER_SERVICE from './external/Z_PURCHASE_ORDER_SERVICE.cds';

service Z_PURCHASE_ORDER_SERVICE_MAIN {
    @readonly
    entity Z_PURCHASE_ORDER as
        projection on Z_PURCHASE_ORDER_SERVICE.Z_PURCHASE_ORDER {
            key PONumber,
            key POItem,
                PRNumber,
                PRItem,
                Material,
                Vendor,
                OrderedQuantity,
                OrderedUnit,
                POOrderValue,
                Currency,
                TaxCode,
                CGST,
                IGST,
                SGST,
                TaxPercent,
                GRNo,
                GRLineItem,
                GRDate,
                GRQuantity,
                GRUnit,
                InvoiceNo,
                InvoiceItem,
                InvoiceDate,
                InvoiceAmt,
                InvoiceCurrency,
                InvoiceQuantity,
                InvoiceUnit,
                DeliveryDate,
                PODate,
                PurchaseOrg,
                PurchaseGrp,
                PaymentTerms,
                SupplierName,
                SupplierCity,
                SupplierStreet,
                SupplierCountry,
                DeliveryPlant,
                DeliveryCity,
                DeliveryStreet,
                DeliveryCountry
        };
}
