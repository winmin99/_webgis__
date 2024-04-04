CREATE TABLE IF NOT EXISTS private.sys_membership
(
    id           serial                NOT NULL,
    userid_fk    integer               NOT NULL
        CONSTRAINT sys_membership_sys_user_id_fk
            REFERENCES private.sys_user,
    companyid_fk integer               NOT NULL
        CONSTRAINT sys_membership_sys_company_id_fk
            REFERENCES private.sys_company,
    roleid_fk    integer               NOT NULL
        CONSTRAINT sys_membership_sys_role_id_fk
            REFERENCES private.sys_role,
    email        varchar(60),
    phone        varchar(20),
    active       boolean DEFAULT FALSE NOT NULL,
    reset        boolean DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS sys_membership_id_uindex
    ON private.sys_membership (id);

UPDATE private.sys_membership
SET active = true,
    reset = false
WHERE id = 1;