ALTER TABLE public.swl_aodp_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_swl_aodp_as;

CREATE OR REPLACE VIEW public.viw_swl_aodp_as
            (geom, 관리번호, 처리구역명, 사용개시일자, 고시번호, 용도지역, 처리구역면적, 처리구역인구수, 계획처리인구수, 오수발생량, 관리기관) AS
SELECT ms.geom    AS geom,
       ms.ftr_idn AS 관리번호,
       ms.adp_nam AS 처리구역명,
       ms.str_ymd AS 사용개시일자,
       ms.not_num AS 고시번호,
       sue.cname  AS 용도지역,
       ms.adp_siz AS 처리구역면적,
       ms.adp_pop AS 처리구역인구수,
       ms.prn_pop AS 계획처리인구수,
       ms.sew_vol AS 오수발생량,
       smg.cname  AS 관리기관
FROM swl_aodp_as ms
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_use sue ON ms.use_cde = sue.codeno;
