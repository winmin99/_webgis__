ALTER TABLE public.wtl_valv_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

DROP VIEW IF EXISTS public.viw_wtl_valv_ps;

CREATE OR REPLACE VIEW public.viw_wtl_valv_ps
            (geom, 레이어, 관리번호, 급수구역, 본관구경, 지관구경, 재질, 변류형식, 회전방향, 총회전수, 현회전수, 구동방법, 변실형태, 변실규격, 설정압력, 제작회사명, 이상상태,
             개폐여부, 읍면동, 법정동, 급수분구, 설치일자, 공사명, 관리기관, 도엽번호, 관로관리번호, 방향각)
AS
SELECT valv_tb.geom,
       btrim(valv_tb.layer::text) AS 레이어,
       valv_tb.ftr_idn            AS 관리번호,
       wsg_tb.wsg_nam             AS 급수구역,
       valv_tb.spi_dip            AS 본관구경,
       valv_tb.val_dip            AS 지관구경,
       CASE
           WHEN valv_tb.layer = '이토변'::bpchar THEN mop_tb.cname_sl::character varying
           ELSE mop_tb.cname
           END                    AS 재질,
       mof_tb.cname               AS 변류형식,
       sae_tb.cname               AS 회전방향,
       valv_tb.tro_cnt            AS 총회전수,
       valv_tb.cro_cnt            AS 현회전수,
       mth_tb.cname               AS 구동방법,
       for_tb.cname               AS 변실형태,
       valv_tb.val_std            AS 변실규격,
       valv_tb.val_saf            AS 설정압력,
       valv_tb.prd_nam            AS 제작회사명,
       cst_tb.cname               AS 이상상태,
       off_tb.cname               AS 개폐여부,
       bjd_tb.hjd_nam             AS 읍면동,
       bjd_tb.bjd_nam             AS 법정동,
       wsb_tb.wsb_nam             AS 급수분구,
       valv_tb.ist_ymd            AS 설치일자,
       valv_tb.cnt_num            AS 공사명,
       mng_tb.cname               AS 관리기관,
       valv_tb.sht_num            AS 도엽번호,
       valv_tb.pip_idn            AS 관로관리번호,
       valv_tb.ang_dir            AS 방향각
FROM wtl_valv_ps valv_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON valv_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON valv_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN bml_badm_as bjd_tb ON valv_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON valv_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mop mop_tb ON
    CASE
        WHEN valv_tb.layer = '이토변'::bpchar THEN mop_tb.tbl_nam = '관재질'::bpchar AND valv_tb.val_mop = mop_tb.codeno
        ELSE mop_tb.tbl_nam = '변류재질'::bpchar AND valv_tb.val_mop = mop_tb.codeno
        END
         LEFT JOIN private.cd_mof mof_tb ON valv_tb.val_mof = mof_tb.codeno AND mof_tb.tbl_nam = '변류형식'::bpchar
         LEFT JOIN private.cd_mth mth_tb ON valv_tb.mth_cde = mth_tb.codeno
         LEFT JOIN private.cd_for for_tb ON valv_tb.val_for = for_tb.codeno
         LEFT JOIN private.cd_sae sae_tb ON valv_tb.sae_cde = sae_tb.codeno
         LEFT JOIN private.cd_cst cst_tb ON valv_tb.cst_cde = cst_tb.codeno
         LEFT JOIN private.cd_off off_tb ON valv_tb.off_cde = off_tb.codeno;
