ALTER TABLE public.swl_conn_ls
    ADD COLUMN IF NOT EXISTS geom geometry(LineString, 5187);

DROP VIEW IF EXISTS public.viw_swl_conn_ls;

CREATE OR REPLACE VIEW public.viw_swl_conn_ls
            (geom, 레이어, 관리번호, 처리구역, 연결관용도, 관재질, 단면형태, 구경, 가로길이, 세로길이, 연장, 차선통로수, 평균구배, 심도, 읍면동, 법정동, 처리분구, 설치일자, 공사번호,
             관리기관,
             도엽번호, 관라벨)
AS
SELECT ms.geom      AS geom,
       ms.layer     AS 레이어,
       ms.ftr_idn   AS 관리번호,
       sad.adp_nam  AS 처리구역,
       sba.cname    AS 연결관용도,
       smp.cname_sl AS 관재질,
       sfr.cname    AS 단면형태,
       ms.pip_dip   AS 구경,
       ms.pip_hol   AS 가로길이,
       ms.pip_vel   AS 세로길이,
       ms.pip_len   AS 연장,
       ms.pip_lin   AS 차선통로수,
       ms.pip_slp   AS 평균구배,
       ms.pip_dep   AS 심도,
       sbj.hjd_nam  AS 읍면동,
       sbj.bjd_nam  AS 법정동,
       sdd.ddp_nam  AS 처리분구,
       ms.ist_ymd   AS 설치일자,
       ms.cnt_num   AS 공사번호,
       smg.cname    AS 관리기관,
       ms.sht_num   AS 도엽번호,
       ms.pip_lbl   AS 관라벨
FROM swl_conn_ls ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_mop smp ON smp.tbl_nam = '관재질'::bpchar AND ms.mop_cde = smp.codeno
         LEFT JOIN private.cd_sba sba ON ms.sba_cde = sba.codeno
         LEFT JOIN private.cd_for sfr ON ms.for_cde = sfr.codeno;

