CREATE TABLE IF NOT EXISTS public.wtl_wspipe_ls
(
    geom geometry(LineString, 5187),
    관리번호 integer                                     NOT NULL
        CONSTRAINT wtl_wspipe_ls_pkey
            PRIMARY KEY,
    관라벨  varchar(50) DEFAULT NULL::character varying NOT NULL
);
