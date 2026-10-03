# Underwriter Verified: Lovable Cloud transfer

Prepared October 3, 2026. The destination organization is created; the project and migration are not yet applied. Production cutover still needs approval. Do not operate on any AgentFlow resource.

## Confirmed targets

| Resource | Identity |
|---|---|
| Lovable source | Underwriter Verified, project `6ab991ff-a95a-4825-ac82-d10ad1e01aca` |
| Source backend | `rtgmdbqzkwlmplurypyh`, owned by Lovable Cloud |
| New destination organization | Underwriter Verified, `bmuykmwtwicpltmpenqm`, Free plan |
| Destination project | Not created yet; verify it belongs to the organization above before every write |
| Explicitly excluded | AgentFlow organization `kuzfuinlgtbfkdhlztxn` and project `jncvvsvckxhqgqvkppmj` |

The Supabase connection can inspect the new organization. Its project-cost/provisioning operation returned unavailable. Dashboard project creation requires the user to enter a new database password. Keep that password out of chat, Git, and screenshots.

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

Re-query the source immediately before importing and again before cutover. Stop on any changed count or profile content and refresh the snapshot deliberately. Compare destination fields, original UUID, JSON, timestamps, and headshot hash to the source. Check RLS, grants, triggers, function privileges, and immutable consent behavior. Keep synthetic form submissions in isolated tests.

Local verification on October 3 passed in isolated PGlite: exact equality of every restored profile field (including the image and microsecond timestamps), refusal to run on a nonempty destination, no anonymous profile-write privileges, signup-trigger ownership, and anonymous intake saving two separate non-grants. Script syntax and Git whitespace checks also passed. This is not hosted Supabase, Auth delivery, Edge Function, or browser verification.

## Remaining setup and cutover

1. Create an isolated project in the exact new organization. Use a US region appropriate for the site's users (US West is the proposed default). Keep the Free plan unless a paid option is explicitly approved.
2. Apply the validated atomic bootstrap to the new empty project and verify it. Re-run hosted RLS/ownership/intake checks against this destination only.
3. Configure Email/Password auth, production site URL, and exact redirect URLs. Keep email confirmation enabled. No imported auth accounts exist. Chris must confirm the intended website login; account setup and a guarded ownership assignment remain separate from transferring the unowned row. Never delete an auto-created starter profile to clear a conflict.
4. Replace the Lovable AI gateway dependency before deploying `generate-testimonials`. The supplied OpenAI replacement needs an owned `AI_API_KEY`, explicit user authentication, input/output validation, and appropriate usage limits. Do not expose provider keys in `VITE_*` or deploy an unauthenticated paid endpoint. Generated examples must not be presented as real client reviews. This feature is not deployed or configured by the transfer package.
5. After the destination is verified, update `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` in the appropriate frontend environment, plus `supabase/config.toml` and the reviewed production-host allowlist in `src/lib/intakeEnvironment.ts`. Prepare these using the real new project ref; no guessed values.
6. Verify a test deployment and the original public profile, sign-in, owner editing/inbox, nested routes, and consent persistence. Preserve production/preview separation. Resolve old preview access before any testing.
7. Obtain approval for the exact PR head, owner assignment, Vercel production configuration, and cutover. Rebuild production with its correct target. Keep the Lovable backend intact for rollback and reconcile any post-cutover data before rolling back.

No production environment, DNS, source data, AgentFlow resource, Twilio registration, messaging, or phone numbers were changed during this preparation.

Official migration references: [Lovable external deployment](https://docs.lovable.dev/tips-tricks/external-deployment-hosting) and [Lovable data export](https://docs.lovable.dev/features/advanced-settings). A full database export can also preserve auth password hashes if accounts are added before cutover; storage files are separate. Use the current inventory rather than assuming it stays empty.
