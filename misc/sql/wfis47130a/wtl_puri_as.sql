-- 성주의 정수장은 polygon 으로 생성

ALTER TABLE public.wtl_puri_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_puri_as
            (geom, 레이어, 관리번호, 급수구역, 정수장명, 수원구분, 관련취수장, 관련배수지, 처리용량, 사용전력, 부지면적, 여과방법, 읍면동, 법정동, 급수분구, 준공일자,
             공사번호, 관리기관, 도엽번호)
AS
SELECT puri_tb.geom,
       '정수장'::text     AS 레이어,
       puri_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       puri_tb.pur_nam AS 정수장명,
       wsr_tb.cname    AS 수원구분,
       puri_tb.gai_nam AS 관련취수장,
       puri_tb.srv_nam AS 관련배수지,
       puri_tb.pur_vol AS 처리용량,
       puri_tb.pwr_vol AS 사용전력,
       puri_tb.pur_ara AS 부지면적,
       sam_tb.cname    AS 여과방법,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsg_nam  AS 급수분구,
       puri_tb.fns_ymd AS 준공일자,
       puri_tb.cnt_num AS 공사번호,
       mng_tb.cname    AS 관리기관,
       puri_tb.sht_num AS 도엽번호
FROM wtl_puri_as puri_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON puri_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON puri_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON puri_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON puri_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_wsr wsr_tb ON puri_tb.wsr_cde = wsr_tb.codeno
         LEFT JOIN private.cd_sam sam_tb ON puri_tb.sam_cde = sam_tb.codeno;
