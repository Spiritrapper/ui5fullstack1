```xml
<mvc:View
    controllerName="ui5.walkthrough.controller.Detail"  <!-- 이 뷰가 사용할 컨트롤러의 이름을 지정합니다 -->
    xmlns="sap.m"  <!-- SAPUI5의 모바일 라이브러리의 XML 네임스페이스를 선언합니다 -->
    xmlns:mvc="sap.ui.core.mvc"  <!-- SAPUI5의 MVC 패턴을 위한 XML 네임스페이스를 선언합니다 -->
    xmlns:wt="ui5.walkthrough.control"  <!-- 사용자 정의 컨트롤의 네임스페이스를 선언합니다 -->
    xmlns:formatter="app/Invoice/model/formatter"  <!-- 포맷터를 위한 네임스페이스를 선언합니다 -->

>
    <Page
        title="{i18n>detailPageTitle}"  <!-- 페이지의 제목을 i18n 모델에서 가져옵니다 -->
        showNavButton="true"  <!-- 내비게이션 버튼을 표시할지 여부를 설정합니다 -->
        navButtonPress=".onNavBack"  <!-- 내비게이션 버튼을 클릭했을 때 호출될 메소드를 지정합니다 -->
    >
        <VBox>  <!-- 콘텐츠를 수직으로 정렬하는 레이아웃 컨테이너를 사용합니다 -->
		  
            <!-- 영화 포스터 -->
            <Image
                src="{invoice>ImageURL}"  <!-- 이미지의 소스를 모델의 ImageURL 필드에서 가져옵니다 -->
                class="sapUiSmallMargin"  <!-- SAPUI5의 기본 마진 클래스를 적용합니다 -->
                width="500px"  <!-- 이미지의 너비를 500픽셀로 설정합니다 -->
                height="auto"  <!-- 이미지의 높이를 자동으로 설정하여 비율을 유지합니다 -->
                visible="{= !!${invoice>ImageURL} }"  <!-- ImageURL이 존재할 때만 이미지를 표시합니다 -->
            />
            
            <!-- 영화 정보 패널 -->
            <Panel
                headerText="{invoice>ProductName}"  <!-- 패널의 헤더에 제품 이름을 표시합니다 -->
                class="sapUiSmallMargin"  <!-- SAPUI5의 기본 마진 클래스를 적용합니다 -->
            >
                <VBox class="sapUiSmallMargin">  <!-- 패널 내부 콘텐츠를 수직으로 정렬하고 마진을 적용합니다 -->
                    <Text text="{i18n>shipperNameTitle}: {invoice>ShipperName}" />  <!-- 공급자 이름을 표시합니다 -->
                    <Text text="{i18n>quantityTitle}: {invoice>Quantity}" />  <!-- 수량을 표시합니다 -->
                     <!-- 주석 처리된 텍스트는 상태 정보를 포맷터를 통해 포맷하여 표시하는 코드입니다 -->
					<Text text="{i18n>priceTitle}: {invoice>ExtendedPrice} {view>/currency}" />  <!-- 가격과 통화를 표시합니다 -->

                    <!-- 주석 처리된 텍스트는 Currency 타입으로 가격을 표시하는 코드입니다 -->
                </VBox>
            </Panel>

            <!-- 줄거리 -->
            <Panel
                headerText="{i18n>plotSummaryTitle}"  <!-- 패널의 헤더에 줄거리 제목을 표시합니다 -->
                class="sapUiSmallMargin"  <!-- SAPUI5의 기본 마진 클래스를 적용합니다 -->
            >
                <Text
                    text="{invoice>PlotSummary}"  <!-- 줄거리를 모델에서 가져와 텍스트로 표시합니다 -->
                    class="sapUiSmallMargin"  <!-- SAPUI5의 기본 마진 클래스를 적용합니다 -->
                />
            </Panel>
            
            <!-- 영화 평가 -->
            
             <HBox alignItems="Center">  <!-- 평가 섹션을 가로로 정렬하고 중앙에 정렬합니다 -->
             <wt:ProdeuctRating 
                id="rating"  <!-- 커스텀 컨트롤인 ProdeuctRating의 ID를 설정합니다 -->
                class="sapUiSmallMarginBeginEnd"  <!-- 양 끝에 마진을 적용합니다 -->
                change=".onRatingChange"  <!-- 평점이 변경될 때 호출되는 메소드를 지정합니다 -->
            />
             <Text text="{rating>/value}" class="sapUiSmallMarginEnd" /> <!-- 평점 값을 표시하는 텍스트 -->
                <Button
                    text="{i18n>editButtonText}"  <!-- 버튼에 표시할 텍스트를 i18n 모델에서 가져옵니다 -->
                    icon="sap-icon://edit"  <!-- 버튼에 적용할 아이콘을 지정합니다 -->
                    press=".onEdit"  <!-- 버튼을 클릭했을 때 호출될 메소드를 지정합니다 -->
                    type="Emphasized"  <!-- 강조된 스타일의 버튼으로 설정합니다 -->
                    class="editButton"  <!-- 버튼에 'editButton' 클래스를 적용합니다 -->
                />
                <Button
                    text="{i18n>deleteButtonText}"  <!-- 버튼에 표시할 텍스트를 i18n 모델에서 가져옵니다 -->
                    icon="sap-icon://delete"  <!-- 버튼에 적용할 아이콘을 지정합니다 -->
                    press=".onDelete"  <!-- 버튼을 클릭했을 때 호출될 메소드를 지정합니다 -->
                    type="Reject"  <!-- 거부 스타일의 버튼으로 설정합니다 -->
                    class="deleteButton"  <!-- 버튼에 'deleteButton' 클래스를 적용합니다 -->
                />
            </HBox>
            
        </VBox>
    </Page>
</mvc:View>
```