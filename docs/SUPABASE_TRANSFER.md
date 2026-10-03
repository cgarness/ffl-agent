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
- All 55 tests, TypeScript, changed-file ESLint, and the preview build passed. Function tests use mocked services; real owner sign-in and an authenticated paid generation remain unverified.

## Remaining setup and cutover

1. Recheck the Lovable source after its query limit resets, then reconcile any new data before cutover.
2. Chris must confirm the intended website login email. Account setup and a guarded ownership assignment remain separate from transferring the unowned row. Never delete an auto-created starter profile to clear a conflict.
3. Add an owned OpenAI API key directly as the new project's `AI_API_KEY` Edge Function secret if sample generation is wanted. Do not put it in chat, Git, or a `VITE_*` variable. Verify an authenticated request after account setup; manual testimonials do not require this feature.
4. Verify the draft deployment's destination, original public profile, and nested routes. Verify real sign-in, owner editing/inbox, and consent persistence only in the approved workflow. Preserve production/preview separation and resolve old preview access.
5. Obtain approval for the exact PR head, owner assignment, Vercel production configuration, and cutover. Rebuild production with its correct target. Keep the Lovable backend intact for rollback and reconcile any post-cutover data before rolling back.

No production environment, DNS, source data, AgentFlow resource, Twilio registration, messaging, or phone numbers were changed during this preparation.

