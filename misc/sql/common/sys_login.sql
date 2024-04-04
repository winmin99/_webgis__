CREATE TABLE IF NOT EXISTS private.sys_login
(
    id        serial      NOT NULL
        CONSTRAINT sys_login_pk
            PRIMARY KEY,
    username  varchar(20) NOT NULL,
    password  varchar(80) NOT NULL,
    userid_fk integer     NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_login_id_uindex
    ON private.sys_login (id);

CREATE UNIQUE INDEX IF NOT EXISTS sys_login_username_uindex
    ON private.sys_login (username);