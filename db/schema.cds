namespace my.invoice.app;

entity Invoices {
    key InvoiceID     : UUID          @title: 'Invoice ID';
    ProductName       : String(111)   @title: 'Product Name';
    Quantity          : String(111)   @title: 'Quantity';
    ShipperName       : String(111)   @title: 'Shipper Name';
    ExtendedPrice     : Decimal(9, 2) @title: 'Extended Price';
    CurrencyCode      : String(5)     @title: 'Currency Code';
    Status            : String(10)    @title: 'Status';
    ImageURL          : String(255)   @title: 'Image URL';      // 추가된 필드
    PlotSummary       : String(1000)  @title: 'Plot Summary';   // 추가된 필드
    
    // New fields
    RowNumber         : Integer       @title: 'Row Number' ;     // 추가된 필드
    ViewCount         : Integer       @title: 'View Count' @Default: 0; // Default value set to 0
    Rating            : Decimal(3, 2) @title: 'Rating' @DEFAULT: 0.00 ;   
    AverageRating     : Decimal(3, 2) @title: 'AverageRating' @DEFAULT: 0.00;
}