Official migration references: [Lovable external deployment](https://docs.lovable.dev/tips-tricks/external-deployment-hosting) and [Lovab…1121 tokens truncated…estimonials, setGeneratingTestimonials] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(null);
  const [agencySlug, setAgencySlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/agent-admin/login");
      return;
    }

    const loadAgent = async () => {
      setLoadingProfile(true);
      const { data: existingAgent, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        toast.error("Unable to load your profile.");
        setLoadingProfile(false);
        return;
      }

      if (existingAgent) {
        const loadedForm: AgentData = {
          name: existingAgent.name,
          firstName: existingAgent.first_name,
          lastName: existingAgent.last_name,
          phone: existingAgent.phone,
          email: existingAgent.email,
          agency: existingAgent.agency,
          npn: existingAgent.npn,
          bio: existingAgent.bio,
          shortBio: existingAgent.short_bio,
          headshotUrl: existingAgent.headshot_url,
          calendarUrl: existingAgent.calendar_url,
          stateLicenses: existingAgent.state_licenses as string[],
          testimonials: existingAgent.testimonials as { quote: string; name: string }[],
        };
        setAgentId(existingAgent.id);
        setAgentSlug(existingAgent.slug);
        setAgencySlug(existingAgent.agency_slug);
        setForm(loadedForm);
        setLicenses(loadedForm.stateLicenses.map(parseLicense));
        updateData(loadedForm);
      }

      setLoadingProfile(false);
    };

    void loadAgent();
  }, [user, authLoading, navigate, updateData]);


  const set = (field: keyof AgentData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setNameField = (field: "firstName" | "lastName", value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      updated.name = `${updated.firstName} ${updated.lastName}`.trim();
      return updated;
    });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setForm((prev) => ({ ...prev, phone: formatted }));
  };

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, headshotUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be signed in to save.");
      return;
    }
    const updatedForm = {
      ...form,
      stateLicenses: licenses
        .filter((l) => l.state && l.number)
        .map(formatLicense),
    };

    const nextAgentSlug = slugify(updatedForm.name);
    const nextAgencySlug = slugify(updatedForm.agency);

    if (!nextAgentSlug || !nextAgencySlug) {
      toast.error("First name, last name, and agency are required before saving.");
      return;
    }

    setSavingProfile(true);
    try {
      const { data: persistedAgent, error } = await supabase
        .from("agents")
        .upsert(
          {
            id: agentId ?? undefined,
            user_id: user.id,
            slug: nextAgentSlug,
            agency_slug: nextAgencySlug,
            name: updatedForm.name,
            first_name: updatedForm.firstName,
            last_name: updatedForm.lastName,
            phone: updatedForm.phone,
            email: updatedForm.email,
            agency: updatedForm.agency,
            npn: updatedForm.npn,
            bio: updatedForm.bio,
            short_bio: updatedForm.shortBio,
            headshot_url: updatedForm.headshotUrl,
            calendar_url: updatedForm.calendarUrl,
            state_licenses: updatedForm.stateLicenses,
            testimonials: updatedForm.testimonials,
          },
          { onConflict: "user_id" }
        )
        .select("id, slug, agency_slug")
        .single();

      if (error) throw error;

      updateData(updatedForm);
      setAgentId(persistedAgent.id);
      setAgentSlug(persistedAgent.slug);
      setAgencySlug(persistedAgent.agency_slug);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Profile saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please check your admin session.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Licenses
  const addLicense = () => setLicenses((prev) => [...prev, { state: "", number: "" }]);
  const removeLicense = (i: number) => setLicenses((prev) => prev.filter((_, idx) => idx !== i));
  const updateLicense = (i: number, field: keyof StateLicense, value: string) => {
    setLicenses((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  // Testimonials
  const updateTestimonial = (index: number, field: "quote" | "name", value: string) => {
    const updated = [...form.testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, testimonials: updated }));
  };
  const addTestimonial = () =>
    setForm((prev) => ({ ...prev, testimonials: [...prev.testimonials, { quote: "", name: "" }] }));
  const removeTestimonial = (index: number) =>
    setForm((prev) => ({ ...prev, testimonials: prev.testimonials.filter((_, i) => i !== index) }));

  const generateTestimonials = async () => {
    setGeneratingTestimonials(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-testimonials", {
        body: { agentName: form.name, bio: form.bio },
      });
      if (error) throw error;
      if (result?.testimonials) {
        setForm((prev) => ({ ...prev, testimonials: result.testimonials }));
        toast.success("Fictional samples generated. Replace them with authentic client feedback before publishing.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate testimonials. Please try again.");
    } finally {
      setGeneratingTestimonials(false);
    }
  };

  const availableStates = US_STATES.filter(
    (s) => !licenses.some((l) => l.state === s)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Site
          </button>
          <h1 className="text-lg font-bold text-foreground">Agent Dashboard</h1>
          <div className="flex items-center gap-2">
            {agencySlug && agentSlug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${agencySlug}/${agentSlug}`, "_blank")}
              >
                <ExternalLink size={14} />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/agent-admin/login");
              }}
            >
              <LogOut size={14} />
              Sign out
            </Button>
            <Button onClick={handleSave} variant="hero" size="default" disabled={loadingProfile || savingProfile}>
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
              {savingProfile ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {loadingProfile ? (
        <div className="container flex max-w-2xl items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading saved profile...
        </div>
      ) : (
        <div className="container max-w-2xl py-10 space-y-10">
          <IntakeRequestsPanel />
          {/* Personal Info */}
          <Section title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <Input value={form.firstName} onChange={(e) => setNameField("firstName", e.target.value)} />
              </Field>
              <Field label="Last Name">
                <Input value={form.lastName} onChange={(e) => setNameField("lastName", e.target.value)} />
              </Field>
            </div>
            <Field label="Display Name">
              <Input value={form.name} disabled className="bg-muted text-muted-foreground" />
            </Field>
            <Field label="Phone Number">
              <Input
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(555) 814-2937"
              />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Agency Name">
              <Input value={form.agency} onChange={(e) => set("agency", e.target.value)} placeholder="e.g. Rivera Insurance Group" />
            </Field>
            <Field label="Calendar Booking URL">
              <Input value={form.calendarUrl} onChange={(e) => set("calendarUrl", e.target.value)} placeholder="https://calendly.com/..." />
            </Field>
            <Field label="Headshot Photo">
              <div className="flex items-center gap-4">
                {form.headshotUrl && (
                  <img
                    src={form.headshotUrl}
                    alt="Headshot preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                  />
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeadshotUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload size={16} />
                    {form.headshotUrl ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </Field>
          </Section>

          {/* Bio */}
          <Section title="Bio & About">
            <Field label="Short Bio (under profile photo)">
              <Textarea value={form.shortBio} onChange={(e) => set("shortBio", e.target.value)} rows={3} />
            </Field>
            <Field label="About Me">
              <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={6} />
            </Field>
          </Section>

          {/* Credentials */}
          <Section title="Licenses & Credentials">
            <Field label="National Producer Number (NPN)">
              <Input value={form.npn} onChange={(e) => set("npn", e.target.value)} />
            </Field>
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">State Licenses</Label>
              {licenses.map((lic, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={lic.state}
                    onChange={(e) => updateLicense(i, "state", e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">State</option>
                    {[...(lic.state ? [lic.state] : []), ...availableStates].sort().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Input
                    value={lic.number}
                    onChange={(e) => updateLicense(i, "number", e.target.value)}
                    placeholder="License #"
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeLicense(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button variant="outline" onClick={addLicense} className="w-full">
                <Plus size={16} />
                Add State License
              </Button>
            </div>
          </Section>

          {/* Testimonials */}
          <Section title="Client Testimonials">
            <div className="space-y-6">
              <Button
                variant="outline"
                onClick={generateTestimonials}
                disabled={generatingTestimonials}
                className="w-full border-accent text-accent hover:bg-accent/10"
              >
                {generatingTestimonials ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generatingTestimonials ? "Generating..." : "Generate sample testimonials"}
              </Button>
              {form.testimonials.map((t, i) => (
                <div key={i} className="rounded-xl bg-card p-5 ring-1 ring-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Testimonial {i + 1}</span>
                    <button
                      onClick={() => removeTestimonial(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Field label="Client Name">
                    <Input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="Sarah M." />
                  </Field>
                  <Field label="Quote">
                    <Textarea value={t.quote} onChange={(e) => updateTestimonial(i, "quote", e.target.value)} rows={3} />
                  </Field>
                </div>
              ))}
              <Button variant="outline" onClick={addTestimonial} className="w-full">
                <Plus size={16} />
                Add Testimonial
              </Button>
            </div>
          </Section>

          <Button onClick={handleSave} variant="hero" size="lg" className="w-full" disabled={savingProfile}>
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {savingProfile ? "Saving..." : saved ? "Saved!" : "Save All Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="mt-1.5 h-0.5 w-10 rounded-full bg-accent" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
