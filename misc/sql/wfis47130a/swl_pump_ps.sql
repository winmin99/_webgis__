ALTER TABLE public.swl_pump_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

CREATE OR REPLACE VIEW public.viw_swl_pump_ps
            (geom, 레이어, 관리번호, 처리구역, 하수펌프장명, 부지면적, 개통상태, 펌프장용도, 일일처리용량, 최대저수용량, 표고, 수위, 청천시오수양수능력, 우천시오수양수능력, 우수양수능력,
             방향각, 읍면동,
             법정동, 처리분구, 설치일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 관리번호,
       sad.adp_nam AS 처리구역,
       ms.pmp_nam  AS 하수펌프장명,
       ms.pmp_ara  AS 부지면적,
       soo.cname   AS 개통상태,
       sbe.cname   AS 펌프장용도,
       ms.day_vol  AS 일일처리용량,
       ms.max_vol  AS 최대저수용량,
       ms.pmp_alt  AS 표고,
       ms.pmp_wal  AS 수위,
       ms.cos_vol  AS 청천시오수양수능력,
       ms.uos_vol  AS 우천시오수양수능력,
       ms.usu_vol  AS 우수양수능력,
       ms.ang_dir  AS 방향각,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       sdd.ddp_nam AS 처리분구,
       ms.ist_ymd  AS 설치일자,
       ms.cnt_num  AS 공사번호,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM swl_pump_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_soo soo ON ms.soo_cde = soo.codeno
         LEFT JOIN private.cd_sbe sbe ON ms.sbe_cde = sbe.codeno;

