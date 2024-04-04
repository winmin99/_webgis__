ALTER TABLE public.swl_dodr_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

CREATE OR REPLACE VIEW public.viw_swl_dodr_as
            (geom, 관리번호, 배수분구명, 사용개시일자, 배수분구면적, 배수분구인구수, 주거지역면적, 상업지역면적, 공업지역면적, 녹지면적, "5년빈도강우강도", "10년빈도강우강도", 유입하천명, 유출계수,
             관리기관)
AS
SELECT ms.geom    AS geom,
       ms.ftr_idn AS 관리번호,
       ms.ddr_nam AS 배수분구명,
       ms.str_ymd AS 사용개시일자,
       ms.ddr_siz AS 배수분구면적,
       ms.ddr_pop AS 배수분구인구수,
       ms.res_siz AS 주거지역면적,
       ms.com_siz AS 상업지역면적,
       ms.ind_siz AS 공업지역면적,
       ms.nat_siz AS 녹지면적,
       ms.ddr_sby AS "5년빈도강우강도",
       ms.ddr_sbz AS "10년빈도강우강도",
       ms.riv_nam AS 유입하천명,
       ms.drn_cnt AS 유출계수,
       smg.cname  AS 관리기관
FROM swl_dodr_as ms
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno;
