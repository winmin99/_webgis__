CREATE TABLE IF NOT EXISTS private.sys_role
(
    id        serial      NOT NULL
        CONSTRAINT sys_role_pk
            PRIMARY KEY,
    role_name varchar(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_role_id_uindex
    ON private.sys_role (id);

CREATE UNIQUE INDEX IF NOT EXISTS sys_role_role_name_uindex
    ON private.sys_role (role_name);

INSERT INTO private.sys_role (id, role_name) VALUES (1, '상수');
INSERT INTO private.sys_role (id, role_name) VALUES (2, '하수');