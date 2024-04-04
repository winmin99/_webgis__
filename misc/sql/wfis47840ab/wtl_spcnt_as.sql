ALTER TABLE public.wtl_spcnt_as
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 5187);

DROP VIEW IF EXISTS public.viw_wtl_spcnt_as;

CREATE OR REPLACE VIEW public.viw_wtl_spcnt_as
            (geom, 레이어, 일련번호, 급수구역, 시공구분, 시공내용, 읍면동, 법정동, 급수분구, 설치일자, 공사명, 관리기관, 도엽번호) AS
SELECT ms.geom     AS geom,
       ms.layer    AS 레이어,
       ms.ftr_idn  AS 일련번호,
       swg.wsg_nam AS 급수구역,
       scs.cname   AS 시공구분,
       ms.cns_exp  AS 시공내용,
       sbj.hjd_nam AS 읍면동,
       sbj.bjd_nam AS 법정동,
       swb.wsb_nam AS 급수분구,
       ms.ist_ymd  AS 설치일자,
       ms.cnt_num  AS 공사명,
       smg.cname   AS 관리기관,
       ms.sht_num  AS 도엽번호
FROM wtl_spcnt_as ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN wtl_wtsa_as swg ON ms.wsg_cde = swg.wsg_cde
         LEFT JOIN wtl_wtssa_as swb ON ms.wsb_cde = swb.wsb_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_cns scs ON ms.cns_cde = scs.codeno;
