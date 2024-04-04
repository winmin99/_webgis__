-- 성주의 취수장은 polygon 으로 생성

ALTER TABLE public.wtl_gain_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_wtl_gain_ps;

CREATE OR REPLACE VIEW public.viw_wtl_gain_ps
            (geom, 레이어, 관리번호, 급수구역, 취수장명, 수원구분, 수계명, 평균취수량, 최대취수량, 펌프대수, 부지면적, 도수방법, 취수방법, 읍면동, 법정동, 급수분구,
             준공일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT gain_tb.geom    AS geom,
       '취수장'::text     AS 레이어,
       gain_tb.ftr_idn AS 관리번호,
       wsg_tb.wsg_nam  AS 급수구역,
       gain_tb.gai_nam AS 취수장명,
       wsr_tb.cname    AS 수원구분,
       gain_tb.wss_nam AS 수계명,
       gain_tb.aga_vol AS 평균취수량,
       gain_tb.hga_vol AS 최대취수량,
       gain_tb.pmp_cnt AS 펌프대수,
       gain_tb.gai_ara AS 부지면적,
       wrw_tb.cname    AS 도수방법,
       wgw_tb.cname    AS 취수방법,
       bjd_tb.hjd_nam  AS 읍면동,
       bjd_tb.bjd_nam  AS 법정동,
       wsb_tb.wsb_nam  AS 급수분구,
       gain_tb.fns_ymd AS 준공일자,
       gain_tb.cnt_num AS 공사번호,
       mng_tb.cname    AS 관리기관,
       gain_tb.sht_num AS 도엽번호
FROM wtl_gain_ps gain_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON gain_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON gain_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN bml_badm_as bjd_tb ON gain_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON gain_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_wsr wsr_tb ON gain_tb.wsr_cde = wsr_tb.codeno
         LEFT JOIN private.cd_wrw wrw_tb ON gain_tb.wrw_cde = wrw_tb.codeno
         LEFT JOIN private.cd_wgw wgw_tb ON gain_tb.wgw_cde = wgw_tb.codeno;