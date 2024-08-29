### 앱에 검색 필드, 정렬 기능 추가 및 엔터티 수 표시

이제 앱에는 검색 필드가 추가되었고, 항목을 정렬할 수 있으며, 로드된 엔터티 수와 더 많은 엔터티 수를 확인할 수 있습니다.

### 코딩

**파일 다운로드 및 코드**

아래는 `OData V4 - Step 4`의 코드 파일들입니다.

#### `webapp/controller/App.controller.js`

```javascript
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		onInit : function () {
			var oJSONData = {
				busy : false,
				order : 0  // 현재 정렬 순서를 저장합니다.
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
		},

		onRefresh : function () {
			// 기존 코드
		},

		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter("LastName", FilterOperator.Contains, sValue);

			oView.byId("peopleList").getBinding("items").filter(oFilter, FilterType.Application);
		},

		onSort : function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
		},

		_getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		}
	});
});
```

**설명:**
- `onSearch` 메서드는 검색 필드의 값을 가져와서 `LastName` 필드를 기준으로 필터를 적용합니다. 이 필터는 테이블 바인딩에 적용되어 데이터를 자동으로 필터링합니다.
- `onSort` 메서드는 정렬 순서를 순환적으로 변경하며, 버튼 클릭 시 정렬 순서를 적용합니다. 정렬 순서에 따른 메시지를 표시합니다.
- `order` 속성을 `oJSONData`에 추가하여 현재 정렬 순서를 저장합니다.

#### `webapp/view/App.view.xml`

```xml
<mvc:View
	controllerName="sap.ui.core.tutorial.odatav4.controller.App"
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
	<Shell>
		<App busy="{appView>/busy}" class="sapUiSizeCompact">
			<pages>
				<Page title="{i18n>peoplePageTitle}">
					<content>
						<Table
							id="peopleList"
							growing="true"
							growingThreshold="10"
							items="{
								path: '/People',
								parameters: {
									$count: true
								}
							}">
							<headerToolbar>
								<OverflowToolbar>
									<content>
										<ToolbarSpacer/>
										<SearchField
											id="searchField"
											width="20%"
											placeholder="{i18n>searchFieldPlaceholder}"
											search=".onSearch"/>
										<Button
											id="refreshUsersButton"
											icon="sap-icon://refresh"
											tooltip="{i18n>refreshButtonText}"
											press=".onRefresh"/>
										<Button
											id="sortUsersButton"
											icon="sap-icon://sort"
											tooltip="{i18n>sortButtonText}"
											press="onSort"/>
									</content>
								</OverflowToolbar>
							</headerToolbar>
							<columns>
								<Column id="userNameColumn">
									<Text text="{i18n>userNameLabelText}"/>
								</Column>
								<Column id="firstNameColumn">
									<Text text="{i18n>firstNameLabelText}"/>
								</Column>
								<Column id="lastNameColumn">
									<Text text="{i18n>lastNameLabelText}"/>
								</Column>
								<Column id="ageColumn">
									<Text text="{i18n>ageLabelText}"/>
								</Column>
							</columns>
							<items>
								<ColumnListItem>
									<cells>
										<Input value="{UserName}"/>
									</cells>
									<cells>
										<Input value="{FirstName}"/>
									</cells>
									<cells>
										<Input value="{LastName}"/>
									</cells>
									<cells>
										<Input value="{Age}"/>
									</cells>
								</ColumnListItem>
							</items>
						</Table>
					</content>
				</Page>
			</pages>
		</App>
	</Shell>
</mvc:View>
```

**설명:**
- `$count=true` 파라미터를 추가하여 OData 서비스가 엔터티의 총 수를 반환하도록 설정합니다. 이를 통해 전체 엔터티 수와 현재 표시된 엔터티 수를 확인할 수 있습니다.
- 검색 필드와 정렬 버튼을 `OverflowToolbar`에 추가하고, 각각의 이벤트를 연결합니다.

#### `webapp/i18n/i18n.properties`

```properties
# App Descriptor
...

# Toolbar
#XTOL: Tooltip for refresh data
refreshButtonText=Refresh Data

#XTOL: Tooltip for sort
sortButtonText=Sort by Last Name

#XTXT: Placeholder text for search field
searchFieldPlaceholder=Type in a last name

# Messages
#XMSG: Message for refresh succeeded
refreshSuccessMessage=Data refreshed

#MSG: Suffix for sorting by LastName, ascending
sortAscending=last name, ascending

#MSG: Suffix for sorting by LastName, descending
sortDescending=last name, descending

#MSG: Suffix for no sorting
sortNone=the sequence on the server

#MSG: Message for sorting
sortMessage=Users sorted by {0}
```

**설명:**
- 검색 필드의 플레이스홀더와 정렬 버튼의 툴팁을 추가합니다.
- 정렬 메시지와 관련된 텍스트를 추가하여 정렬 상태에 대한 사용자 알림을 제공합니다.

### 참고 사항
- OData 서비스의 필터는 대소문자를 구분하므로, 대소문자를 구분하지 않는 검색을 원할 경우 컨트롤러 로직에서 구현해야 합니다.
- 필터링과 정렬 기능을 함께 사용할 수 있습니다.