ALTER TABLE public.swl_dran_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_swl_dran_ps;

CREATE OR REPLACE VIEW public.viw_swl_dran_ps
            (geom, 레이어, 관리번호, 처리구역, 하수처리장명, 부지면적, 개통상태, 처리구역면적, 하수처리방식, 청천시처리용량, 우천시처리용량, 설계유입수수질, 설계유출수수질, 차집관연장,
             방류수역명, 방향각,
             읍면동, 법정동, 처리분구, 설치일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 관리번호,
       sad.adp_nam AS 처리구역,
       ms.drn_nam  AS 하수처리장명,
       ms.drn_ara  AS 부지면적,
       soo.cname   AS 개통상태,
       ms.adp_siz  AS 처리구역면적,
       sbb.cname   AS 하수처리방식,
       ms.pcc_vol  AS 청천시처리용량,
       ms.puc_vol  AS 우천시처리용량,
       ms.drn_sb1  AS 설계유입수수질,
       ms.drn_sb2  AS 설계유출수수질,
       ms.pip_len  AS 차집관연장,
       ms.dra_nam  AS 방류수역명,
       ms.ang_dir  AS 방향각,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       sdd.ddp_nam AS 처리분구,
       ms.ist_ymd  AS 설치일자,
       ms.cnt_num  AS 공사번호,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM swl_dran_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_soo soo ON ms.soo_cde = soo.codeno
         LEFT JOIN private.cd_sbb sbb ON ms.sbb_cde = sbb.codeno;

