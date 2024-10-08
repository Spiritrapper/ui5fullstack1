`onInit()`와 `_loadData()` 함수는 각각 다른 시점에서 서로 다른 역할을 수행하는 함수입니다. 둘의 역할과 차이를 설명드리겠습니다.

### `onInit()` 함수
- **역할**: `onInit()` 함수는 **컨트롤러가 처음 초기화될 때** 한 번 실행됩니다. 
- **주요 기능**:
  - **OData 모델 초기화 및 설정**: OData 서비스에 연결하기 위해 OData 모델을 생성하고, 이를 뷰에 설정합니다.
  - **뷰 모델 설정**: UI에서 사용할 다양한 데이터(예: 통화, 상태, 페이지 크기 등)를 담고 있는 JSON 모델을 생성하여 뷰에 설정합니다.
  - **이벤트 등록**: 특정 라우트에 대해 이벤트를 등록하거나, 이벤트 버스를 통해 메시지를 수신할 수 있도록 설정합니다.
  - **데이터 로드 호출**: 초기화 과정의 마지막 부분에서 `_loadData()` 함수를 호출하여 데이터를 로드합니다.

### `_loadData()` 함수
- **역할**: `_loadData()` 함수는 **데이터를 실제로 로드**하는 역할을 담당합니다. 이는 주로 사용자가 특정 페이지에 접근했을 때나 데이터를 새로고침할 때 호출됩니다.
- **주요 기능**:
  - **페이징 처리**: 뷰 모델에서 현재 페이지와 페이지 크기를 가져와, 해당 페이지에 맞는 데이터를 가져오기 위해 OData 요청에 필요한 `$top`(가져올 항목의 수)과 `$skip`(건너뛸 항목의 수) 파라미터를 설정합니다.
  - **바인딩 설정**: 뷰에 표시할 리스트 아이템들을 OData 서비스와 바인딩하고, 데이터가 변경될 때 추가적인 처리를 수행합니다.
  - **추가 데이터 로드 여부 결정**: 로드된 데이터의 수를 기반으로 더 많은 데이터가 있는지 여부를 결정하고, 이를 뷰 모델에 반영합니다.

### 요약
- **`onInit()`**: 컨트롤러가 처음 초기화될 때 실행되며, 모델 초기화, 이벤트 등록, 초기 데이터 로드를 담당합니다.
- **`_loadData()`**: 데이터를 실제로 서버에서 가져오고 UI에 바인딩하는 역할을 합니다. 이 함수는 필요한 경우 여러 번 호출될 수 있습니다.

`onInit()`은 초기 설정과 초기 데이터 로드의 시작점이고, `_loadData()`는 데이터를 실제로 가져오고 업데이트하는 구체적인 작업을 수행하는 함수입니다.