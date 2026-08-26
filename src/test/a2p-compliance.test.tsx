import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AgentDataProvider } from "@/contexts/AgentDataContext";
import SmsOptInForm from "@/components/SmsOptInForm";
import Footer from "@/components/Footer";
import LegalSection from "@/components/LegalSection";
import ContactSection from "@/components/ContactSection";
import Landing from "@/pages/Landing";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { useLegalPaths } from "@/hooks/useLegalPaths";
import { SMS_NON_SHARING_STATEMENT } from "@/lib/a2pBrand";

function renderWithProviders(ui: ReactElement, path = "/") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <AgentDataProvider>
        <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
      </AgentDataProvider>
    </QueryClientProvider>
  );
}

describe("A2P campaign surfaces", () => {
  it("shows required SMS opt-in disclosures on the quote form", () => {
    renderWithProviders(<SmsOptInForm />);

    expect(screen.getAllByText(/Christopher Garness/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CG Financial/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/message and data rates may apply/i)).toBeInTheDocument();
    expect(screen.getByText(/message frequency may vary/i)).toBeInTheDocument();
    expect(screen.getByText(/STOP/)).toBeInTheDocument();
    expect(screen.getByText(/HELP/)).toBeInTheDocument();
    expect(screen.getByText(/consent is not required/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(screen.getByRole("link", { name: /terms and conditions/i })).toHaveAttribute(
      "href",
      "/terms-and-conditions"
    );
  });

  it("puts privacy and terms links in the agent footer", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms and conditions/i })).toBeInTheDocument();
    expect(screen.getByText(/reply STOP to opt out/i)).toBeInTheDocument();
  });

  it("does not collect a phone number on the contact form", () => {
    renderWithProviders(<ContactSection />);

    expect(document.querySelector('input[type="tel"]')).toBeNull();
    expect(screen.getByText(/does not opt you in to text messages/i)).toBeInTheDocument();
  });

  it("points to one privacy policy instead of a second conflicting copy", () => {
    renderWithProviders(<LegalSection />);

    expect(screen.queryByText(/March 27, 2026/)).not.toBeInTheDocument();
    expect(screen.getByText(/Messaging Program/i)).toBeInTheDocument();
    expect(screen.getByText(SMS_NON_SHARING_STATEMENT)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the terms and conditions/i })).toBeInTheDocument();
  });

  it("brands the homepage as a directory, not an SMS sender", () => {
    renderWithProviders(<Landing />);

    expect(screen.getAllByText(/Underwriter Verified/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/FFL Agent/i)).not.toBeInTheDocument();
    expect(screen.getByText(/does not send text messages/i)).toBeInTheDocument();
  });

  it("keeps the public privacy policy on CG Financial", () => {
    renderWithProviders(<PrivacyPolicy />);

    expect(screen.getByRole("heading", { name: /privacy policy for cg financial/i })).toBeInTheDocument();
    expect(screen.getByText(SMS_NON_SHARING_STATEMENT)).toBeInTheDocument();
    expect(screen.getByText(/message frequency varies/i)).toBeInTheDocument();
  });

  it("scopes legal URLs to the agent profile path", () => {
    function Probe() {
      const { privacy, terms } = useLegalPaths();
      return (
        <div>
          <span>{privacy}</span>
          <span>{terms}</span>
        </div>
      );
    }

    render(
      <MemoryRouter initialEntries={["/cg-financial/christopher-garness"]}>
        <Routes>
          <Route path="/:agencySlug/:agentSlug" element={<Probe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("/cg-financial/christopher-garness/privacy-policy")
    ).toBeInTheDocument();
    expect(
      screen.getByText("/cg-financial/christopher-garness/terms-and-conditions")
    ).toBeInTheDocument();
  });
});
