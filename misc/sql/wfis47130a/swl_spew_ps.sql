ALTER TABLE public.swl_spew_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_swl_spew_ps
            (geom, 레이어, 관리번호, 처리구역, 토구용도, 토구형태, 내경, 가로길이, 세로길이, 토구표고, 평균수위, 방류천명, 계획방류량, 배수구역명, 처리구역명, 방향각, 읍면동, 법정동,
             처리분구,
             설치일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 관리번호,
       sad.adp_nam AS 처리구역,
       svm.cname   AS 토구용도,
       sfr.cname   AS 토구형태,
       ms.spw_dip  AS 내경,
       ms.spw_hol  AS 가로길이,
       ms.spw_vel  AS 세로길이,
       ms.spw_hsl  AS 토구표고,
       ms.spw_wal  AS 평균수위,
       ms.riv_nam  AS 방류천명,
       ms.spw_vol  AS 계획방류량,
       sar.adr_nam AS 배수구역명,
       sap.adp_nam AS 처리구역명,
       ms.ang_dir  AS 방향각,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       sdd.ddp_nam AS 처리분구,
       ms.ist_ymd  AS 설치일자,
       ms.cnt_num  AS 공사번호,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM swl_spew_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN swl_aodr_as sar ON ms.dra_idn = sar.ftr_idn
         LEFT JOIN swl_aodp_as sap ON ms.dsp_idn = sap.ftr_idn
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_vmt svm ON ms.vmt_cde = svm.codeno
         LEFT JOIN private.cd_for sfr ON ms.for_cde = sfr.codeno;

