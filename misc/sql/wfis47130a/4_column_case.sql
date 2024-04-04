--- DO NOT RUN WITH SCRIPTS ---

SELECT 'ALTER TABLE ' || '"' || table_name || '"' || ' RENAME COLUMN ' || '"' || column_name || '"' || ' TO ' ||
       lower(column_name) || ';'
FROM information_schema.columns
WHERE table_schema = 'public'
  AND lower(column_name) != column_name;

SELECT 'ALTER TABLE ' || '"' || table_name || '"' || ' RENAME COLUMN ' || '"' || column_name || '"' || ' TO ' ||
       lower(column_name) || ';'
FROM information_schema.columns
WHERE table_schema = 'private'
  AND lower(column_name) != column_name;