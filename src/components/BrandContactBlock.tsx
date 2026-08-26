import { LegalBrand } from "@/hooks/useLegalBrand";

export default function BrandContactBlock({ brand }: { brand: LegalBrand }) {
  return (
    <div className="text-sm text-muted-foreground leading-relaxed">
      <p>{brand.agency}</p>
      <p>{brand.name}</p>
      <p>{brand.addressLine1}</p>
      <p>{brand.addressLine2}</p>
      <p className="mt-2">Phone: {brand.phone}</p>
      <p>
        Email:{" "}
        <a href={`mailto:${brand.email}`} className="underline underline-offset-2 hover:text-accent">
          {brand.email}
        </a>
      </p>
    </div>
  );
}
