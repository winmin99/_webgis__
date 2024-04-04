CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.sys_user
(
    id        SERIAL      NOT NULL
        CONSTRAINT sys_user_pk
            PRIMARY KEY,
    firstname VARCHAR(20) NOT NULL,
    lastname  VARCHAR(20) NOT NULL,
    username  VARCHAR(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_user_id_uindex
    ON private.sys_user (id);

CREATE TABLE IF NOT EXISTS private.sys_login
(
    id        SERIAL      NOT NULL
        CONSTRAINT sys_login_pk
            PRIMARY KEY,
    username  VARCHAR(20) NOT NULL,
    password  VARCHAR(80) NOT NULL,
    userid_fk INTEGER     NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_login_id_uindex
    ON private.sys_login (id);

CREATE TABLE IF NOT EXISTS private.sys_role
(
    id        SERIAL      NOT NULL
        CONSTRAINT sys_role_pk
            PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_role_id_uindex
    ON private.sys_role (id);

CREATE UNIQUE INDEX IF NOT EXISTS sys_role_role_name_uindex
    ON private.sys_role (role_name);

CREATE TABLE IF NOT EXISTS private.sys_company
(
    id           serial                NOT NULL
        CONSTRAINT sys_company_pk
            PRIMARY KEY,
    company_name varchar(20),
    wtl          boolean DEFAULT FALSE NOT NULL,
    swl          boolean DEFAULT FALSE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_company_company_name_uindex
    ON private.sys_company (company_name);

CREATE UNIQUE INDEX IF NOT EXISTS sys_company_id_uindex
    ON private.sys_company (id);

CREATE TABLE IF NOT EXISTS private.sys_membership
(
    id           SERIAL  NOT NULL
        CONSTRAINT sys_membership_pk
            PRIMARY KEY,
    userid_fk    INTEGER NOT NULL
        CONSTRAINT sys_membership_sys_user_id_fk
            REFERENCES private.sys_user,
    companyid_fk INTEGER NOT NULL
        CONSTRAINT sys_membership_sys_company_id_fk
            REFERENCES private.sys_company,
    roleid_fk    INTEGER NOT NULL
        CONSTRAINT sys_membership_sys_role_id_fk
            REFERENCES private.sys_role,
    email        VARCHAR(60),
    phone        VARCHAR(20)
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_membership_id_uindex
    ON private.sys_membership (id);

INSERT INTO private.sys_role
VALUES (1, '상수');
INSERT INTO private.sys_role
VALUES (2, '하수');
INSERT INTO private.sys_company
VALUES (0, '대진기술정보(주)', true, true);
INSERT INTO private.sys_company
VALUES (1, '성주군', true, true);
INSERT INTO private.sys_company
VALUES (2, '경주시', true, false);
