CREATE TABLE IF NOT EXISTS public.swl_pipe_as
(
    geom geometry(MultiPolygon, 5187),
    ftr_cde char(5)       DEFAULT NULL::bpchar            NOT NULL,
    ftr_idn integer                                       NOT NULL
        CONSTRAINT swl_pipe_as_pkey
            PRIMARY KEY,
    eddate  timestamp
);
