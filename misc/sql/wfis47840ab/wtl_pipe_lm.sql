ALTER TABLE public.wtl_pipe_lm
    ADD COLUMN IF NOT EXISTS geom geometry(LineString, 5187);

DROP VIEW IF EXISTS public.viw_wtl_pipe_lm;

CREATE OR REPLACE VIEW public.viw_wtl_pipe_lm
            (geom, 레이어, 관리번호, 급수구역, 구경, 연장, 관재질, 접합종류, 최저깊이, 최고깊이, 읍면동, 법정동, 급수분구, 설치일자, 공사명, 관리기관, 도엽번호, 관라벨,
             폐관일자, 사용여부)
AS
SELECT pipe_tb.geom               AS geom,
       btrim(pipe_tb.layer::text) AS 레이어,
       pipe_tb.ftr_idn            AS 관리번호,
       wsg_tb.wsg_nam             AS 급수구역,
       pipe_tb.pip_dip            AS 구경,
       pipe_tb.pip_len            AS 연장,
       mop_tb.cname_sl            AS 관재질,
       jht_tb.cname               AS 접합종류,
       pipe_tb.low_dep            AS 최저깊이,
       pipe_tb.hgh_dep            AS 최고깊이,
       bjd_tb.hjd_nam             AS 읍면동,
       bjd_tb.bjd_nam             AS 법정동,
       wsb_tb.wsb_nam             AS 급수분구,
       pipe_tb.ist_ymd            AS 설치일자,
       pipe_tb.cnt_num            AS 공사명,
       mng_tb.cname               AS 관리기관,
       pipe_tb.sht_num            AS 도엽번호,
       pipe_tb.pip_lbl            AS 관라벨,
       pipe_tb.old_ymd            AS 폐관일자,
       stt_tb.cname               AS 사용여부
FROM wtl_pipe_lm pipe_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON pipe_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON pipe_tb.wsg_cde = wsb_tb.wsb_cde
         LEFT JOIN bml_badm_as bjd_tb ON pipe_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON pipe_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mop mop_tb ON pipe_tb.mop_cde = mop_tb.codeno AND mop_tb.tbl_nam = '관재질'::bpchar
         LEFT JOIN private.cd_jht jht_tb ON pipe_tb.jht_cde = jht_tb.codeno
         LEFT JOIN private.cd_stt stt_tb ON pipe_tb.pip_stt = stt_tb.codeno;