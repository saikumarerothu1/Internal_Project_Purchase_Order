/* checksum : 347f2e3c7898e44b69ba2d0c845bbee8 */
@cds.external : true
@CodeList.CurrencyCodes.Url : '../../../../default/iwbep/common/0001/$metadata'
@CodeList.CurrencyCodes.CollectionPath : 'Currencies'
@CodeList.UnitsOfMeasure.Url : '../../../../default/iwbep/common/0001/$metadata'
@CodeList.UnitsOfMeasure.CollectionPath : 'UnitsOfMeasure'
@Aggregation.ApplySupported.Transformations : [ 'aggregate', 'groupby', 'filter' ]
@Aggregation.ApplySupported.Rollup : #None
@Common.ApplyMultiUnitBehaviorForSortingAndFiltering : true
@Capabilities.FilterFunctions : [
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'and',
  'or',
  'contains',
  'startswith',
  'endswith',
  'any',
  'all'
]
@Capabilities.SupportedFormats : [ 'application/json', 'application/pdf' ]
@PDF.Features.DocumentDescriptionReference : '../../../../default/iwbep/common/0001/$metadata'
@PDF.Features.DocumentDescriptionCollection : 'MyDocumentDescriptions'
@PDF.Features.ArchiveFormat : true
@PDF.Features.Border : true
@PDF.Features.CoverPage : true
@PDF.Features.FitToPage : true
@PDF.Features.FontName : true
@PDF.Features.FontSize : true
@PDF.Features.Margin : true
@PDF.Features.Padding : true
@PDF.Features.Signature : true
@PDF.Features.HeaderFooter : true
@PDF.Features.ResultSizeDefault : 20000
@PDF.Features.ResultSizeMaximum : 20000
@Capabilities.KeyAsSegmentSupported : true
@Capabilities.AsynchronousRequestsSupported : true
service Z_PURCHASE_ORDER_SERVICE {
  @cds.external : true
  @cds.persistence.skip : true
  @Common.Label : 'Purchase Order'
  @Capabilities.SearchRestrictions.Searchable : false
  @Capabilities.InsertRestrictions.Insertable : false
  @Capabilities.DeleteRestrictions.Deletable : false
  @Capabilities.UpdateRestrictions.Updatable : false
  @Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
  @Capabilities.FilterRestrictions.FilterExpressionRestrictions : [
    { Property: OrderedQuantity, AllowedExpressions: 'MultiValue' },
    { Property: POOrderValue, AllowedExpressions: 'MultiValue' },
    { Property: GRQuantity, AllowedExpressions: 'MultiValue' },
    { Property: InvoiceAmt, AllowedExpressions: 'MultiValue' },
    { Property: InvoiceQuantity, AllowedExpressions: 'MultiValue' }
  ]
  entity Z_PURCHASE_ORDER {
    @Common.IsUpperCase : true
    @Common.Label : 'Purchasing Document'
    @Common.Heading : 'Pur. Doc.'
    @Common.QuickInfo : 'Purchasing Document Number'
    key PONumber : String(10) not null;
    @Common.IsDigitSequence : true
    @Common.Label : 'Item'
    @Common.QuickInfo : 'Item Number of Purchasing Document'
    key POItem : String(5) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Purchase Requisition'
    @Common.Heading : 'Purch.Req.'
    @Common.QuickInfo : 'Purchase Requisition Number'
    PRNumber : String(10) not null;
    @Common.IsDigitSequence : true
    @Common.Label : 'Item of requisition'
    @Common.Heading : 'Item'
    @Common.QuickInfo : 'Item Number of Purchase Requisition'
    PRItem : String(5) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Material'
    @Common.QuickInfo : 'Material Number'
    Material : String(18) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Supplier'
    @Common.QuickInfo : 'Supplier''s Account Number'
    Vendor : String(10) not null;
    @Measures.Unit : OrderedUnit
    @Common.Label : 'Order Quantity'
    @Common.Heading : 'PO Quantity'
    @Common.QuickInfo : 'Purchase Order Quantity'
    OrderedQuantity : Decimal(13, 3) not null;
    @Common.IsUnit : true
    @Common.Label : 'Order Unit'
    @Common.Heading : 'OUn'
    @Common.QuickInfo : 'Purchase Order Unit of Measure'
    OrderedUnit : String(3) not null;
    @Measures.ISOCurrency : Currency
    @Common.Label : 'Net Order Value'
    @Common.Heading : 'Net Value'
    @Common.QuickInfo : 'Net Order Value in PO Currency'
    POOrderValue : Decimal(precision: 13) not null;
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    Currency : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Tax Code'
    @Common.Heading : 'Tx'
    @Common.QuickInfo : 'Tax on sales/purchases code'
    TaxCode : String(2) not null;
    CGST : Decimal(precision: 34) not null;
    IGST : Decimal(precision: 34) not null;
    SGST : Decimal(precision: 34) not null;
    TaxPercent : Decimal(precision: 34) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Material Document'
    @Common.Heading : 'Mat. Doc.'
    @Common.QuickInfo : 'Number of Material Document'
    GRNo : String(10) not null;
    @Common.IsDigitSequence : true
    @Common.Label : 'Material Doc.Item'
    @Common.Heading : 'Item'
    @Common.QuickInfo : 'Item in Material Document'
    GRLineItem : String(4) not null;
    @Common.Label : 'Posting Date'
    @Common.Heading : 'Pstng Date'
    @Common.QuickInfo : 'Posting Date in the Document'
    GRDate : Date;
    @Measures.Unit : GRUnit
    @Common.Label : 'Quantity'
    GRQuantity : Decimal(13, 3) not null;
    @Common.IsUnit : true
    @Common.Label : 'Order Unit'
    @Common.Heading : 'OUn'
    @Common.QuickInfo : 'Purchase Order Unit of Measure'
    GRUnit : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Invoice Document No.'
    @Common.Heading : 'Doc. No.'
    @Common.QuickInfo : 'Document Number of an Invoice Document'
    InvoiceNo : String(10) not null;
    @Common.IsDigitSequence : true
    @Common.Label : 'Invoice Item'
    @Common.Heading : 'InvItem'
    @Common.QuickInfo : 'Document Item in Invoice Document'
    InvoiceItem : String(6) not null;
    @Common.Label : 'Posting Date'
    @Common.Heading : 'Pstng Date'
    @Common.QuickInfo : 'Posting Date in the Document'
    InvoiceDate : Date;
    @Measures.ISOCurrency : InvoiceCurrency
    @Common.Label : 'Gross Invoice Amount'
    @Common.QuickInfo : 'Gross Invoice Amount in Document Currency'
    InvoiceAmt : Decimal(precision: 13) not null;
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    InvoiceCurrency : String(3) not null;
    @Measures.Unit : InvoiceUnit
    @Common.Label : 'Quantity'
    InvoiceQuantity : Decimal(13, 3) not null;
    @Common.IsUnit : true
    @Common.Label : 'Order Unit'
    @Common.Heading : 'OUn'
    @Common.QuickInfo : 'Purchase Order Unit of Measure'
    InvoiceUnit : String(3) not null;
    @Common.Label : 'Delivery Date'
    @Common.Heading : 'Deliv. Date'
    @Common.QuickInfo : 'Item Delivery Date'
    DeliveryDate : Date;
    @Common.Label : 'Document Date'
    @Common.Heading : 'Doc. Date'
    @Common.QuickInfo : 'Purchasing Document Date'
    PODate : Date;
    @Common.IsUpperCase : true
    @Common.Label : 'Purch. Organization'
    @Common.Heading : 'POrg'
    @Common.QuickInfo : 'Purchasing Organization'
    PurchaseOrg : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Purchasing Group'
    @Common.Heading : 'PGr'
    PurchaseGrp : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Terms of Payment'
    @Common.QuickInfo : 'Terms of Payment Key'
    PaymentTerms : String(4) not null;
    @Common.Label : 'Name'
    @Common.QuickInfo : 'Name 1'
    SupplierName : String(40) not null;
    @Common.Label : 'City'
    SupplierCity : String(40) not null;
    @Common.Label : 'Street'
    SupplierStreet : String(60) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Country/Region Key'
    @Common.Heading : 'C/R'
    SupplierCountry : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Plant'
    @Common.Heading : 'Plnt'
    DeliveryPlant : String(4) not null;
    @Common.Label : 'City'
    DeliveryCity : String(40) not null;
    @Common.Label : 'Street'
    DeliveryStreet : String(60) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Country/Region Key'
    @Common.Heading : 'C/R'
    DeliveryCountry : String(3) not null;
  };
};

