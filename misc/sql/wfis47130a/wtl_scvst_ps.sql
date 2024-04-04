ALTER TABLE public.wtl_scvst_ps
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPoint, 5187);

DROP VIEW IF EXISTS public.viw_wtl_scvst_ps;

CREATE OR REPLACE VIEW public.viw_wtl_scvst_ps
            (geom, 레이어, 급수구역, 관경, 관재질, 설치위치, 행정동, 법정동, 급수분구, 설치일자, 공사명, 관리기관, 도엽번호, 방향각) AS
SELECT ms.geom      AS geom,
       ms.layer     AS 레이어,
       swg.wsg_nam  AS 급수구역,
       ms.scv_dip   AS 관경,
       smp.cname_sl AS 관재질,
       ms.scv_pos   AS 설치위치,
       sbj.hjd_nam  AS 행정동,
       sbj.bjd_nam  AS 법정동,
       swb.wsb_nam  AS 급수분구,
       ms.ist_ymd   AS 설치일자,
       ms.cnt_num   AS 공사명,
       smg.cname    AS 관리기관,
       ms.sht_num   AS 도엽번호,
       ms.ang_dir   AS 방향각
FROM wtl_scvst_ps ms
         LEFT JOIN bml_badm_as sbj ON ms.bjd_cde = sbj.bjd_cde
         LEFT JOIN wtl_wtsa_as swg ON ms.wsg_cde = swg.wsg_cde
         LEFT JOIN wtl_wtssa_as swb ON ms.wsb_cde = swb.wsb_cde
         LEFT JOIN private.cd_mng smg ON ms.mng_cde = smg.codeno
         LEFT JOIN private.cd_mop smp ON smp.tbl_nam = '관재질'::bpchar AND ms.scv_mop = smp.codeno;

