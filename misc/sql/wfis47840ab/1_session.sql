CREATE TABLE "session"
(
    "sid"    VARCHAR      NOT NULL,
    "sess"   JSON         NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL
)
    WITH (OIDS= FALSE);
ALTER TABLE "session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");