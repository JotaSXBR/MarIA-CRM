DO $$
DECLARE
  runtime_role record;
BEGIN
  SELECT rolcanlogin, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
  INTO runtime_role
  FROM pg_roles
  WHERE rolname = 'maria_runtime';

  IF NOT FOUND THEN
    CREATE ROLE maria_runtime
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  ELSIF NOT runtime_role.rolcanlogin
    OR runtime_role.rolsuper
    OR runtime_role.rolcreaterole
    OR runtime_role.rolcreatedb
    OR runtime_role.rolreplication
    OR runtime_role.rolbypassrls THEN
    RAISE EXCEPTION 'maria_runtime has unsafe role attributes';
  ELSIF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relowner = (SELECT oid FROM pg_roles WHERE rolname = 'maria_runtime')
      AND relname IN ('contacts', 'companies')
  ) THEN
    RAISE EXCEPTION 'maria_runtime must not own protected tenant tables';
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO maria_runtime', current_database());
END
$$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO maria_runtime;
--> statement-breakpoint
REVOKE ALL ON contacts, companies FROM maria_runtime;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON contacts, companies TO maria_runtime;
