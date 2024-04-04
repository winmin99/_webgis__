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
	
INSERT INTO private.sys_company (id, company_name, wtl, swl) VALUES (0, '대진기술정보(주)', true, true);
INSERT INTO private.sys_company (id, company_name, wtl, swl) VALUES (2, '경주시', true, false);
INSERT INTO private.sys_company (id, company_name, wtl, swl) VALUES (1, '성주군', true, true);