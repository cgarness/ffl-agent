import { useState } from "react";
import { CalendarDays, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAgentData } from "@/contexts/AgentDataContext";

export default function ContactSection() {
  const ref = useScrollReveal();
  const { data } = useAgentData();

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="container" ref={ref}>
        <h2 className="text-balance text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Let's Build Your Plan
        </h2>
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center">
            <Button variant="hero" size="xl" className="w-full md:w-fit" asChild>
              <a href={data.calendarUrl}>
                <CalendarDays size={20} />
                Book on My Calendar
              </a>
            </Button>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Want a call or text instead? Use the quote form above and check the optional SMS box.
              This message form does not opt you in to text messages.
            </p>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4 rounded-2xl bg-card p-7 shadow-sm ring-1 ring-border/60"
    >
      <FormInput name="name" placeholder="Your Name" value={form.name} onChange={handleChange} />
      <FormInput name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
      <textarea
        name="message"
        rows={4}
        placeholder="How can I help?"
        value={form.message}
        onChange={handleChange}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="text-xs text-muted-foreground">
        Submitting this form does not subscribe you to SMS. Reply STOP on any text to opt out.
      </p>
      <Button variant="hero" size="lg" type="submit" className="w-full">
        <Send size={16} />
        Send Message
      </Button>
    </form>
  );
}

function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
