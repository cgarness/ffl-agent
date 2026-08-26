import { Link } from "react-router-dom";
import { useLegalPaths } from "@/hooks/useLegalPaths";

interface LegalNavLinksProps {
  className?: string;
}

export default function LegalNavLinks({ className }: LegalNavLinksProps) {
  const { privacy, terms } = useLegalPaths();

  return (
    <nav className={className ?? "flex items-center justify-center gap-4 text-xs text-muted-foreground"}>
      <Link to={privacy} className="hover:text-accent transition-colors underline-offset-4 hover:underline">
        Privacy Policy
      </Link>
      <span aria-hidden="true">·</span>
      <Link to={terms} className="hover:text-accent transition-colors underline-offset-4 hover:underline">
        Terms and Conditions
      </Link>
    </nav>
  );
}
