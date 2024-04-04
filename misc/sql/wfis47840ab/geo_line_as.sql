-- 지적선.DBF 등을 geo_line.dbf 로 바꾸어 import --

CREATE TABLE IF NOT EXISTS public.geo_line_as
(
    ftr_idn char(10) NOT NULL
        CONSTRAINT geo_line_as_pkey
            PRIMARY KEY,
    geom    geometry(MultiPolygon, 5187),
    pnu     varchar(19) DEFAULT NULL::character varying,
    jibun   varchar(15) DEFAULT NULL::character varying,
    bjd_cod char(10)    DEFAULT NULL::bpchar,
    par_lbl varchar(20) DEFAULT NULL::character varying,
    hjd_nam varchar(20) DEFAULT NULL::character varying,
    bjd_nam varchar(20) DEFAULT NULL::character varying
);
