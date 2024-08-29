namespace demo.request1;

entity Request1 {
    key InvoiceID     : UUID          @title: 'Invoice ID';
    ProductName       : String(111)   @title: 'Product Name';
    Quantity          : Integer       @title: 'Quantity';
    ShipperName       : String(111)   @title: 'Shipper Name';
    ExtendedPrice     : Decimal(9, 2) @title: 'Extended Price';
    CurrencyCode      : String(5)     @title: 'Currency Code';
    Status            : String(10)    @title: 'Status';
}
