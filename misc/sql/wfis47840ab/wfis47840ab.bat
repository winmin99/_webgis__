:: psql -h %HOST% -p %PORT% -U %DB_OWNER% -d %%DB_NAME% -f %FILE%
psql -h localhost -p 5432 -U postgres -d wfis47840ab -f 0_import.sql