ALTER TABLE public.swl_aodr_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

CREATE OR REPLACE VIEW public.viw_swl_aodr_as(geom, 관리번호, 배수구역명, 사용개시일자, 고시번호, 배수구역면적, 배수구역인구수, 유입하천명, 유출계수, 관리기관) AS
SELECT ms.geom    AS geom,
       ms.ftr_idn AS 관리번호,
       ms.adr_nam AS 배수구역명,
       ms.str_ymd AS 사용개시일자,
       ms.not_num AS 고시번호,
       ms.adr_siz AS 배수구역면적,
       ms.adr_pop AS 배수구역인구수,
       ms.riv_nam AS 유입하천명,
       ms.drn_cnt AS 유출계수,
       smg.CNAME  AS 관리기관
FROM swl_aodr_as ms
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.CODENO;
