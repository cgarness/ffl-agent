#!/usr/bin/env bash
# Runs the intake migration against a throwaway local database.
# Does not connect to the hosted Supabase project.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="ffl_intake_test"

if ! command -v psql >/dev/null 2>&1; then
  echo "BLOCKED: psql is not installed, so the database tests were not executed."
  exit 2
fi

PSQL=(psql)
if sudo -u postgres psql -c "SELECT 1" >/dev/null 2>&1; then
  PSQL=(sudo -u postgres psql)
  sudo -u postgres dropdb --if-exists "$DB_NAME"
  sudo -u postgres createdb "$DB_NAME"
else
  dropdb --if-exists "$DB_NAME"
  createdb "$DB_NAME"
fi

"${PSQL[@]}" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f - <<'SQL'
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END $$;
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  agency_slug text NOT NULL,
  name text NOT NULL,
  agency text NOT NULL DEFAULT '',
  user_id uuid,
  UNIQUE (agency_slug, slug)
);
SQL

"${PSQL[@]}" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20260929183000_public_intake_and_sms_consent.sql"
"${PSQL[@]}" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/intake_assertions.sql"
echo "INTAKE_SQL_OK"
