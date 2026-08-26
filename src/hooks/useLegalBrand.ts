import { useParams } from "react-router-dom";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { DEFAULT_BRAND } from "@/lib/a2pBrand";

export type LegalBrand = {
  name: string;
  agency: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
};

export function useLegalBrand() {
  const { agencySlug, agentSlug } = useParams<{ agencySlug: string; agentSlug: string }>();
  const scoped = Boolean(agencySlug && agentSlug);
  const query = useAgentProfile(agencySlug, agentSlug);

  const brand: LegalBrand = query.data
    ? {
        name: query.data.name || DEFAULT_BRAND.name,
        agency: query.data.agency || DEFAULT_BRAND.agency,
        phone: query.data.phone || DEFAULT_BRAND.phone,
        email: query.data.email || DEFAULT_BRAND.email,
        addressLine1: DEFAULT_BRAND.addressLine1,
        addressLine2: DEFAULT_BRAND.addressLine2,
      }
    : { ...DEFAULT_BRAND };

  return {
    brand,
    scoped,
    profileHref: scoped ? `/${agencySlug}/${agentSlug}` : "/",
    isLoading: scoped && query.isLoading,
    notFound: scoped && !query.isLoading && (query.isError || !query.data),
  };
}
