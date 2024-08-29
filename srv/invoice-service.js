const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    // 데이터베이스 엔티티를 가져옵니다.
    const { Invoices } = this.entities;

    // READ 요청을 처리합니다.
    this.on('READ', Invoices, async (req) => {
        try {
            // Invoices 테이블에서 모든 데이터를 읽습니다.
            return await SELECT.from(Invoices);
        } catch (error) {
            req.error(500, `Error reading invoices: ${error.message}`);
        }
    });

    // CREATE 요청을 처리합니다.
    this.on('CREATE', Invoices, async (req) => {
        try {
            const { ProductName, Quantity, ShipperName, ExtendedPrice, CurrencyCode, Status } = req.data;

            // 새로운 인보이스를 Invoices 테이블에 삽입합니다.
            await INSERT.into(Invoices).entries({ ProductName, Quantity, ShipperName, ExtendedPrice, CurrencyCode, Status });
            return req.data; // 성공적으로 생성된 데이터를 반환합니다.
        } catch (error) {
            req.error(500, `Error creating invoice: ${error.message}`);
        }
    });

    // UPDATE 요청을 처리합니다.
    this.on('UPDATE', Invoices, async (req) => {
        try {
            const { ID, ...updates } = req.data;

            // Invoices 테이블에서 지정된 ID의 인보이스를 업데이트합니다.
            await UPDATE(Invoices).set(updates).where({ ID });
            return req.data; // 업데이트된 데이터를 반환합니다.
        } catch (error) {
            req.error(500, `Error updating invoice: ${error.message}`);
        }
    });

    // DELETE 요청을 처리합니다.
    this.on('DELETE', Invoices, async (req) => {
        try {
            const { ID } = req.params[0];

            // Invoices 테이블에서 지정된 ID의 인보이스를 삭제합니다.
            await DELETE.from(Invoices).where({ ID });
            return { ID }; // 삭제된 ID를 반환합니다.
        } catch (error) {
            req.error(500, `Error deleting invoice: ${error.message}`);
        }
    });
});
