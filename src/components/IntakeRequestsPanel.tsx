import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IntakeRow {
  id: string;
  created_at: string;
  form_source: string;
  page_path: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_display: string;
  state: string | null;
  informational: string;
  marketing: string;
  disclosureVersion: string;
  suppressed: boolean;
}

export default function IntakeRequestsPanel() {
  const [rows, setRows] = useState<IntakeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: requests, error: requestError } = await supabase
        .from("intake_requests")
        .select("id, created_at, form_source, page_path, first_name, last_name, email, phone_display, state")
        .order("created_at", { ascending: false })
        .limit(50);

      if (requestError) {
        if (!cancelled) {
          setError("Saved requests are not available yet. Apply the intake migration, then sign in as the agent who owns this profile.");
        }
        return;
      }

      const ids = (requests ?? []).map((row) => row.id);
      const eventsByRequest = new Map<string, Array<{
        purpose: string;
        choice: string;
        disclosure_version_id: string;
        suppressed_at_capture: boolean;
      }>>();

      if (ids.length > 0) {
        const { data: events, error: eventError } = await supabase
          .from("sms_consent_events")
          .select("intake_request_id, purpose, choice, disclosure_version_id, suppressed_at_capture")
          .in("intake_request_id", ids);

        if (eventError) {
          if (!cancelled) setError("Consent evidence could not be loaded.");
          return;
        }

        for (const event of events ?? []) {
          const list = eventsByRequest.get(event.intake_request_id) ?? [];
          list.push(event);
          eventsByRequest.set(event.intake_request_id, list);
        }
      }

      if (cancelled) return;
      setRows(
        (requests ?? []).map((row) => {
          const events = eventsByRequest.get(row.id) ?? [];
          const informational = events.find((event) => event.purpose === "informational");
          const marketing = events.find((event) => event.purpose === "marketing");
          return {
            ...row,
            informational: informational?.choice ?? "missing",
            marketing: marketing?.choice ?? "missing",
            disclosureVersion: informational?.disclosure_version_id ?? marketing?.disclosure_version_id ?? "",
            suppressed: events.some((event) => event.suppressed_at_capture),
          };
        }),
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quote and call requests</h2>
        <div className="mt-1.5 h-0.5 w-10 rounded-full bg-accent" />
      </div>
      <p className="text-sm text-muted-foreground">
        Requests saved from your public pages appear here for the signed-in owner of this profile.
        This screen does not send texts. Delivery into AgentFlow is not connected.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {rows && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No quote or call requests yet.</p>
      )}
      <div className="space-y-3">
        {rows?.map((row) => (
          <article key={row.id} className="space-y-1 rounded-xl border border-border p-4 text-sm">
            <p className="font-medium text-foreground">
              {row.first_name} {row.last_name} · {row.form_source === "call_request" ? "Call request" : "Quote"}
            </p>
            <p className="text-muted-foreground">
              {row.phone_display} · {row.email}
              {row.state ? ` · ${row.state}` : ""}
            </p>
            <p className="text-muted-foreground">{new Date(row.created_at).toLocaleString()} · {row.page_path}</p>
            <p className="text-muted-foreground">
              Informational SMS: {row.informational}. Marketing SMS: {row.marketing}. Version: {row.disclosureVersion || "n/a"}.
            </p>
            {row.suppressed && (
              <p className="text-muted-foreground">A prior opt-out was already on file. This request did not remove it.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
