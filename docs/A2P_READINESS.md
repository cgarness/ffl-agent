# A2P 10DLC readiness draft — Christopher Garness / CG Financial

Review only. Nothing in this change was submitted to Twilio. This is not an approval, and it does not choose a Brand tier.

Production site: https://www.underwriterverified.com

The website and database in `cgarness/ffl-agent` are this directory site’s own Supabase project (`rtgmdbqzkwlmplurypyh` in `supabase/config.toml`). They are not the AgentFlow database. This repository does not send SMS.

## Campaign description

CG Financial, operated by Christopher Garness, an independent life insurance agent, offers two optional website checkboxes. The informational checkbox covers recurring SMS/MMS about a quote the person requested, appointments, and application or policy updates. The marketing checkbox is a separate choice covering recurring SMS/MMS about life insurance products and coverage reviews. A quote or call request can be submitted with either or both boxes left unchecked. Providing a phone number, requesting a call, or accepting the privacy policy or terms does not grant text permission. This website records the choices. It does not itself send text messages. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help.

Suggested use case if Chris later registers one campaign for both kinds of messages: Mixed, with sub-use cases Customer Care and Marketing. Do not submit that choice until the business identity and Twilio account below are confirmed. Do not use the Sole Proprietor Brand route just because Chris works independently. Sole Proprietor vs Standard depends on the EIN and the current Brand rules, which are not verified here.

## Message flow and opt-in routes

Only website forms are implemented. There is no keyword, paper, verbal, QR, or Facebook opt-in in this repository. Do not tell Twilio that Facebook instant-form consent is covered. Chris must confirm whether any non-website source exists. Until then those sources are pending and are not part of this flow.

Each implemented route shows two unchecked boxes, the frequency and rate disclosures, STOP and HELP, the statement that SMS consent is not required to request a quote, request a call, or purchase insurance, the carrier delivery disclaimer, and links to that agent’s privacy policy and terms.

1. Dedicated quote page for this brand only: https://www.underwriterverified.com/sms-opt-in  
   The server accepts this path only for agency slug `cg-financial` and agent slug `christopher-garness`. Another agency’s identity is rejected. The visitor completes the quote form and may check one box, both, or neither.

2. Quote section on the agent profile: https://www.underwriterverified.com/cg-financial/christopher-garness  
   Same two boxes. The names on the boxes come from the agent row for that profile, resolved again on the server from the page path.

3. Call request: https://www.underwriterverified.com/cg-financial/christopher-garness/bookcall and the `/book` alias.  
   Same two boxes. Submitting a call request does not grant SMS permission unless a box is checked, and the confirmation says the call is not yet scheduled.

Not opt-in methods: the “Get in touch” section on the profile (it now only links to the quote form and the call request form and does not collect anything), the calendar link, and a `sms:` link that only opens the visitor’s own texting app. Following a link never records SMS consent; only the two checkboxes on the quote and call forms do.

Privacy policy: https://www.underwriterverified.com/cg-financial/christopher-garness/privacy-policy  
Terms: https://www.underwriterverified.com/cg-financial/christopher-garness/terms-and-conditions  
Effective date of the current policy text: September 29, 2026. The April 15, 2026 wording is archived in `docs/legal/`.

## Exact consent language

Informational:

> I agree to receive recurring informational SMS/MMS from Christopher Garness and CG Financial about my requested quote, appointments, and application or policy updates.

Marketing:

> I agree to receive recurring marketing SMS/MMS from Christopher Garness and CG Financial about life insurance products and coverage reviews.

Shared disclosure:

> Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. SMS consent is not required to request a quote, request a call, or purchase insurance. Carriers are not liable for any delayed or undelivered messages.

Disclosure version stored with each choice: `2026-09-29-separate-sms`.

A saved submission writes two consent events, one per purpose, with `granted` or `not_granted`. `not_granted` means this submission added no new grant. It does not erase an earlier grant. The server copies the disclosure text, sender name, policy URLs, and policy effective date from its own records. Client-supplied consent text and timestamps are not accepted.

## Sample messages

Embedded link: yes. Embedded phone number: yes. The samples below are the intended content if a sender is connected later. This website does not send them.

1. Requested-quote response (informational):  
   CG Financial: [FirstName], we received your life insurance quote request. Christopher Garness will follow up about that request. Call 909-775-6963 or visit https://www.underwriterverified.com/cg-financial/christopher-garness/bookcall. Reply STOP to opt out. Msg & data rates may apply.

2. Appointment reminder (informational):  
   CG Financial: Reminder, your appointment with Christopher Garness is [Date] at [Time]. Details: https://www.underwriterverified.com/cg-financial/christopher-garness. Reply STOP to opt out. Reply HELP for help.

3. Application or policy update (informational):  
   CG Financial: [FirstName], there is an update on your life insurance application. Call 909-775-6963 with questions. Reply STOP to opt out. Msg & data rates may apply.

4. Marketing:  
   CG Financial: [FirstName], Christopher Garness can review life insurance coverage options with you. Visit https://www.underwriterverified.com/cg-financial/christopher-garness or call 909-775-6963. Reply STOP to opt out. Reply HELP for help.

The appointment sample is the wording for a reminder after a time has actually been scheduled. The website does not book that time by itself, and the call form does not say an appointment is confirmed.

## STOP and HELP

Shown on the forms, footer, privacy policy, and terms: reply STOP to opt out and HELP for help. Support contact on the policy is 909-775-6963 and chris@fflagent.com.

