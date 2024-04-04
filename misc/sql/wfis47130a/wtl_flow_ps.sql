ALTER TABLE public.wtl_flow_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_flow_ps
            (geom, 관리번호, 급수구역, 구경, 유량계형식, 유량계종류, 제작회사명, 읍면동, 법정동, 급수분구, 설치일자,
             공사번호, 관리기관, 도엽번호, 관로관리번호, 방향각)
AS
SELECT flow_tb.geom    AS geom,
       flow_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       flow_tb.flo_dip AS 구경,
       mof_tb.cname    AS 유량계형식,
       gag_tb.cname    AS 유량계종류,
       flow_tb.prd_nam AS 제작회사명,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsg_nam  AS 급수분구,
       flow_tb.ist_ymd AS 설치일자,
       flow_tb.cnt_num AS 공사번호,
       mng_tb.cname    AS 관리기관,
       flow_tb.sht_num AS 도엽번호,
       flow_tb.pip_idn AS 관로관리번호,
       flow_tb.ang_dir AS 방향각
FROM wtl_flow_ps flow_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON flow_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON flow_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON flow_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON flow_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mof mof_tb ON flow_tb.mof_cde = mof_tb.codeno AND mof_tb.tbl_nam = '계량기형식'::bpchar
         LEFT JOIN private.cd_gag gag_tb ON flow_tb.gag_cde = gag_tb.codeno;
