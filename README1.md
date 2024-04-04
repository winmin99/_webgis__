# WebGIS 2

## Build

Webpack의 설정을 확인 후 배포용 서버를 빌드한다.

`webpack --mode production --config webpack.client.js && webpack --mode production --config webpack.server.js`

## Installation

### 1. Server setup

- 배포용 서버 구성을 확인한다.

        /public
        app.bundle.js
        ecosystem.json
        .env
        +
        package.json (`npm install` 실행 후 삭제)
        package-lock.json (`npm install` 실행 후 삭제)

- WebGIS Installer 패키지에서 소프트웨어와 스크립트를 설치한다.

- `package.json` -> `npm install` 하여 **node_modules** 가 설치되는지 확인한다.

- 서버 프로세스 실행 및 관리를 위해 [PM2](https://pm2.keymetrics.io/) 를 설치한다 `npm install pm2 -g`

- `.env`, `ecosystem.json` 을 열어 설정값을 확인한다.

  - `.env`

        LOCAL_NAME=성주군
        LOCAL_ROLE=상하수
        # WORKSPACE
        WORKSPACE=seongju_ab
        # POSTGRES
        PGHOST=localhost
        PGPORT=5432
        PGUSER=postgres
        PGPASSWORD=some_postgres_password
        PGDATABASE=wfis47840ab
        # MYSQL
        MSHOST=localhost
        MSPORT=3306
        MSUSER=root
        MSPASSWORD=some_mysql_password
        MSDATABASE=wfis47840ab
        # SESSION
        SESSION_KEY=some_session_key

  - `ecosystem.json`

        {
          "apps": {
            "name": "WebGIS2",
            "cwd": "./",
            "script": "./app.bundle.js",
            "args": "",
            "exec_mode": "cluster",
            "instances": 6,
            "watch": false,
            "max_memory_restart": "1G",
            "source_map_support": false,
            "combine_logs": true,
            "error_file": "./logs/pm2-error.log",
            "out_file": "/dev/null",
            "time": true,
            "wait_ready": false,
            "listen_timeout": 50000,
            "kill_timeout": 5000,
            "exp_backoff_restart_delay": 100,
            "autorestart": true,
            "env": {
              "NODE_ENV": "production"
            }
          }
        }

- nginx 서버 설정값을 확인한다.

  `cd C:\nginx-1.xx.xx\conf\nginx.conf`

### 2. Database setup

**명령 프롬프트 Command Prompt**를 실행하여 미리 준비한 PostgreSQL 덤프를 탑재한다.

`psql -U postgres` -> `CREATE database %DB_NAME% template=template0 lc_ctype="C" lc_collate="C";` -> `\q`

`psql -U postgres -f %DUMP_NAME%.sql %DB_NAME%`

## Pre-deployment

### kakao API key setup

- [kakao developers](https://developers.kakao.com/console/app) 에서 `djgis@chol.com` 로 로그인
- WebGIS2 의 [플랫폼(Web)](https://developers.kakao.com/console/app/432937/config/platform) 에 아래 IP를 등록 (포트 번호까지 정확하게 기재한다)
  - 경주 [100.100.0.151:3000](http://100.100.0.151:3000)
  - 성주 [111.18.71.15:3000](http://111.18.71.15:3000)
- [앱 키](https://developers.kakao.com/console/app/432937/config/appKey) 목록에서 `JavaScript 키` 를 사용

## Deployment & Service

- nginx 서버를 시작한다.

  `cd C:\nginx-1.xx.xx` -> `start nginx`

- **명령 프롬프트 Command Prompt**에서 [PM2](https://pm2.keymetrics.io/) 를 통해 웹서버를 시작한다.

  `cd C:\server` -> `pm2 start ecosystem.json`

## Service startup automation

OS에 로그인 후 자동으로 서버 및 웹애플리케이션이 시작할 수 있게 설정한다. 설정 후 OS를 재부팅하여 정상 실행되는지 확인한다.

### 1. Nginx

- OS에 로그인 5분 후부터 Nginx 실행 여부를 5분 간격으로 확인하는 작업 스케줄러 동작을 설정한다.

  `Windows + R` -> `taskschd.msc` -> `작업 만들기`

- 트리거 탭
  - 트리거 간격을 '한 번' 으로 선택후 시간을 '오전 12:00:00' 으로 설정한다.
  - '고급 설정'의 '작업 반복 간격' 을 '5 분'으로 설정하고, '기간'은 '무기한으로' 를 선택한다.
- 동작 탭

  - '새로 만들기'를 선택하여 Nginx 를 실행할 `start.bat` 스크립트를 선택한다.

  - `start.bat`

        @ECHO OFF
        tasklist /FI "IMAGENAME eq nginx.exe" 2>NUL | find /I /N "nginx.exe">NUL
        IF NOT "%ERRORLEVEL%"=="0" (
           c:
           cd C:\nginx-1.17.10
           start nginx.exe
           ECHO Nginx started.
        ) else (
           ECHO Nginx is already running.
        )

- 설정 탭

  - '예약된 시작 시간을 놓친 경우 가능한 대로 빨리 작업 시작(Run task as soon as possible after a scheduled start is missed)' 을 체크한다.

- 작업이 생성되면 '일반' 탭의 '보안 옵션'에서 '가장 높은 수준의 권한으로 실행'을 체크한다.

### 2. PM2 (웹서버)

- OS에 로그인 후 자동으로 실행되는 **Windows Service** 로 구성한다.

  `npm install pm2 -g` -> `npm install pm2-windows-service -g` -> `npm install npm-check-updates -g` -> `cd %AppData%\npm\node_modules\pm2-windows-service` -> `ncu inquirer -u` -> `npm install` -> `pm2-service-install`

- Windows Service 에서 `PM2` 서비스가 '자동'모드로 정상 실행되는지 확인하고, 오류가 발생한다면 `PM2` 상태를 초기화해본다.

  `cmd` -> `pm2 cleardump` -> `pm2 flush`

## Service update

- 배포용 서버를 빌드한다.

`webpack --mode production --config webpack.client.js && webpack --mode production --config webpack.server.js`

- 업데이트용 서버 구성을 확인한다.

        /public
        app.bundle.js
        +
        (라이브러리 업데이트가 포함되었을 경우)
        package.json (`npm install` 실행 후 삭제)
        package-lock.json (`npm install` 실행 후 삭제)

- GeoServer 변경용 .xml 과 DBMS 변경용 .sql 을 확인한다.

- [GSS_ConvertSHP](https://github.com/helloelliote/shp-backup) 패키지 구성을 확인한다.

        GSS_ConvertSHP-x.xx.xx.jar
        config.properties
        table.properties
        Run.bat (버전번호 일치여부 확인)

- PM2 서비스를 중지한 후 서버 머신에 업데이트 파일 패키지를 복사한다.

  `cmd` -> `pm2 list` -> `pm2 delete all` -> `pm2 cleardump` -> `pm2 save`

- [GSS_ConvertSHP](https://github.com/helloelliote/shp-backup) 를 실행하여 PostgreSQL 을 최신으로 업데이트하고, error-log.txt 를 확인한다.

- 서버 패키지, MySQL, PostgreSQL, GeoServer 등의 업데이트가 완료되면 PM2 서비스를 재시작한다.

  `cd C:\server` -> `pm2 start ecosystem.json`
  
- 서비스 및 DB 상태를 확인한 후 이동식 저장장치에 MySQL, PostgreSQL 과 GeoMania 의 .GSS 파일, GSS_ConvertSHP 의 error-log.txt 를 백업한다.

  (서버에서)
  - MySQL: MySQL Workbench 의 좌측 메뉴에서 `MANAGEMENT` -> `Data Export` -> `Export to Self-Contained File` -> `Start Export`
  - PostgreSQL: `psql -U postgres -f %DUMP_NAME%.sql %DB_NAME%`
  
  (상하수도 관리자 PC 에서)
  - .GSS: `../관리시스템/MAP/상수도.GSS 또는 하수도.GSS`
  - error-log.txt: `cd C:\GSS_ConvertSHP\logs\error-log.txt`
