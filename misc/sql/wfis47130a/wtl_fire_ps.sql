ALTER TABLE public.wtl_fire_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_fire_ps
            (geom, 레이어, 관리번호, 급수구역, 배수관구경, 소화전구경, 소화전형식, 수용가번호, 급수탑높이, 읍면동, 법정동, 급수분구, 설치일자, 공사번호, 관리기관, 도엽번호,
             방향각)
AS
SELECT fire_tb.geom               AS geom,
       btrim(fire_tb.layer::text) AS 레이어,
       fire_tb.ftr_idn            AS 관리번호,
       wsg_tb.wsg_nam             AS 급수구역,
       fire_tb.pip_dip            AS 배수관구경,
       fire_tb.fir_dip            AS 소화전구경,
       mof_tb.cname               AS 소화전형식,
       fire_tb.hom_num            AS 수용가번호,
       fire_tb.sup_hit            AS 급수탑높이,
       bjd_tb.hjd_nam             AS 읍면동,
       bjd_tb.bjd_nam             AS 법정동,
       wsb_tb.wsg_nam             AS 급수분구,
       fire_tb.ist_ymd            AS 설치일자,
       fire_tb.cnt_num            AS 공사번호,
       mng_tb.cname               AS 관리기관,
       fire_tb.sht_num            AS 도엽번호,
       fire_tb.ang_dir            AS 방향각
FROM wtl_fire_ps fire_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON fire_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON fire_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON fire_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON fire_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mof mof_tb ON fire_tb.mof_cde = mof_tb.codeno AND mof_tb.tbl_nam = '소화전형식'::bpchar;
