-- Fix accidental double space in demo agent display name for A2P brand consistency.
UPDATE public.agents
SET
  name = regexp_replace(trim(name), '\s+', ' ', 'g'),
  first_name = regexp_replace(trim(first_name), '\s+', ' ', 'g'),
  last_name = regexp_replace(trim(last_name), '\s+', ' ', 'g')
WHERE agency_slug = 'cg-financial'
  AND slug = 'christopher-garness'
  AND name ~ '\s{2,}';
