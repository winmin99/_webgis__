DROP VIEW viw_wtt_wutl_ht_re;

CREATE OR REPLACE VIEW viw_wtt_wutl_ht_re
            (id, geom, 레이어, 관리번호, 시설물구분, 유지보수일자, 유지보수구분, 유지보수사유, 유지보수내용, 시공자명, 읍면동, 법정동, 급수구역, 급수분구) AS
SELECT wutl_tb.id,
       wutl_tb.geom,
       '보수공사'::text    AS "레이어",
       wutl_tb.ftr_idn AS "관리번호",
       ftr_tb.cname    AS "시설물구분",
       wutl_tb.rep_ymd AS "유지보수일자",
       rep_tb.cname    AS "유지보수구분",
       sbj_tb.cname    AS "유지보수사유",
       wutl_tb.rep_des AS "유지보수내용",
       wutl_tb.opr_nam AS "시공자명",
       bjd_tb.hjd_nam  AS "읍면동",
       bjd_tb.bjd_nam  AS "법정동",
       wsb_tb.wsg_nam  AS "급수구역",
       wsb_tb.wsb_nam  AS "급수분구"
FROM wtt_wutl_ht_re wutl_tb
         LEFT JOIN private.cd_ftr ftr_tb ON wutl_tb.ftr_cde = ftr_tb.codeno
         LEFT JOIN private.cd_rep rep_tb ON wutl_tb.rep_cde = rep_tb.codeno
         LEFT JOIN private.cd_sbj sbj_tb ON wutl_tb.sbj_cde = sbj_tb.codeno
         LEFT JOIN wtl_wtssa_as wsb_tb ON wutl_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN bml_hadm_as hjd_tb ON wutl_tb.hjd_cde = hjd_tb.hjd_cde
         LEFT JOIN bml_badm_as bjd_tb ON wutl_tb.bjd_cde = bjd_tb.bjd_cde;
