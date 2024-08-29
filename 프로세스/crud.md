위의 XML 뷰 코드는 SAP UI5 애플리케이션에서 "Invoices" 테이블을 정의하고 있습니다. 이 테이블에 대한 CRUD (Create, Read, Update, Delete) 작업을 지원하는 CAP (Cloud Application Programming) 백엔드를 구현하는 방법을 단계별로 설명하겠습니다.

### 1. **CAP 프로젝트 설정**

먼저 CAP 프로젝트를 초기화하고 데이터 모델과 서비스를 정의합니다.

#### a. 프로젝트 초기화

CAP 프로젝트를 초기화합니다:

```bash
mkdir invoice-app
cd invoice-app
cds init
```

#### b. 데이터 모델 정의

`db/schema.cds` 파일을 생성하고, `Invoices` 엔티티를 정의합니다.

```cds
namespace my.invoice.app;

entity Invoices {
    key InvoiceID       : UUID @title: 'Invoice ID';
    ProductName         : String(111) @title: 'Product Name';
    Quantity            : Integer @title: 'Quantity';
    ShipperName         : String(111) @title: 'Shipper Name';
    ExtendedPrice       : Decimal(9,2) @title: 'Extended Price';
    CurrencyCode        : String(5) @title: 'Currency Code';
    Status              : String(10) @title: 'Status';
};
```

#### c. 서비스 정의

`srv/service.cds` 파일을 생성하고, `Invoices` 엔티티를 노출하는 서비스를 정의합니다.

```cds
using my.invoice.app from '../db/schema';

service InvoiceService {
    entity Invoices as projection on my.invoice.app.Invoices;
}
```

#### d. 데이터베이스 및 서비스 실행

SQLite 데이터베이스를 사용하여 데이터를 배포하고 서비스를 실행합니다.

```bash
cds deploy --to sqlite
cds run
```

이렇게 하면 로컬 SQLite 데이터베이스에 테이블이 생성되고 서비스가 실행됩니다.

### 2. **CRUD 핸들러 구현**

`Invoices` 엔티티에 대한 기본 CRUD 작업을 지원하기 위해, 다음과 같은 방법으로 Node.js 핸들러를 작성할 수 있습니다.

#### a. Node.js 서비스 핸들러 생성

`srv/invoice-service.js` 파일을 생성하여 핸들러를 구현합니다.

```javascript
const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
    const { Invoices } = this.entities;

    // CREATE
    this.before('CREATE', 'Invoices', (req) => {
        req.data.InvoiceID = cds.utils.uuid(); // 자동으로 UUID 생성
    });

    // READ (기본적으로 자동 제공됨)

    // UPDATE
    this.before('UPDATE', 'Invoices', async (req) => {
        const invoice = await SELECT.one.from(Invoices).where({ InvoiceID: req.data.InvoiceID });
        if (!invoice) req.error(404, 'Invoice not found');
    });

    // DELETE
    this.before('DELETE', 'Invoices', async (req) => {
        const invoice = await SELECT.one.from(Invoices).where({ InvoiceID: req.data.InvoiceID });
        if (!invoice) req.error(404, 'Invoice not found');
    });
});
```

이 코드는 송장(Invoice) 생성 시 UUID를 자동으로 할당하며, 업데이트 또는 삭제 시 해당 송장이 존재하는지 확인합니다.

### 3. **UI5와 백엔드 연결**

위에서 설정한 CAP 서비스를 UI5 애플리케이션과 연동하여, CRUD 작업을 수행할 수 있습니다.

#### a. OData 모델 설정

`webapp/manifest.json` 파일에서 OData 모델을 설정합니다.

```json
{
    "sap.ui5": {
        "models": {
            "invoice": {
                "type": "sap.ui.model.odata.v2.ODataModel",  
                "dataSource": "invoiceService",
                "preload": true,
                "settings": {
                    "synchronizationMode": "None",
                    "operationMode": "Server",
                    "autoExpandSelect": true,
                    "earlyRequests": true
                }
            },
            "view": {
                "dataSource": "viewData"
            }
        },
        "dataSources": {
            "invoiceService": {
                "uri": "/invoice/",
                "type": "OData",
                "settings": {
                    "odataVersion": "v4"
                }
            },
            "viewData": {
                "type": "sap.ui.model.json.JSONModel",  
                "uri": "/"
            }
        }
    }
}
```

#### b. CRUD 작업을 위한 Controller 구현

`webapp/controller/InvoiceList.controller.js` 파일에서 CRUD 작업을 구현합니다.

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
        onInit: function () {
            this.oModel = this.getView().getModel("invoice");
        },

        onCreateInvoice: function () {
            var oNewInvoice = {
                ProductName: "New Product",
                Quantity: 10,
                ShipperName: "New Shipper",
                ExtendedPrice: 100.0,
                CurrencyCode: "USD",
                Status: "Open"
            };

            this.oModel.create("/Invoices", oNewInvoice, {
                success: function () {
                    MessageToast.show("Invoice created successfully!");
                },
                error: function () {
                    MessageToast.show("Failed to create invoice.");
                }
            });
        },

        onUpdateInvoice: function (oInvoiceID) {
            var oUpdatedInvoice = {
                Status: "Updated"
            };

            this.oModel.update("/Invoices('" + oInvoiceID + "')", oUpdatedInvoice, {
                success: function () {
                    MessageToast.show("Invoice updated successfully!");
                },
                error: function () {
                    MessageToast.show("Failed to update invoice.");
                }
            });
        },

        onDeleteInvoice: function (oInvoiceID) {
            this.oModel.remove("/Invoices('" + oInvoiceID + "')", {
                success: function () {
                    MessageToast.show("Invoice deleted successfully!");
                },
                error: function () {
                    MessageToast.show("Failed to delete invoice.");
                }
            });
        },

        onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("detail", {
                invoicePath: window.encodeURIComponent(oItem.getBindingContext("invoice").getPath().substr(1))
            });
        },

        onFilterInvoices: function (oEvent) {
            var aFilter = [];
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                aFilter.push(new sap.ui.model.Filter("ProductName", sap.ui.model.FilterOperator.Contains, sQuery));
            }
            var oList = this.getView().byId("invoiceList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        }
    });
});
```

위 코드는 UI5 애플리케이션에서 CRUD 작업을 수행할 수 있는 기본적인 기능을 제공합니다. 적절한 이벤트와 연결하여, 사용자 인터페이스를 통해 송장을 생성, 읽기, 수정, 삭제할 수 있습니다.

### 4. **실행 및 테스트**

- `cds watch` 명령어를 사용하여 CAP 서버와 UI5 애플리케이션을 실행합니다.
- UI5 애플리케이션에서 CRUD 작업을 테스트합니다. 예를 들어, 새 송장을 추가하거나, 기존 송장의 정보를 업데이트하고, 필요시 송장을 삭제할 수 있습니다.

이렇게 하면 CAP과 UI5를 이용한 기본적인 CRUD 애플리케이션이 완성됩니다. 이 구조를 바탕으로 더 복잡한 로직이나 UI를 추가하여 확장할 수 있습니다.