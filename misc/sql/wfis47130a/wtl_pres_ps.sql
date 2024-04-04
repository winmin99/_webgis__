-- 성주의 가압장은 polygon 으로 생성

ALTER TABLE public.wtl_pres_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_pres_ps
            (geom, 레이어, 관리번호, 급수구역, 가압장명, 부지면적, 관리방법, 가압장표고, 가압능력, 가압구역, 가압수혜가구, 읍면동, 법정동, 급수분구, 준공일자, 공사번호,
             관리기관, 도엽번호)
AS
SELECT pres_tb.geom    AS geom,
       '가압장'::text     AS 레이어,
       pres_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       pres_tb.prs_nam AS 가압장명,
       pres_tb.prs_ara AS 부지면적,
       sag_tb.cname    AS 관리방법,
       pres_tb.prs_alt AS 가압장표고,
       pres_tb.prs_vol AS 가압능력,
       pres_tb.prs_are AS 가압구역,
       pres_tb.prs_sah AS 가압수혜가구,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsg_nam  AS 급수분구,
       pres_tb.fns_ymd AS 준공일자,
       pres_tb.cnt_num AS 공사번호,
       mng_tb.cname    AS 관리기관,
       pres_tb.sht_num AS 도엽번호
FROM wtl_pres_ps pres_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON pres_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON pres_tb.wsb_cde = wsb_tb.wsg_cde
         LEFT JOIN bml_badm_as bjd_tb ON pres_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON pres_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_sag sag_tb ON pres_tb.sag_cde = sag_tb.codeno;
