ALTER TABLE public.wtl_rsrv_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_rsrv_ps
            (geom, 레이어, 관리번호, 급수구역, 저수조명, 건물유형, 소유자성명, 소유자주소, 소유자전화번호, 관리자성명, 관리자주소, 관리자전화번호, 건축면적, 건축연면적, 세대수,
             건물주소, 읍면동, 법정동, 급수분구, 허가일자, 준공일자, 관리기관, 도엽번호)
AS
SELECT rsrv_tb.geom,
       '저수조'::text     AS 레이어,
       rsrv_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       rsrv_tb.rsr_nam AS 저수조명,
       bls_tb.cname    AS 건물유형,
       rsrv_tb.own_nam AS 소유자성명,
       rsrv_tb.own_adr AS 소유자주소,
       rsrv_tb.own_tel AS 소유자전화번호,
       rsrv_tb.mng_nam AS 관리자성명,
       rsrv_tb.mng_adr AS 관리자주소,
       rsrv_tb.mng_tel AS 관리자전화번호,
       rsrv_tb.bld_ara AS 건축면적,
       rsrv_tb.tbl_ara AS 건축연면적,
       rsrv_tb.fam_cnt AS 세대수,
       rsrv_tb.bld_adr AS 건물주소,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsg_nam  AS 급수분구,
       rsrv_tb.pms_ymd AS 허가일자,
       rsrv_tb.fns_ymd AS 준공일자,
       mng_tb.cname    AS 관리기관,
       rsrv_tb.sht_num AS 도엽번호
FROM wtl_rsrv_ps rsrv_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON rsrv_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON rsrv_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON rsrv_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON rsrv_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_bls bls_tb ON rsrv_tb.bls_cde = bls_tb.codeno;


