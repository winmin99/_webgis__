ALTER TABLE public.swl_hmconn_ls
    ADD COLUMN IF NOT EXISTS geom geometry(LineString, 5187);

CREATE OR REPLACE VIEW public.viw_swl_hmconn_ls
            (geom, 레이어, 관리번호, 처리구역, 물받이형태, 원형물받이내경, 각형물받이가로길이, 각형물받이세로길이, 물받이깊이, 물받이뚜껑형태, 물받이뚜껑재질, 방향각, 관재질, 단면형태, 구경,
             가로길이,
             세로길이, 연장, 평균구배, 심도, 본관재질, 본관단면형태, 본관구경, 본관가로길이, 본관세로길이, 읍면동, 동리, 처리분구, 설치일자, 준설일자, 공사번호, 관리기관, 도엽번호)
AS
SELECT ms1.geom      AS geom,
       ms1.layer     AS 레이어,
       ms1.ftr_idn   AS 관리번호,
       ssd.adp_nam   AS 처리구역,
       sfrp.cname    AS 물받이형태,
       ms2.spt_dip   AS 원형물받이내경,
       ms2.spt_hol   AS 각형물받이가로길이,
       ms2.spt_vel   AS 각형물받이세로길이,
       ms2.spt_dep   AS 물받이깊이,
       scv.cname     AS 물받이뚜껑형태,
       smpp.cname    AS 물받이뚜껑재질,
       ms2.ang_dir   AS 방향각,
       smpl.cname_sl AS 관재질,
       sfr.cname     AS 단면형태,
       ms1.pip_dip   AS 구경,
       ms1.pip_hol   AS 가로길이,
       ms1.pip_vel   AS 세로길이,
       ms1.pip_len   AS 연장,
       ms1.pip_slp   AS 평균구배,
       ms1.pip_dep   AS 심도,
       smpm.cname_sl AS 본관재질,
       sfrm.cname    AS 본관단면형태,
       ms1.mpip_dip  AS 본관구경,
       ms1.mpip_hol  AS 본관가로길이,
       ms1.mpip_vel  AS 본관세로길이,
       sbj.hjd_nam   AS 읍면동,
       sbj.bjd_nam   AS 동리,
       sdd.ddp_nam   AS 처리분구,
       ms1.ist_ymd   AS 설치일자,
       ms2.ecn_ymd   AS 준설일자,
       ms1.cnt_num   AS 공사번호,
       smg.cname     AS 관리기관,
       ms1.sht_num   AS 도엽번호
FROM swl_hmconn_ls ms1
         LEFT JOIN swl_hmspot_ps ms2 ON ms1.ftr_idn = ms2.ftr_idn
         LEFT JOIN bml_badm_as sbj ON ms1.bjd_cde = sbj.bjd_cde
         LEFT JOIN swl_aodp_as ssd ON ms1.adp_cde = ssd.adp_cde
         LEFT JOIN swl_dodp_as sdd ON ms1.ddp_cde = sdd.ddp_cde
         LEFT JOIN private.cd_mng smg ON ms1.mng_cde = smg.codeno
         LEFT JOIN private.cd_mop smpl ON smpl.tbl_nam = '관재질'::bpchar AND ms1.mop_cde = smpl.codeno
         LEFT JOIN private.cd_mop smpm ON smpm.tbl_nam = '관재질'::bpchar AND ms1.mmop_cde = smpm.codeno
         LEFT JOIN private.cd_mop smpp ON smpp.tbl_nam = '받이뚜껑재질'::bpchar AND ms2.mop_cde = smpp.codeno
         LEFT JOIN private.cd_cov scv ON ms2.cov_cde = scv.codeno
         LEFT JOIN private.cd_for sfrp ON ms2.for_cde = sfrp.codeno
         LEFT JOIN private.cd_for sfrm ON ms1.mfor_cde = sfrm.codeno
         LEFT JOIN private.cd_for sfr ON ms1.for_cde = sfr.codeno;
