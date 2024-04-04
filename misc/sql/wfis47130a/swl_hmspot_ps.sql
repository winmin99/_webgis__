ALTER TABLE public.swl_hmspot_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

DROP VIEW IF EXISTS public.viw_swl_hmspot_ps;

CREATE OR REPLACE VIEW public.viw_swl_hmspot_ps
            (geom, 레이어, 관리번호, 처리구역, 물받이형태, 내경, 가로길이, 세로길이, 깊이, 뚜껑형태, 뚜껑재질, 방향각, 읍면동, 법정동, 처리분구, 설치일자, 최종준설일자, 공사번호,
             관리기관, 도엽번호)
AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 관리번호,
       sad.adp_nam AS 처리구역,
       sfr.cname   AS 물받이형태,
       ms.spt_dip  AS 내경,
       ms.spt_hol  AS 가로길이,
       ms.spt_vel  AS 세로길이,
       ms.spt_dep  AS 깊이,
       scv.cname   AS 뚜껑형태,
       smp.cname   AS 뚜껑재질,
       ms.ang_dir  AS 방향각,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       sdd.ddp_nam AS 처리분구,
       ms.ist_ymd  AS 설치일자,
       ms.ecn_ymd  AS 최종준설일자,
       ms.cnt_num  AS 공사번호,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM swl_hmspot_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as sad ON ms.adp_cde = sad.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_mop smp ON smp.tbl_nam = '받이뚜껑재질'::bpchar AND ms.mop_cde = smp.codeno
         LEFT JOIN private.cd_for sfr ON ms.for_cde = sfr.codeno
         LEFT JOIN private.cd_cov scv ON ms.cov_cde = scv.codeno;
