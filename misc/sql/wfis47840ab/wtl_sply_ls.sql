ALTER TABLE public.wtl_sply_ls
    ADD COLUMN IF NOT EXISTS geom geometry(LineString, 5187);

DROP VIEW IF EXISTS public.viw_wtl_sply_ls;

CREATE OR REPLACE VIEW public.viw_wtl_sply_ls
            (geom, 레이어, 관리번호, 급수구역, 원관구경, 원관재질, 급수구경, 급수관재질, 연장, 접합종류, 최저깊이, 최고깊이, 수용가번호, 수용가성명, 수용가주소설명, 가구수, 업종,
             계량기기물번호, 계량기구경, 계량기형식, 계량기제작회사명, 읍면동, 법정동, 급수분구, 설치일자, 공사명, 관리기관, 도엽번호, 관라벨)
AS
SELECT sply_tb.geom,
       btrim(sply_tb.layer::text) AS 레이어,
       sply_tb.ftr_idn            AS 관리번호,
       wsg_tb.wsg_nam             AS 급수구역,
       sply_tb.mpip_dip           AS 원관구경,
       parent_mop_tb.cname_sl     AS 원관재질,
       sply_tb.pip_dip            AS 급수구경,
       mop_tb.cname_sl            AS 급수관재질,
       sply_tb.pip_len            AS 연장,
       jht_tb.cname               AS 접합종류,
       sply_tb.low_dep            AS 최저깊이,
       sply_tb.hgh_dep            AS 최고깊이,
       meta_tb.hom_num            AS 수용가번호,
       meta_tb.hom_nam            AS 수용가성명,
       meta_tb.hom_adr            AS 수용가주소설명,
       meta_tb.hom_cnt            AS 가구수,
       sbi_tb.cname               AS 업종,
       meta_tb.met_num            AS 계량기기물번호,
       meta_tb.met_dip            AS 계량기구경,
       mof_tb.cname               AS 계량기형식,
       meta_tb.prd_num            AS 계량기제작회사명,
       bjd_tb.hjd_nam             AS 읍면동,
       bjd_tb.bjd_nam             AS 법정동,
       wsb_tb.wsb_nam             AS 급수분구,
       sply_tb.ist_ymd            AS 설치일자,
       sply_tb.cnt_num            AS 공사명,
       mng_tb.cname               AS 관리기관,
       sply_tb.sht_num            AS 도엽번호,
       sply_tb.pip_lbl            AS 관라벨
FROM wtl_sply_ls sply_tb
         LEFT JOIN wtl_meta_ps meta_tb ON sply_tb.ftr_idn = meta_tb.ftr_idn
         LEFT JOIN wtl_wtsa_as wsg_tb ON sply_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON sply_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN bml_badm_as bjd_tb ON sply_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON sply_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mop parent_mop_tb
                   ON sply_tb.mmop_cde = parent_mop_tb.codeno AND parent_mop_tb.tbl_nam = '관재질'::bpchar
         LEFT JOIN private.cd_mop mop_tb ON sply_tb.mop_cde = mop_tb.codeno AND mop_tb.tbl_nam = '관재질'::bpchar
         LEFT JOIN private.cd_jht jht_tb ON sply_tb.jht_cde = jht_tb.codeno
         LEFT JOIN private.cd_sbi sbi_tb ON meta_tb.sbi_cde = sbi_tb.codeno
         LEFT JOIN private.cd_mof mof_tb ON meta_tb.met_mof = mof_tb.codeno AND mof_tb.tbl_nam = '계량기형식'::bpchar;
