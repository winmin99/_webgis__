ALTER TABLE public.swl_manh_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_swl_manh_ps
            (geom, 레이어, 관리번호, 처리구역, 맨홀형태, 맨홀종류, 맨홀구경, 맨홀가로, 맨홀세로, 맨홀뚜껑재질, 인버트유무, 사다리설치유무, 맨홀고도, 맨홀저고, 맨홀심도, 맨홀이상상태, 방향각, 읍면동,
             법정동, 처리분구, 설치일자, 최종준설일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 관리번호,
       sad.adp_nam AS 처리구역,
       sfr.cname   AS 맨홀형태,
       som.cname   AS 맨홀종류,
       ms.man_dip  AS 맨홀구경,
       ms.man_hol  AS 맨홀가로,
       ms.man_vel  AS 맨홀세로,
       sbc.cname   AS 맨홀뚜껑재질,
       siv.cname   AS 인버트유무,
       sla.cname   AS 사다리설치유무,
       ms.mos_hsl  AS 맨홀고도,
       ms.lms_hsl  AS 맨홀저고,
       ms.man_dep  AS 맨홀심도,
       sct.cname   AS 맨홀이상상태,
       ms.ang_dir  AS 방향각,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       sdd.ddp_nam AS 처리분구,
       ms.ist_ymd  AS 설치일자,
       ms.ecn_ymd  AS 최종준설일자,
       ms.cnt_num  AS 공사번호,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM swl_manh_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_som som ON ms.som_cde = som.codeno
         LEFT JOIN private.cd_for sfr ON ms.for_cde = sfr.codeno
         LEFT JOIN private.cd_sbc sbc ON ms.sbc_cde = sbc.codeno
         LEFT JOIN private.cd_ivt siv ON ms.ivt_cde = siv.codeno
         LEFT JOIN private.cd_lad sla ON ms.lad_cde = sla.codeno
         LEFT JOIN private.cd_cst sct ON ms.cst_cde = sct.codeno;