What is implemented in this repository:

- `public.record_sms_suppression` can store a STOP or provider block for one agent and phone. It is not granted to the public site key. A repeated call does not delete the row.
- `public.evaluate_sms_eligibility` returns `suppressed` when that row exists, even if a later form records a grant. It returns `granted` only when that purpose has a grant and no suppression. Informational and marketing are checked separately.
- An unchecked box on a later visit does not delete a prior grant and does not delete a STOP.
- There is no re-enrollment tool. Clearing a STOP would require a new, explicit process. Deleting the suppression row is blocked by a database trigger.

What is not verified and must not be described as done:

- No Twilio webhook is implemented here, and Twilio Advanced Opt-Out / default STOP replies were not inspected. No Twilio configuration was changed.
- HELP has no application auto-reply. If Twilio’s default replies are turned on later, this application should not also send STOP or HELP replies.
- There is no outbound sender and no message queue in this repository, so queued-send rechecking cannot be demonstrated against a live queue. Any future sender, including AgentFlow, has to call `evaluate_sms_eligibility` at send time.

## Where a request can be retrieved

A signed-in agent opens `/agent-admin`. The “Quote and call requests” section reads `intake_requests` and `sms_consent_events` for the agent row whose `user_id` matches that login. Visitors cannot read those tables. One agent cannot read another agent’s rows.

The inbox loads 25 requests at a time, newest first (ties broken by id), with “Load older requests”, Refresh, and a retry button on error. The consent choices shown on each row are the choices recorded at submission time. They are historical evidence, not proof that a text may be sent today; a later STOP, a later submission, or a provider block can override an earlier choice, and only `evaluate_sms_eligibility` answers the send-time question.

AgentFlow delivery is not connected. A saved row in this site’s database is not a lead inside AgentFlow.

## Agent profile ownership (corrected before intake can go live)

Inherited problem: migration `20260416003500_allow_anon_admin_writes.sql` created policies named “Anyone can insert agents (anon)” and “Anyone can update agents (anon)”. Migration `20260506175748` later dropped the un-suffixed names (“Anyone can insert agents” / “Anyone can update agents”) and added owner-only policies, so the anon policies stayed in effect. Because RLS policies are permissive, the anon site key could still create agent profiles and change any profile’s `user_id`, which would let an anonymous visitor take over the profile that the intake tables key on.

Fix: forward migration `20260929203000_lock_agent_ownership.sql`. It does not edit the historical migration. It:

- drops the two anon write policies (and the legacy names, if any still exist);
- revokes INSERT/UPDATE/DELETE on `public.agents` from `anon` and grants only SELECT, so public profile pages keep working;
- keeps owner-only INSERT/UPDATE/DELETE policies for `authenticated` (`auth.uid() = user_id`);
- adds a trigger, `agents_protect_ownership`, that rejects any change to `user_id` made by `anon` or `authenticated`. Reassigning ownership is only possible with the service role, on purpose, by an administrator.

Signup provisioning (`handle_new_agent_user` on `auth.users`) is unchanged and still creates a profile owned by the new login.

What this migration does not do: it does not touch the existing production agent row or its `user_id`. Whether that row belongs to the login Chris actually uses at `/agent-admin` has to be confirmed by Chris after deploy. It must not be reassigned to a guessed account.

Hosted verification: partial, read-only, with the public site key. The production row `e7c2f35a-e215-4e9e-9492-176a344384eb` (`cg-financial/christopher-garness`) currently has **`user_id = NULL`** — no login owns it — and the anon key still holds update/delete grants on `public.agents`. Neither migration is applied yet. The full policy list and migration history could not be read because authenticated project access (Supabase MCP / CLI) was unavailable. The correction steps, the exact catalog checks, and the release order are in `docs/RELEASE_PREFLIGHT.md`.

## Three different kinds of “ready”

1. Website intake and consent storage — code complete in this branch, verified locally against a disposable PostgreSQL database behind a real PostgREST process (`scripts/integration-postgrest.sh`) and in a browser against that stack. Not deployed. The hosted database does not yet have the migrations, the canonical profile has no owner, and the production frontend still shows the old combined checkbox.
2. Twilio registration readiness — the draft text in this document is ready for Chris to review. Legal name, EIN, structure, volume, account, and non-website opt-in sources are still missing. Nothing has been submitted to Twilio.
3. Operational readiness to send — not ready. No sender exists in this repository. AgentFlow is a separate system with its own database; no code in this repository connects to it, and no existing mechanism to share consent with it was found here. Do not describe AgentFlow as using this site’s `evaluate_sms_eligibility` until that integration is built and verified.

## Still needed from Chris

- Exact IRS legal business name and EIN. Not guessed.
- Legal business structure. Not guessed, and not assumed to be Sole Proprietor.
- Confirmation that the filing contact is Christopher Garness, chris@fflagent.com, 909-775-6963, 6768 Regal Park Dr, Fontana, CA 92336. These are the public website details only.
- Approximate daily SMS volume.
- Which Twilio account or subaccount, existing Brand, Messaging Service, and sending numbers to use.
- Whether any opt-in source besides the three website routes exists, including Facebook.
- Confirmation that the production agent row is owned by the login Chris uses at `/agent-admin`, after the migration is applied.

## Registration route

Not selected. Apply the migration to the site database, confirm the EIN, then decide Standard vs another Brand type from Twilio’s current rules. Do not submit a Brand, Campaign, Trust Hub profile, or phone number as part of this work.
