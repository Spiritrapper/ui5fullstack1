const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cds = require('@sap/cds');
const app = express();
const port = 4005;

// CORS 설정
app.use(cors({
    origin: 'https://port4005-workspaces-ws-z7sjw.us10.trial.applicationstudio.cloud.sap',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // 일반적인 헤더 설정
    credentials: true
}));

// JSON 바디 파서 설정
app.use(express.json());

// SAP HANA OData 서비스 URL
const hanaODataUrl = 'https://f5955ccb-24fb-47df-b054-e4be1074e990.hana.trial-us10.hanacloud.ondemand.com/InvoiceService/odata/v4/Invoices/';

// OData Service Endpoint
app.use('/InvoiceService/odata/v4/Invoices/', async (req, res) => {
    try {
        // 요청 URL을 SAP HANA OData 서비스로 프록시합니다.
        const response = await axios({
            method: req.method,
            url: `${hanaODataUrl}${req.url}`,
            headers: req.headers,
            data: req.body
        });
        
        // 응답을 클라이언트에게 전달합니다.
        res.status(response.status).json(response.data);
    } catch (error) {
        // 에러 처리
        console.error('Error fetching data from SAP HANA:', error);
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
});

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// CAP 서비스 등록
app.use('/api', cds.service.impl('srv/requestService'));

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
