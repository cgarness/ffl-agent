# Underwriter Verified: Lovable Cloud transfer

Updated October 3, 2026. The separate destination project is healthy, the original profile is restored, and the secured Edge Function is deployed. Frontend changes remain in draft PR #11; production cutover still needs approval. Do not operate on any AgentFlow resource.

## Confirmed targets

| Resource | Identity |
|---|---|
| Lovable source | Underwriter Verified, project `6ab991ff-a95a-4825-ac82-d10ad1e01aca` |
| Source backend | `rtgmdbqzkwlmplurypyh`, owned by Lovable Cloud |
| New destination organization | Underwriter Verified, `bmuykmwtwicpltmpenqm`, Free plan |
| Destination project | Underwriter Verified, `jzdzeevjpootbeuniygx`, `us-west-1`, ACTIVE_HEALTHY; organization verified before restoration |
| Destination API | `https://jzdzeevjpootbeuniygx.supabase.co` |
| Explicitly excluded | AgentFlow organization `kuzfuinlgtbfkdhlztxn` and project `jncvvsvckxhqgqvkppmj` |

The user completed the database-password step in the dashboard. No database password was read or stored by the assistant. The project uses PostgreSQL 17.11.0.002. Data API is enabled; automatic grants for new tables are disabled, so the migrations explicitly grant the required access.

## Source inventory, directly inspected through Lovable

- PostgreSQL 17.6; one application table, `public.agents`, with one row.
- No `auth.users` or `auth.identities`; no existing website logins to migrate.
- No storage buckets or objects. The existing headshot is a 335,546-character PNG data URL in `agents.headshot_url`.
- No `cron.job` table; no Vault secrets. This does not inventory Edge Function environment secrets.
- Two public functions: `handle_new_agent_user` and `update_updated_at_column`; signup and updated-at triggers exist.
- Canonical profile UUID: `e7c2f35a-e215-4e9e-9492-176a344384eb`; `cg-financial/christopher-garness`; `user_id = NULL`.
- Current SELECT is public; INSERT/UPDATE/DELETE RLS policies are owner-only. The historical anonymous policies are not present in the actual source. Broad table grants still exist; apply the ownership hardening to the destination.
- Actual source includes global `agents_slug_key` uniqueness as well as `(agency_slug, slug)` uniqueness. The pasted handoff omitted the global constraint. Preserve it for this migration; any later change to slug semantics requires its own review.
- Recorded source migration versions differ slightly from repository filenames. Preserve the recorded source catalog; do not claim those histories are identical.
- Only one Edge Function exists in the inspected source tree: `generate-testimonials`. It currently uses Lovable's AI gateway and `LOVABLE_API_KEY`.

The full profile and inspected catalog were captured in `underwriter-verified-source-snapshot.json`, outside Git. The pasted seed is not a data export: it omits the original UUID, timestamps, and headshot. Import the captured row, not a replacement seed. Existing profile content is preserved without asserting that the testimonials are verified client feedback.

## Prepared, guarded restore

Run the offline generator with the saved snapshot and a new private output directory:

```sh
node scripts/prepare-supabase-transfer.mjs /absolute/path/underwriter-verified-source-snapshot.json /absolute/path/new-transfer-output
```

It writes `bootstrap.sql` and a SHA-256 manifest, and does not connect to any service. It stops if the inspected source inventory or canonical ownership changed.

The generated SQL stops if the destination contains any public table, auth user, bucket, or storage object. It creates the source schema from reviewed migrations, applies the ownership lock before the consent schema, and inserts the full original profile without an upsert. Unsafe historical anonymous-write migrations are excluded. All SQL must execute atomically through `apply_migration`; wrap the whole file in a transaction when using SQL Editor or psql. No partial execution.

Use a named bootstrap migration, retain the manifest, and reconcile the new squashed baseline before any future CLI `db push`. Do not replay the historical files or fabricate source migration history. The original historical files remain unchanged in Git.

The last successful source count check still showed one agent, zero auth users, and zero storage objects. Lovable's free-plan MCP query limit prevented refreshing the full row immediately before import. The saved complete snapshot was restored to the empty destination. **A final source delta check is still required before cutover**; stop on changed counts or profile content and reconcile deliberately. Keep synthetic form submissions in isolated tests.

