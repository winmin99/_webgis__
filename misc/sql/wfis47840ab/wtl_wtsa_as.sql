ALTER TABLE public.wtl_wtsa_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_wtl_wtsa_as;

CREATE OR REPLACE VIEW public.viw_wtl_wtsa_as(geom, 급수구역명, 관리번호, 급수구역위치, 급수구역면적, 급수대상인구, 급수용량) AS
SELECT wsg_tb.geom,
       wsg_tb.wsg_nam AS 급수구역명,
       wsg_tb.ftr_idn AS 관리번호,
       wsg_tb.pos_nam AS 급수구역위치,
       wsg_tb.wsg_are AS 급수구역면적,
       wsg_tb.wsg_pop AS 급수대상인구,
       wsg_tb.sol_vol AS 급수용량

FROM wtl_wtsa_as wsg_tb;