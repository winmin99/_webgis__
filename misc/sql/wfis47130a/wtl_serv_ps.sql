ALTER TABLE public.wtl_serv_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_serv_ps
            (geom, 레이어, 관리번호, 급수구역, 배수지명, 관련정수장, 부지면적, 관리방법, 시설용량, 최고수위, 최저수위, 유입량, 급수지역, 급수인구, 제어방법, 읍면동, 법정동,
             급수분구, 준공일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT serv_tb.geom,
       '배수지'::text     AS 레이어,
       serv_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       serv_tb.srv_nam AS 배수지명,
       serv_tb.pur_nam AS 관련정수장,
       serv_tb.srv_ara AS 부지면적,
       sag_tb.cname    AS 관리방법,
       serv_tb.srv_vol AS 시설용량,
       serv_tb.hgh_wal AS 최고수위,
       serv_tb.low_wal AS 최저수위,
       serv_tb.isr_vol AS 유입량,
       serv_tb.sup_are AS 급수지역,
       serv_tb.sup_pop AS 급수인구,
       scw_tb.cname    AS 제어방법,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsg_nam  AS 급수분구,
       serv_tb.fns_ymd AS 준공일자,
       serv_tb.cnt_num AS 공사번호,
       mng_tb.cname    AS 관리기관,
       serv_tb.sht_num AS 도엽번호
FROM wtl_serv_ps serv_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON serv_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON serv_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON serv_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON serv_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_sag sag_tb ON serv_tb.sag_cde = sag_tb.codeno
         LEFT JOIN private.cd_scw scw_tb ON serv_tb.scw_cde = scw_tb.codeno;

