const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Invoices } = this.entities;

    // GET Operation (Retrieve all Invoices)
    this.on('READ', Invoices, async (req) => {
        return SELECT.from(Invoices);
    });

    this.on('CREATE', Invoices, async (req) => {
        const data = req.data;
    
        // 데이터베이스가 자동으로 ID를 생성하도록 설정되었으므로 별도의 ID 설정이 필요 없음
        try {
            const result = await INSERT.into(Invoices).entries(data);
            return result;
        } catch (err) {
            console.error("Error while creating invoice:", err);
            req.error(500, "Invoice 생성 중 오류 발생.");
        }
    });
    
    

    // PATCH Operation (Update an existing Invoice)
    this.on('UPDATE', Invoices, async (req) => {
        const { InvoiceID } = req.params[0];
        const data = req.data;
        return UPDATE(Invoices).set(data).where({ InvoiceID });
    });

    this.on('DELETE', Invoices, async (req) => {
        // URL에서 파라미터를 추출
        const invoiceId = req.params[0]; // 또는 req.data.InvoiceID와 같이 사용 가능
        
        try {
            // InvoiceID가 유효한지 검사
            if (!invoiceId || isNaN(invoiceId)) {
                req.error(400, "유효하지 않은 InvoiceID입니다.");
            }
    
            // InvoiceID를 사용하여 레코드를 삭제합니다.
            const result = await DELETE.from(Invoices).where({ InvoiceID: invoiceId });
    
            // 삭제된 레코드 수를 확인하여 성공 여부를 판단합니다.
            if (result.affectedRows === 0) {
                req.error(404, "해당 ID의 Invoice가 존재하지 않습니다.");
            }
    
            return result;
        } catch (err) {
            console.error("Error while deleting invoice:", err);
            req.error(500, "Invoice 삭제 중 오류 발생.");
        }
    });
    

    // Increment ViewCount whenever an invoice is viewed
    this.before('READ', Invoices, async (req) => {
        const { InvoiceID } = req.params[0];
        if (InvoiceID) {
            await UPDATE(Invoices).set('ViewCount += 1').where({ InvoiceID });
        }
    });
});
