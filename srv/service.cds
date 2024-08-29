using my.invoice.app from '../db/schema';

service InvoiceService {
    entity Invoices as projection on app.Invoices;
}

