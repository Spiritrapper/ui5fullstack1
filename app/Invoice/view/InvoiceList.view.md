```xml
<mvc:View
   controllerName="ui5.walkthrough.controller.InvoiceList"  <!-- 해당 뷰와 연결된 컨트롤러 이름을 지정 -->
   xmlns="sap.m"  <!-- SAPUI5 Mobile 라이브러리(SAP.m) 사용 -->
   xmlns:mvc="sap.ui.core.mvc"  <!-- MVC 패턴을 위한 네임스페이스 정의 -->
   xmlns:core="sap.ui.core">  <!-- 코어 라이브러리의 네임스페이스 정의 -->

   <!-- 테이블 컴포넌트 시작 -->
   <Table
      id="invoiceList"  <!-- 테이블 ID 정의 -->
      class="sapUiResponsiveMargin"  <!-- 테이블에 적용되는 클래스, 반응형 마진 설정 -->
      width="auto"  <!-- 테이블 너비 자동 설정 -->
      items="{
         path : 'invoice>/Invoices',  <!-- 데이터 바인딩 경로 설정 (Invoices 엔티티셋) -->
         sorter : {
            path : 'Quantity',  <!-- 데이터를 Quantity 필드 기준으로 정렬 -->
            group : true  <!-- 그룹화 활성화 -->
         }
      }"
      selectionChange=".onSelectionChange" >  <!-- 항목 선택 시 트리거될 이벤트 핸들러 지정 -->

      <!-- 테이블의 헤더 툴바 정의 -->
      <headerToolbar>
         <Toolbar class="sapMToolbar">  <!-- 툴바 클래스 정의 -->
            <Title text="{i18n>invoiceListTitle}" class="sapMTitle"/>  <!-- 툴바에 표시될 제목, i18n으로 다국어 지원 -->
            <ToolbarSpacer/>  <!-- 툴바에서 남은 공간을 채움 -->
            <Button
               text="{i18n>addButtonText}"  <!-- 추가 버튼 텍스트 정의 -->
               press=".onAdd"  <!-- 버튼 클릭 시 호출될 함수 지정 -->
               icon="sap-icon://add"  <!-- 아이콘 설정 -->
               class="sapMButton"
            />
            <Button
               text="{i18n>editButtonText}"  <!-- 편집 버튼 텍스트 정의 -->
               press=".onEdit"  <!-- 버튼 클릭 시 호출될 함수 지정 -->
               icon="sap-icon://edit"  <!-- 아이콘 설정 -->
               enabled="{= ${view>/selectedItem} !== null}"  <!-- 항목이 선택되었을 때만 버튼 활성화 -->
               class="sapMButton"
            />
            <Button
               text="{i18n>deleteButtonText}"  <!-- 삭제 버튼 텍스트 정의 -->
               press=".onDelete"  <!-- 버튼 클릭 시 호출될 함수 지정 -->
               icon="sap-icon://delete"  <!-- 아이콘 설정 -->
               enabled="{= ${view>/selectedItem} !== null}"  <!-- 항목이 선택되었을 때만 버튼 활성화 -->
               class="sapMButton sapMButtonReject"
            />
            <ToolbarSpacer/>
               <Select
                 id="sortSelect"  <!-- 정렬 옵션 선택을 위한 Select 컴포넌트 ID 정의 -->
                 change=".onSortChange"  <!-- 정렬 옵션 변경 시 호출될 함수 지정 -->
                 selectedKey="ShipperName"> <!-- 기본 선택된 아이템 설정 -->
                 <items>
                    <core:Item key="ShipperName" text="{i18n>sortByShipperName}" />  <!-- 정렬 옵션: ShipperName -->
                    <core:Item key="ProductName" text="{i18n>sortByProductName}" />  <!-- 정렬 옵션: ProductName -->
                    <core:Item key="ExtendedPrice" text="{i18n>sortByExtendedPrice}" />  <!-- 정렬 옵션: ExtendedPrice -->
                 </items>
              </Select>
            <SearchField 
               width="50%"  <!-- 검색 필드 너비 설정 -->
               search=".onFilterInvoices"  <!-- 검색 시 호출될 함수 지정 -->
            />
         </Toolbar>
      </headerToolbar>

      <!-- 테이블의 컬럼 정의 -->
      <columns>
         <Column hAlign="Center" width="3em">  <!-- No. 컬럼, 중앙 정렬, 너비 3em -->
            <Text text="No." />
         </Column>
         
         <Column
            hAlign="End"
            minScreenWidth="Small"
            demandPopin="true"
            width="5em">  <!-- Quantity 컬럼, 우측 정렬, 최소 화면 크기 설정, 너비 5em -->
            <Text text="{i18n>columnQuantity}" />
         </Column>
         <Column>
            <Text text="{i18n>columnName}" />  <!-- Name 컬럼 -->
         </Column>
         <Column
            minScreenWidth="Small"
            demandPopin="true">  <!-- Status 컬럼, 반응형 팝인 기능 적용 -->
            <Text text="{i18n>columnStatus}" />
         </Column>
         <Column
            minScreenWidth="Tablet"
            demandPopin="false">  <!-- Supplier 컬럼, 태블릿 이상 화면에서만 표시 -->
            <Text text="{i18n>columnSupplier}" />
         </Column>
         <Column hAlign="End">  <!-- Price 컬럼, 우측 정렬 -->
            <Text text="{i18n>columnPrice}" />
         </Column>

         <!-- Views 컬럼 정의 -->
         <Column hAlign="Center" width="5em">
            <Text text="Views" />
         </Column>
      </columns>

      <!-- 테이블 아이템(행) 정의 -->
      <items>
         <ColumnListItem 
            type="Active"  <!-- 아이템의 유형을 Active로 설정, 클릭 가능 -->
            press=".onPress">  <!-- 아이템 클릭 시 호출될 함수 지정 -->
            <cells>

               <!-- No. 셀 -->
               <Text text="{
                  path: 'invoice>',
                  formatter: '.formatter.getRowIndex'
               }" />

               <!-- Quantity 셀 -->
               <ObjectIdentifier 
                  title="{invoice>Quantity}"
               />

               <!-- ProductName 셀 -->
               <ObjectIdentifier title="{invoice>ProductName}"/>

               <!-- Status 셀 -->
               <Text 
                  text="{ 
                     parts: [
                        'invoice>Status',
                        'i18n>invoiceStatusA',
                        'i18n>invoiceStatusB',
                        'i18n>invoiceStatusC',
                        'i18n>invoiceStatusD',
                        'i18n>invoiceStatusE',
                        'i18n>invoiceStatusF'
                     ],
                     formatter: '.formatter.statusText'
                   }"
               />

               <!-- ShipperName 셀 -->
               <Text text="{invoice>ShipperName}"/>

               <!-- Price 셀 -->
               <ObjectNumber
                  number="{ 
                     parts: [
                        'invoice>ExtendedPrice',
                        'view>/currency'
                     ],
                     type: 'sap.ui.model.type.Currency',
                     formatOptions: {
                        showMeasure: false
                     }
                   }"
                   unit="{view>/currency}"
                   state="{= ${invoice>ExtendedPrice} > 20 ? 'Error' : 'Success'}"
                   class="price"
               />

               <!-- View Count 셀 -->
               <Text text="{invoice>ViewCount}" />

            </cells>
         </ColumnListItem>
      </items>
   </Table>

   <!-- 페이지네이션을 위한 툴바 -->
   <Toolbar>
      <ToolbarSpacer/>  <!-- 툴바의 왼쪽 여백 채우기 -->
      <Button
          text="Previous"  <!-- 이전 버튼 텍스트 -->
          press=".onPreviousPage"  <!-- 이전 버튼 클릭 시 호출될 함수 -->
          enabled="{= ${view>/currentPage} > 0 }"/>  <!-- 첫 페이지가 아닐 때만 활성화 -->
      <Button
          text="Next"  <!-- 다음 버튼 텍스트 -->
          press=".onNextPage"  <!-- 다음 버튼 클릭 시 호출될 함수 -->
          enabled="{= ${view>/hasMore} }"/>  <!-- 더 이상 페이지가 없을 때 비활성화 -->
      <ToolbarSpacer/>  <!-- 툴바의 오른쪽 여백 채우기 -->
   </Toolbar>

</mvc:View> <!-- SAP UI5 XML 뷰의 끝 -->
```