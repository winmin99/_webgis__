#### 상하수도 시설 데이터베이스 불러오기

- 기존의 모든 Postgres 데이터베이스 연결을 해제 (Tomcat 서버 중지, IDE 의 DB 연결 삭제 등)

- **에러 발생시 기존 테이블 DROP (백업 필수!)**
   > CREATE EXTENSION POSTGIS 

- MySQL 데이터베이스 원본을 확보, MySQL Workbench 에서 import 하여 탑재
- [nmig-fork](https://github.com/helloelliote/nmig.git) 를 다운받아 nmig 의 config.json 설정
- nmig -> npm run build -> npm start
- nmig\logs_directory\not_created_views 내부의 sql 파일들을 확인 후 notepad 로 열어 확인 후 수정, INSERT 재실행
- 대문자 컬럼명을 소문자로 변환: 아래 sql 실행
   > select 'ALTER TABLE '||'"'||table_name||'"'||' RENAME COLUMN '||'"'||column_name||'"'||' TO ' || lower(column_name)||';' from information_schema.columns where table_schema = 'public' and lower(column_name) != column_name;
- 위의 결과를 .csv 등의 파일로 export 한 후 전체 쿼리문을 데이터베이스 콘솔에서 실행
- batch 파일을 실행해 db 를 수정 (0_import.sql 먼저 확인)
- .shp 파일로부터 "geom" 에 데이터를 넣을 [GSS_ConvertSHP](https://github.com/helloelliote/shp-backup.git) 를 실행
- GSS_ConvertSHP 실행 결과 로그를 분석해 데이터 무류성 검사

#### 국토지리정보원 연속수치지형도 데이터베이스 설치 및 불러오기

- [국토정보플랫폼](http://map.ngii.go.kr/ms/map/NlipMap.do#none) 에 접속, 로그인
- "행정구역" 단위의 영역을 선택하여 "연속수치지형도(SHP파일)"을 다운로드
- 마이페이지의 신청내역에서 다운로드할 자료 종류를 선택
   > [국가공간정보포털 오픈마켓](http://data.nsdi.go.kr/organization/b801ddfc-7c8b-4a99-98b0-a2efd66be94e?res_format=PDF) 에서 자료에 맞는 테이블정의서를 다운로드 (로그인 필요)                                
- PostGIS Bundle for PostgreSQL -> PostGIS Shapefile Import/Export Manager 를 실행
- View connection details... 에서 DB 접속 정보 입력후, Add File 로 추가할 .shp 파일을 선택, Import 실행
- 데이터 업데이트 시 연속성을 위해 테이블명은 바꾸지 않고 다운로드한 파일명 그대로 사용
