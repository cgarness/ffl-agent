import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle } from "lucide-react";
import { useLegalPaths } from "@/hooks/useLegalPaths";
import SmsConsentCopy from "@/components/SmsConsentCopy";

const phoneRegex = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.string().trim().min(1, "Phone number is required").regex(phoneRegex, "Enter a valid US phone number"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(255),
  contactConsent: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookCallFormProps {
  agentName: string;
  agencyName: string;
}

const BookCallForm: React.FC<BookCallFormProps> = ({ agentName, agencyName }) => {
  const [submitted, setSubmitted] = useState(false);
  const { privacy, terms } = useLegalPaths();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      contactConsent: false,
    },
  });

  const onSubmit = (_data: FormValues) => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-accent" />
        <h2 className="text-2xl font-bold text-foreground">Thank you!</h2>
        <p className="text-muted-foreground">
          {agentName} will be in touch shortly to schedule your call.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 555-5555" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* A2P Consent — strict opt-in language */}
        <div className="mt-8 pt-6 border-t border-border space-y-3">
          <FormField
            control={form.control}
            name="contactConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <div className="space-y-1">
                  <Label
                    className="text-sm font-normal leading-snug cursor-pointer"
                    onClick={() => field.onChange(!field.value)}
                  >
                    I expressly consent to receive calls and SMS/text messages from{" "}
                    <strong>{agentName}</strong> and <strong>{agencyName}</strong> (optional)
                  </Label>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <SmsConsentCopy
            agentName={agentName}
            agencyName={agencyName}
            privacyHref={privacy}
            termsHref={terms}
          />
        </div>

        <Button type="submit" variant="hero" size="xl" className="w-full">
          Request a Call
        </Button>
      </form>
    </Form>
  );
};

export default BookCallForm;
