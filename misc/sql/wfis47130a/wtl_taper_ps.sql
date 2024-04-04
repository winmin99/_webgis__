CREATE TABLE IF NOT EXISTS public.wtl_taper_ps
(
    id   serial NOT NULL
        CONSTRAINT wtl_taper_ps_pkey
            PRIMARY KEY,
    geom geometry(MultiPoint, 5187),
    방향각  integer
);
