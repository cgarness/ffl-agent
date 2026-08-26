import React from "react";
import SmsOptInForm from "@/components/SmsOptInForm";
import LegalNavLinks from "@/components/LegalNavLinks";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DEFAULT_BRAND } from "@/lib/a2pBrand";

const SmsOptIn: React.FC = () => {
  usePageTitle(`SMS Opt-In | ${DEFAULT_BRAND.name} | ${DEFAULT_BRAND.agency}`);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Get Your Free Life Insurance Quote
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {DEFAULT_BRAND.name} | {DEFAULT_BRAND.agency} | Independent Insurance Agent
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <SmsOptInForm />
        </div>

        <LegalNavLinks />
      </div>
    </div>
  );
};

export default SmsOptIn;
