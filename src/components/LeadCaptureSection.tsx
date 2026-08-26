import SmsOptInForm from "@/components/SmsOptInForm";

export default function LeadCaptureSection() {
  return (
    <section id="free-quote" className="py-16 bg-muted/40">
      <div className="container max-w-xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2">
          Get Your Free Life Insurance Quote
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Fill out the form below and we'll be in touch shortly. Checking the SMS box is optional
          and is not required to request a quote.
        </p>
        <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 border border-border">
          <SmsOptInForm />
        </div>
      </div>
    </section>
  );
}