Local verification on October 3 passed in isolated PGlite: exact equality of every restored profile field (including the image and microsecond timestamps), refusal to run on a nonempty destination, no anonymous profile-write privileges, signup-trigger ownership, anonymous intake saving two separate non-grants, and the five-request daily AI quota with client execution denied. No hosted synthetic auth accounts or intake records were created.

## Applied and verified in the destination

- Hosted bootstrap migration: `20261003205343_bootstrap_underwriter_verified_from_lovable`. Bootstrap SHA-256: `83ba2dd3400c69db5db6e9e678306f3ba2cec2238ecd2e6765a508d30824d142`.
- Hosted follow-up: `20261003211036_secure_transferred_functions`, from local `20261003205704_secure_transferred_functions.sql`. The management tool assigns its own applied timestamp. Preserve this mapping rather than replaying it through `db push`.
- Exact hosted JSON comparison confirmed all original profile fields, original ID, image, ownership, and timestamps match the snapshot. Profile remains unowned. Auth users, intake requests, and consent events remain empty.
- All seven application tables have RLS. Anonymous profile INSERT/UPDATE/DELETE privileges are absent; authenticated profile and inbox access remains owner-scoped.
- The three mutable-search-path advisor warnings are fixed. Remaining advisor findings reflect intentional access: validated public `submit_public_intake`, owner-scoped authenticated `my_sms_eligibility`, and server-only tables with no client policies. See [public definer guidance](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated definer guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), and [RLS policy guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Email/Password enabled, email confirmation enabled, anonymous sign-ins disabled. Site URL: `https://www.underwriterverified.com`; exact redirects: `https://www.underwriterverified.com/agent-admin` and `https://underwriterverified.com/agent-admin`.
- `generate-testimonials` deployed ACTIVE, version 1, JWT verification enabled. The handler additionally verifies a real Auth user and owned profile, validates input/output, and limits generation to five attempts per user per UTC day. Provider failures do not expose raw errors or credentials. Generated output always includes fictional-sample labels.
- `AI_API_KEY` has not been supplied. Generation stays unavailable until it is configured as an Edge Function secret; no OpenAI calls or charges were made. Platform-provided Supabase credentials remain server-side.
- The draft frontend now references the new project and public publishable key, uses the new production database allowlist, handles confirmation-required signup, and labels the generation button as samples. Preview intake remains disabled. Vercel environment overrides must still be checked before production cutover.
- Public REST profile GET returns 200; unauthenticated function calls return 401. Inspection of preview commit `79685d6` caught Vercel environment overrides still pointing the API client at Lovable. The disabled-intake notice and sample labels are present. Three config overrides for `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_URL` are now saved only for preview branch `cursor/a2p-consent-intake-c93e`. Existing all-environment values remain unchanged, so production remains on Lovable. Verify the rebuilt preview before it is a migration test.
- Profile saving now explicitly updates the loaded owner-scoped row (or inserts when absent), because the preserved partial `user_id` unique index cannot support the previous PostgREST `onConflict` upsert.
- All 55 tests, TypeScript, changed-file ESLint, and the preview build passed. Function tests use mocked services; real owner sign-in and an authenticated paid generation remain unverified.

## Remaining setup and cutover

1. Recheck the Lovable source after its query limit resets, then reconcile any new data before cutover.
2. Chris must confirm the intended website login email. Account setup and a guarded ownership assignment remain separate from transferring the unowned row. Never delete an auto-created starter profile to clear a conflict.
3. Add an owned OpenAI API key directly as the new project's `AI_API_KEY` Edge Function secret if sample generation is wanted. Do not put it in chat, Git, or a `VITE_*` variable. Verify an authenticated request after account setup; manual testimonials do not require this feature.
4. Verify the draft deployment's destination, original public profile, and nested routes. Verify real sign-in, owner editing/inbox, and consent persistence only in the approved workflow. Preserve production/preview separation and resolve old preview access.
5. Obtain approval for the exact PR head, owner assignment, Vercel production configuration, and cutover. Rebuild production with its correct target. Keep the Lovable backend intact for rollback and reconcile any post-cutover data before rolling back.

No production environment, DNS, source data, AgentFlow resource, Twilio registration, messaging, or phone numbers were changed during this preparation.

Official migration references: [Lovable external deployment](https://docs.lovable.dev/tips-tricks/external-deployment-hosting) and [Lovable data export](https://docs.lovable.dev/features/advanced-settings). A full database export can also preserve auth password hashes if accounts are added before cutover; storage files are separate. Use the current inventory rather than assuming it stays empty.
