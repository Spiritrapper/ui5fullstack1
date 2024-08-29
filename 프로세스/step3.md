### OData V4 모델과 SAPUI5 타입

OData V4 모델은 메타데이터 정보를 활용하여 SAPUI5의 데이터 타입을 계산하고, 이 타입을 SAPUI5의 속성 바인딩에 설정합니다. 예를 들어, `<Input value="{Age}"/>` 필드는 OData 타입 `Edm.Int64`에 해당하는 SAPUI5 타입 `Int64`를 사용합니다.

#### 미리 보기

입력 값이 기본 데이터 타입과 일치하지 않으면:

### 코딩

**파일 다운로드 및 코드**

아래는 `OData V4 - Step 3`의 코드 파일들입니다.

#### `webapp/manifest.json`

```json
{
	"_version": "1.12.0",
	"sap.app": { /* 앱 구성 관련 정보 */ },
	"sap.ui": {
		"technology": "UI5",
		"deviceTypes": { /* 디바이스 타입 관련 설정 */ }
	},
	"sap.ui5": {
		"rootView": { /* 루트 뷰 설정 */ },
		"dependencies": { /* 종속성 설정 */ },
		"contentDensities": { /* 콘텐츠 밀도 설정 */ },
		"handleValidation": true,  // 이 설정을 추가하여 SAPUI5 타입에 의해 감지된 유효성 검사 오류가 UI에 표시되도록 합니다.
		"models": { /* 모델 설정 */ }
	},
	/* 기타 설정 */
}
```

`manifest.json` 파일에서 `"handleValidation": true` 설정을 추가합니다. 이 설정을 통해 SAPUI5 타입이 감지한 유효성 검사 오류가 UI에 표시됩니다.

앱을 `index.html` 파일을 사용하여 실행하고, 메타데이터 파일에서 지정된 타입 및 제약 조건과 일치하지 않는 값을 입력해 봅니다. 예를 들어, `Age` 필드에 정수 입력이 필요한데 문자열 값인 "Young at Heart"을 입력하거나, 필수 항목인 사용자 이름(User Name)이나 이름(First Name) 필드를 비워 두면, 잘못된 항목이 강조 표시되고 오류 메시지가 표시됩니다.

**참고:** 바인딩 정보에서 타입을 명시적으로 정의하면 해당 바인딩의 자동 타입 감지가 비활성화됩니다. 예를 들어, 뷰에서 `Age` 필드에 대해 `<Input value="{path:'Age', type:'sap.ui.model.type.String'}"/>`로 변경하면, 서비스 메타데이터에서 제공하는 `Int64` 타입 대신 `String` 타입이 사용됩니다.

#### `localService/metadata.xml`

```xml
<EntityType Name="Person">
	<Key>
		<PropertyRef Name="UserName"/>
	</Key>
	<Property Name="UserName" Type="Edm.String" Nullable="false" />
	<Property Name="FirstName" Type="Edm.String" />
	<Property Name="LastName" Type="Edm.String"/>
	<Property Name="MiddleName" Type="Edm.String"/>
	<Property Name="Gender" Type="Microsoft.OData.Service.Sample.TrippinInMemory.Models.PersonGender" Nullable="false"/>
	<Property Name="Age" Type="Edm.Int64" />
</EntityType>
```

위 예제에서 `UserName` 속성의 경우, `Nullable="false"`를 제거하여 필드를 선택 사항으로 변경할 수 있습니다. 또한 `Age` 속성의 타입을 `Type="Edm.String"`으로 변경하면 자유로운 텍스트 입력을 허용할 수 있습니다.

**팁:** OData 서비스의 메타데이터를 보려면 서비스 URL 끝에 `$metadata` 변수를 추가하면 됩니다. 예를 들어, 다음과 같은 URL에서 확인할 수 있습니다:
- [TripPinRESTierService의 메타데이터](http://services.odata.org/TripPinRESTierService/$metadata)

이러한 URL을 통해 서비스 메타데이터를 확인하고, 필요한 정보에 맞게 `metadata.xml` 파일을 조정할 수 있습니다.