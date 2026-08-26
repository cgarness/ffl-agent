import { useParams } from "react-router-dom";

export function useLegalPaths() {
  const { agencySlug, agentSlug } = useParams<{ agencySlug: string; agentSlug: string }>();

  if (agencySlug && agentSlug) {
    return {
      privacy: `/${agencySlug}/${agentSlug}/privacy-policy`,
      terms: `/${agencySlug}/${agentSlug}/terms-and-conditions`,
    };
  }

  return {
    privacy: "/privacy-policy",
    terms: "/terms-and-conditions",
  };
}
