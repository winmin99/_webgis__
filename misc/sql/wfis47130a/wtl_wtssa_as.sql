ALTER TABLE public.wtl_wtssa_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

CREATE OR REPLACE VIEW public.viw_wtl_wtssa_as
            (geom, 급수분구명, 관리번호, 급수구역위치, 급수구역면적, 급수대상인구, 급수분구용량, 급수구역명)
AS
SELECT wsb_tb.geom,
       wsb_tb.wsg_nam AS 급수분구명,
       wsb_tb.ftr_idn AS 관리번호,
       wsb_tb.pos_nam AS 급수구역위치,
       wsb_tb.wsg_are AS 급수구역면적,
       wsb_tb.wsg_pop AS 급수대상인구,
       wsb_tb.sol_vol AS 급수분구용량,
       wsb_tb.wsg_nam AS 급수구역명
FROM wtl_wtssa_as wsb_tb;