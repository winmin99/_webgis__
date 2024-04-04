# GeoServer Layer Style

## 1. Basic setup

- [GeoServer 관리자](http://127.0.0.1:8080/geoserver/web) 에 로그인 -> 좌측 `Styles` 메뉴 -> `Add a new style` 선택
- 'Name', 'Workspace' 를 지정하고 아래 편집창에 스타일 문서를 준비한 스타일 xml 파일에서 복사/붙여넣기
- `Submit` 하여 저장
- 'Legend' 항목의 `Preview legend` 를 눌러 적용될 스타일의 미리보기를 확인할 수 있다.
- 좌측 `Layers` 메뉴 -> 스타일을 적용하고자 하는 레이어 선택
- 'Publishing' 탭의 'WMS Settings' -> `Default Style` 목록에서 적용할 스타일을 선택 -> `Save`

- **Example**

        <?xml version="1.0" encoding="UTF-8"?>
         <StyledLayerDescriptor version="1.0.0"
           xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
           xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
           xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
           <NamedLayer>
             <Name>n3a_a0010000</Name>
             <UserStyle>
               <Title>n3a_a0010000</Title>
               <FeatureTypeStyle>
                 <Rule>
                   <Title>n3a_a0010000</Title>
                   <PolygonSymbolizer>
                     <Fill>
                       <CssParameter name="fill">#fffccb
                       </CssParameter>
                     </Fill>
                   </PolygonSymbolizer>
                 </Rule>
               </FeatureTypeStyle>
             </UserStyle>
           </NamedLayer>
         </StyledLayerDescriptor>
         
         
## 2. Advanced styles setup

// TODO: 심볼 이미지 적용, 레이어 특정 column 의 value 에 따라 서로 다른 스타일 적용, 라벨 표시, 조건문 활용 등