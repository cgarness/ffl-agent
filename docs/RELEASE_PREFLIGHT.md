# Release preflight — intake and consent (PR #11)

Status: **awaiting approval**. Nothing below has been applied to the hosted database or deployed to production. This page is the exact plan for the person who approves and runs the release.

## Confirmed targets

| Layer | Target | How it was confirmed |
|---|---|---|
| Repository | `cgarness/ffl-agent`, branch `cursor/a2p-consent-intake-c93e` | `git remote`, PR #11 |
| Website database | Supabase project `rtgmdbqzkwlmplurypyh` (`https://rtgmdbqzkwlmplurypyh.supabase.co`) | `supabase/config.toml`, `.env`, Vercel project env vars `VITE_SUPABASE_*` |
| Website hosting | Vercel project `underwriterverified` (`prj_8B75x0g4FBYsP2uzSIEeCYHhMJSw`), team `cgarness-projects`, production branch `main`, aliases `www.underwriterverified.com` / `underwriterverified.com` | `vercel project inspect`, Vercel API |
| Current production deployment | `dpl_EaYxadau9ifZd1hhMGZ6RS2Dgrr5` built from `main` @ `f220400a` (merge of PR #10) | Vercel API deployment metadata |

This Supabase project is the website's own database. It is not the AgentFlow database. Nothing in this release touches AgentFlow.

## Hosted state observed before the release (read-only, public key)

Checked with the public anon key over PostgREST. No catalog access was available, so this is what the public site key can see, not a full policy listing.

- `public.agents` is readable: one row, `id = e7c2f35a-e215-4e9e-9492-176a344384eb`, `agency_slug = cg-financial`, `slug = christopher-garness`.
- **That row has `user_id = NULL`.** No login owns the canonical profile today. The `/agent-admin` inbox and profile editor look up the profile by `user_id = auth.uid()`, so until this is corrected Chris cannot see intake requests, and the ownership migration will leave the row editable only by an administrator.
- The anon key still holds `UPDATE` and `DELETE` grants on `public.agents` (a zero-row `PATCH`/`DELETE` returned `200 []` instead of `42501`). This is the inherited exposure that `20260929203000_lock_agent_ownership.sql` closes. No row was changed by the probe.
- `submit_public_intake`, `evaluate_sms_eligibility`, `intake_requests`, and `sms_consent_events` do not exist yet (`404` / `PGRST202` / `PGRST205`). The intake migration is not applied.
- The `user_id` and `agency_slug` columns exist, so migrations through `20260506175802` are applied.

Not verified: the applied-migration history table, the full `pg_policies` list, trigger list, and function grants. Those need authenticated project access (see "Access needed").

## Access needed

Hosted inspection and `supabase db push` were not possible from this environment. The Supabase MCP connection for this Cursor cloud agent timed out during authentication (twice). One of these restores access:

1. Re-authorize the Supabase MCP server for Cloud Agents in Cursor (Dashboard → Cloud Agents → MCP → Supabase → authenticate), completing the browser OAuth prompt, then re-run the agent.
2. Or add Cloud Agent secrets `SUPABASE_ACCESS_TOKEN` (a personal access token from the Supabase dashboard, Account → Access Tokens) and `SUPABASE_DB_PASSWORD` (project database password) so the Supabase CLI can `supabase link --project-ref rtgmdbqzkwlmplurypyh` and `supabase db push`.
3. Or Chris runs the steps below himself from the Supabase dashboard and CLI.

No credentials are stored in this repository.

## Release order

Database first, then ownership, then frontend. Do not merge PR #11 before steps 1–3 are done; the preview build already points at the production database, and the production frontend would otherwise call an RPC that does not exist.

### 1. Apply the two migrations, in order

Files (branch head `cursor/a2p-consent-intake-c93e`):

- `supabase/migrations/20260929183000_public_intake_and_sms_consent.sql`
- `supabase/migrations/20260929203000_lock_agent_ownership.sql`

Preferred path (records history):

```bash
supabase link --project-ref rtgmdbqzkwlmplurypyh
supabase migration list        # confirm every earlier file shows as applied remotely before pushing
supabase db push
```

If `migration list` shows earlier local files missing from the remote history, stop and reconcile with `supabase migration repair` before pushing; do not apply files twice. If the CLI is unavailable, run the two files in the Supabase SQL editor in the order above, then record them with `supabase migration repair --status applied 20260929183000 20260929203000` when the CLI is available.

Both files run cleanly on top of the full migration chain (verified locally by `scripts/test-intake-sql.sh`). They are forward-only. They do not edit historical migrations.

### 2. Confirm Chris's login and link the canonical profile

Do not guess. Chris confirms the email of the account he signs in with at `https://www.underwriterverified.com/agent-admin/login`. If he has no account yet, he signs up there first; the signup trigger will create a starter profile for that login, which is removed below.

Run as an administrator in the SQL editor (the `postgres` role is allowed to change `user_id`; `anon` and `authenticated` are not):

```sql
-- 1. Find the login. Must return exactly one row and the email must be the one Chris confirmed.
SELECT id, email, created_at FROM auth.users WHERE lower(email) = lower('<confirmed email>');

-- 2. Any starter profile created for that login by signup? Must be removed first (user_id is unique).
SELECT id, agency_slug, slug FROM public.agents WHERE user_id = '<auth.users.id from step 1>';
-- DELETE FROM public.agents WHERE id = '<starter profile id>';   -- only if a starter row exists

-- 3. Link the canonical profile.
UPDATE public.agents
SET user_id = '<auth.users.id from step 1>'
WHERE id = 'e7c2f35a-e215-4e9e-9492-176a344384eb' AND user_id IS NULL;
-- expect UPDATE 1
```

Verification: Chris signs in at `/agent-admin` and sees his existing profile fields (name, agency, NPN, headshot) rather than an empty form. That is the ownership evidence; a name match is not.

### 3. Verify the hosted catalog

As an administrator (SQL editor or CLI):

```sql
SELECT policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' ORDER BY 1;
-- expect exactly: "Anyone can view agent profiles" {public} SELECT, and
--   "Users insert own agent" / "Users update own agent" / "Users delete own agent" {authenticated}.
--   "Anyone can insert agents (anon)" and "Anyone can update agents (anon)" must be gone.

SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'agents' AND grantee IN ('anon', 'authenticated') ORDER BY 1, 2;
-- expect anon: SELECT only. authenticated: SELECT, INSERT, UPDATE, DELETE.

SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.agents'::regclass AND NOT tgisinternal;
-- expect agents_protect_ownership

SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name IN ('intake_requests', 'sms_consent_events', 'sms_suppressions') AND grantee IN ('anon', 'authenticated') ORDER BY 1, 2;
-- expect authenticated SELECT only; no anon rows

SELECT p.proname, r.rolname, has_function_privilege(r.rolname, p.oid, 'EXECUTE') AS can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role')) AS r(rolname)
WHERE n.nspname = 'public' AND p.proname IN ('submit_public_intake', 'evaluate_sms_eligibility', 'record_sms_suppression', 'my_sms_eligibility')
ORDER BY 1, 2;
-- expect submit_public_intake: anon true, authenticated true. evaluate/record: service_role only. my_sms_eligibility: authenticated only.
```

Public-key check from any machine (no data changed): `PATCH https://rtgmdbqzkwlmplurypyh.supabase.co/rest/v1/agents?id=eq.00000000-0000-0000-0000-000000000000` with the anon key must now return `401`/`403` with code `42501`, and `GET /rest/v1/agents?select=id` must still return `200`.

### 4. Deploy the frontend

Merge PR #11 into `main`. Vercel builds `main` to production automatically. Confirm with the Vercel API or `vercel ls underwriterverified` that the new production deployment's `githubCommitSha` is the merge commit of PR #11, and that `https://www.underwriterverified.com/sms-opt-in` shows two unchecked checkboxes.

### 5. Verify the live flow

One clearly labeled synthetic submission per form (first name `TEST`, an `example.test` email, a 555-01xx number), both boxes unchecked for one and only the informational box for the other. Then Chris opens `/agent-admin` and sees both rows with the recorded choices. Do not send any text. Leave the synthetic rows in place; they are append-only and labeled.

## Rollback

- Frontend: in Vercel, promote the previous production deployment (`dpl_EaYxadau9ifZd1hhMGZ6RS2Dgrr5`) or revert the merge commit on `main`. The old frontend never calls the new RPC, so the database can stay as is.
- Ownership lock: do **not** restore the anon write policies. If profile editing must be reopened for someone, set that person's `user_id` as an administrator instead.
- Intake tables: do **not** drop `intake_requests`, `sms_consent_events`, or `sms_suppressions`. They hold consent evidence and are append-only by trigger. If the intake API must be closed quickly, run `REVOKE EXECUTE ON FUNCTION public.submit_public_intake(uuid, text, text, text, text, text, text, text, text, text, boolean, boolean, text, text) FROM anon, authenticated;` — the forms will show the save-failed message and nothing is lost.

## Known follow-ups (not blockers for this release)

- Vercel preview deployments use the production `VITE_SUPABASE_*` values. After the migrations are applied, a form submission on any preview URL writes a real row into the production database. Either add preview-scoped Supabase variables pointing at a separate project or do not submit forms on preview URLs.
- The frontend maps a missing RPC (`PGRST202`) to the message "This form is out of date. Refresh the page and try again." That message is only reachable if the frontend is deployed before the database, which the order above prevents.
