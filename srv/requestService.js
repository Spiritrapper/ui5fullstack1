const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    const { Request } = this.entities;

    // 'before' 이벤트 핸들러를 추가하여 'CREATE' 요청 전에 'request_number'를 설정합니다
    this.before('CREATE', 'Request', async (req) => {
        const lastRequest = await SELECT.one.from(Request).orderBy('request_number desc');
        req.data.request_number = lastRequest ? lastRequest.request_number + 1 : 1;
    });
});
