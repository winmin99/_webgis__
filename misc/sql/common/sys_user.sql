CREATE TABLE IF NOT EXISTS private.sys_user
(
    id        serial      NOT NULL
        CONSTRAINT sys_user_pk
            PRIMARY KEY,
    firstname varchar(20) NOT NULL,
    lastname  varchar(20) NOT NULL,
    username  varchar(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_user_id_uindex
    ON private.sys_user (id);

CREATE UNIQUE INDEX IF NOT EXISTS sys_user_username_uindex
    ON private.sys_user (username);

