ALTER TABLE public.swl_dodp_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_swl_dodp_as;

CREATE OR REPLACE VIEW public.viw_swl_dodp_as
            (geom, 관리번호, 처리분구명, 사용개시일자, 처리분구면적, 처리분구인구수, 계획처리인구수, 주거지역면적, 상업지역면적, 공업지역면적, 오수발생량, 관리기관) AS
SELECT ms.geom    AS geom,
       ms.ftr_idn AS 관리번호,
       ms.ddp_nam AS 처리분구명,
       ms.str_ymd AS 사용개시일자,
       ms.ddp_siz AS 처리분구면적,
       ms.ddp_pop AS 처리분구인구수,
       ms.prn_pop AS 계획처리인구수,
       ms.res_siz AS 주거지역면적,
       ms.com_siz AS 상업지역면적,
       ms.ind_siz AS 공업지역면적,
       ms.sew_vol AS 오수발생량,
       smg.cname  AS 관리기관
FROM swl_dodp_as ms
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno;

