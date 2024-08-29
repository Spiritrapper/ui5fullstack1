### 간단한 테이블이 있는 앱: 툴바에 새로고침 버튼 추가
#### 코딩
이 튜토리얼의 Step 2 파일을 다운로드하여 모든 파일을 확인하고 다운로드할 수 있습니다.

#### `webapp/controller/App.controller.js`

```javascript
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		onInit : function () {
			var oJSONData = {
				busy : false
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
		},

		onRefresh : function () {
			var oBinding = this.byId("peopleList").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},

		_getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

		}
	});
});
```

이 코드에서는 `onRefresh` 이벤트 핸들러를 컨트롤러에 추가합니다. 이 메서드에서 테이블의 현재 데이터 바인딩을 가져옵니다. 바인딩에 저장되지 않은 변경 사항이 있으면 에러 메시지를 표시하고, 그렇지 않으면 `refresh()`를 호출하여 성공 메시지를 표시합니다.

**참고**: 현재 단계에서는 앱에 저장되지 않은 변경 사항이 없으므로 에러 메시지가 발생하지 않습니다. 이 부분은 Step 6에서 변경될 예정입니다.

또한, `i18n` 모델에서 번역 가능한 텍스트를 가져오기 위해 `_getText`라는 비공개 메서드도 추가합니다.

#### `webapp/view/App.view.xml`

```xml
<Page title="{i18n>peoplePageTitle}">
	<content>
		<Table
			id="peopleList"
			growing="true"
			growingThreshold="10"
			items="{
				path: '/People'
			}">
			<headerToolbar>
				<OverflowToolbar>
					<content>
						<ToolbarSpacer/>
						<Button
							id="refreshUsersButton"
							icon="sap-icon://refresh"
							tooltip="{i18n>refreshButtonText}"
							press=".onRefresh"/>
					</content>
				</OverflowToolbar>
			</headerToolbar>

			<columns>
				<!-- 여기에 테이블 열 정의가 포함됩니다 -->
			</columns>
		</Table>
	</content>
</Page>
```

이 코드에서는 테이블에 단일 버튼이 포함된 `headerToolbar`를 추가합니다. 이 버튼에는 `onRefresh`라는 이벤트 핸들러가 연결되어 있습니다.

#### `webapp/i18n/i18n.properties`

```properties
# Toolbar
#XTOL: Tooltip for refresh data
refreshButtonText=Refresh Data

# Messages
#XMSG: Message for refresh failed
refreshNotPossibleMessage=Before refreshing, please save or revert your changes

#XMSG: Message for refresh succeeded
refreshSuccessMessage=Data refreshed
```

이 파일에서는 툴팁과 메시지 텍스트를 속성 파일에 추가합니다.

#### 내부 작동 원리
클라이언트-서버 통신에 대한 더 깊은 통찰을 얻기 위해 브라우저 개발자 도구의 콘솔 탭을 열고 앱을 다시 로드합니다.

**참고**: 실제 앱에서 클라이언트-서버 통신을 모니터링하려면 개발자 도구의 네트워크 탭을 사용합니다.

이 튜토리얼에서는 모든 환경에서 코드를 실행할 수 있도록 실제 OData 서비스 대신 모의 서버를 사용합니다. 모의 서버는 네트워크 트래픽을 생성하지 않으므로 통신을 모니터링하기 위해 콘솔 탭을 사용합니다.

실제 서비스를 사용하려면 다음 단계를 따릅니다:

1. `index.html` 파일에서 `data-sap-ui-on-init="module:sap/ui/core/tutorial/odatav4/initMockServer"` 라인을 제거합니다.
2. `manifest.json` 파일에서 기본 데이터 소스의 URI를 확인합니다. 환경에 따라 CORS(크로스 오리진 리소스 공유) 문제를 피하기 위해 URI를 변경해야 할 수도 있습니다. 자세한 내용은 "Request Fails Due to Same-Origin Policy (Cross-Origin Resource Sharing - CORS)"를 참조하십시오.

모의 서버 요청에 대해 다음과 같은 내용을 확인합니다:

- `https://services.odata.org/TripPinRESTierService/(S(id))/$metadata`

이 첫 번째 요청은 서비스의 엔터티를 설명하는 메타데이터를 가져옵니다. 서버는 "Person"이라는 엔터티 유형과 UserName, FirstName, LastName, Age와 같은 여러 속성을 포함한 엔터티를 설명하는 XML 파일로 응답합니다.

**참고**: URL에 세션 ID(S(id))가 포함되어 있습니다. 공개된 TripPin 서비스는 여러 사용자가 동시에 사용할 수 있으므로 세션 ID는 다른 소스에서의 읽기 및 쓰기 요청을 구분합니다. 다른 ID를 사용할 수도 있고, 세션 ID를 지정하지 않고 서비스를 요청할 수도 있습니다. 후자의 경우 새 랜덤 세션 ID가 포함된 응답을 받게 됩니다.

- `https://services.odata.org/TripPinRESTierService/(S(id))/People?$select=Age,FirstName,LastName,UserName&$skip=0&$top=10`

두 번째 요청은 OData 서비스에서 처음 10개의 엔터티를 가져옵니다. 테이블 구현에서 `growingThreshold="10"` 설정으로 인해 `/people` 경로에서 한 번에 10개의 엔터티만 가져옵니다. 추가 데이터는 사용자 인터페이스에서 요청될 때만 로드됩니다(`growing="true"`). 따라서 `$skip=0&$top=10`을 사용하여 한 번에 10개의 엔터티만 요청합니다.

이 요청은 $select 쿼리 옵션을 사용하여 응답에 포함될 필드를 명시적으로 지정합니다. TripPin 서비스에는 People 엔터티 집합에 더 많은 필드가 있지만, 응답에는 이 네 개의 필드만 포함됩니다. 이는 OData V4 모델의 기능인 "자동 $select 결정" 또는 "auto-$select"의 일부입니다. 이는 응답 크기를 필요한 만큼으로 제한하는 데 도움이 됩니다. ODataModel은 컨트롤에 지정된 바인딩 경로에서 필요한 필드를 계산합니다. 이 기능은 기본적으로 활성화되지 않습니다. 이 예에서는 `manifest.json` 파일에서 모델을 인스턴스화할 때 `autoExpandSelect` 속성을 true로 설정하여 이 기능을 활성화합니다.