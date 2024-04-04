CREATE TABLE IF NOT EXISTS public.wtl_cap_ps
(
    id   serial NOT NULL
        CONSTRAINT wtl_cap_ps_pkey
            PRIMARY KEY,
    geom geometry(MultiPoint, 5187),
    방향각  bigint
);
