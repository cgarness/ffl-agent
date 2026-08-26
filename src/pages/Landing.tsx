import { Shield, Search, FileCheck, UserCheck, Phone, Building2, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

const steps = [
  { icon: Search, title: "Find Your Agent", desc: "Search by name or follow a verification link sent by your agent." },
  { icon: FileCheck, title: "Review Credentials", desc: "See their NPN, active state licenses, and agency affiliation — all in one place." },
  { icon: UserCheck, title: "Connect With Confidence", desc: "Reach out knowing your agent is properly licensed and verified." },
];

const verifyItems = [
  { icon: BadgeCheck, title: "National Producer Number (NPN)", desc: "Unique identifier assigned to every licensed insurance professional." },
  { icon: FileCheck, title: "State Licenses & Active Status", desc: "Confirmation that your agent holds valid, active licenses in their operating states." },
  { icon: Building2, title: "Agency Affiliation", desc: "Verification of the agency or organization your agent represents." },
  { icon: Phone, title: "Contact Information", desc: "Confirmed contact details so you can reach your agent directly." },
];

export default function Landing() {
  usePageTitle("Underwriter Verified");

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
        <div className="container relative mx-auto flex flex-col items-center px-4 py-24 text-center md:py-32">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Verify Your{" "}
            <span className="text-primary">Insurance Agent</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Confirm your agent is properly licensed, credentialed, and affiliated with a legitimate agency — before you sign anything.
          </p>
          <Button variant="hero" size="xl" className="mt-10 gap-2" asChild>
            <Link to="/search">
              Verify an Agent <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Three simple steps to verify your insurance agent's credentials.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title} className="relative border-border/50 bg-card text-center">
                <CardContent className="flex flex-col items-center p-8">
                  <div className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
                    Step {i + 1}
                  </div>
                  <div className="my-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <step.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Verify */}
      <section className="border-b border-border bg-card py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What We Verify
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Every agent profile is checked against national licensing databases so you can trust who you're working with.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {verifyItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center rounded-xl border border-border/50 bg-background p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Why It Matters
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Purchasing life insurance is one of the most important financial decisions you'll make. Unfortunately, not every person claiming to be a licensed agent actually is. Verifying your agent's credentials protects you from fraud, ensures your policy is legitimate, and gives you peace of mind that you're working with a qualified professional.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="text-2xl font-extrabold text-primary">100%</div>
              <p className="mt-1 text-xs text-muted-foreground">Agents verified against national databases</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="text-2xl font-extrabold text-primary">NPN</div>
              <p className="mt-1 text-xs text-muted-foreground">Unique producer numbers confirmed</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="text-2xl font-extrabold text-primary">50 States</div>
              <p className="mt-1 text-xs text-muted-foreground">License status checked across all jurisdictions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-card py-20 md:py-28">
        <div className="container mx-auto flex flex-col items-center px-4 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Your agent sent you here?{" "}
            <span className="text-primary">That's a good sign.</span>
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Licensed agents who share their verification page are transparent about their credentials. That's the kind of professional you want protecting your family's future.
          </p>
          <Button variant="hero" size="xl" className="mt-8 gap-2" asChild>
            <Link to="/search">
              Find an Agent <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-foreground">Underwriter Verified</p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Underwriter Verified — Helping consumers verify licensed insurance professionals.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">
            This directory does not send text messages. Each agent profile page, including any SMS
            program, is operated by the named licensed agent and agency — not by Underwriter Verified.
          </p>
        </div>
      </footer>
    </div>
  );
}
