import { Link } from "react-router-dom";

interface SmsConsentCopyProps {
  agentName: string;
  agencyName: string;
  privacyHref: string;
  termsHref: string;
}

export default function SmsConsentCopy({
  agentName,
  agencyName,
  privacyHref,
  termsHref,
}: SmsConsentCopyProps) {
  return (
    <p className="text-xs text-muted-foreground leading-relaxed">
      <strong>Opt-In:</strong> By checking this box, I provide my express written consent to
      receive telephone calls (including calls using an automatic telephone dialing system or an
      artificial or prerecorded voice) and recurring SMS/MMS text messages from{" "}
      <strong>{agentName}</strong> and <strong>{agencyName}</strong> at the phone number provided
      above, including for marketing purposes. Consent is not required to receive a quote or book a
      call. Message and data rates may apply. Message frequency may vary. I may revoke this consent
      at any time by replying STOP to any message or by contacting us directly. Reply HELP for help.
      I have read and agree to the{" "}
      <Link to={privacyHref} className="underline underline-offset-2 hover:text-accent">
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link to={termsHref} className="underline underline-offset-2 hover:text-accent">
        Terms and Conditions
      </Link>
      .
    </p>
  );
}
