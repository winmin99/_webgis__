CREATE TABLE IF NOT EXISTS public.swl_hmpipe_ls
(
    id   serial NOT NULL
        CONSTRAINT swl_hmpipe_ls_pkey
            PRIMARY KEY,
    geom geometry(LineString, 5187),
    관라벨  varchar(50)
);
